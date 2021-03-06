import { 
	Simulator, 
	Algorithm 
} from "../Simulator";

interface Process {
	id: string;
	arrival: number;
	cycles: boolean[];
	estimatedDuration: number;
};

interface ProcessSnapshot {
	status: "running" | "blocked";
	id: string;
};

interface ProcessWrap {
	process: Process;

	// indicate when the process received its first and last cycle
	startCycle: number;
	finishCycle: number;

	// current internal cycle
	currentCycle: number;

	// number of CPU cycles received since last arrival
	burstCycles: number;
	
	// current priority
	priority: number;
};

type NextProcess = null | { queue: ProcessWrap[], index: number };

class CPUSimulator extends Simulator {
	// processor status
	private _currentProcess: ProcessWrap | null;
	private _queues: {[key: string]: ProcessWrap[]};
	private _readyQueues: ProcessWrap[][];
	private _cycle: number; // current simulation cycle

	// simulator settings
	private _algorithm: string;
	private _processList: Process[];
	private _quantum: number;
	private _maxQueues: number;
	private _quantumMode: boolean;

	// simulator status
	private _running: boolean;

	// callbacks
	public onQueueChange: (queue: {[key: string]: ProcessWrap[]}) => void;
	public onProcessChange: (process: ProcessWrap | null) => void;
	public onProcessFinish: (process: ProcessWrap) => void;

	constructor() {
		super();

		this._running = false;

		this._algorithm = "fifo";
		this._processList = [];
		this._quantum = 0;
		this._quantumMode = false;
		this._maxQueues = 0;

		this._cycle = 0;
		this._currentProcess = null;

		this._readyQueues = [[]];
		this._queues = {
			incoming: [],
			blocked: [],
			ready: []
		};

		// default callback
		this.onQueueChange = () => {};
		this.onProcessChange = () => {};
		this.onProcessFinish = () => {};
	}

	/**
	 * Adds a process to the process list. It will also be added to the incoming queue
	 * @param process process to be added
	 */
	public addProcess(process: Process) : void {
		this._processList.push(process);
		this._queues.incoming.push(this.createProcessWrap(process));
		this.onQueueChange(this._queues);
	}

	public hasNextStep(): boolean {
		// there will be a next step as long as there is a process on any queue
		// or a process running
		return this._currentProcess != null ||
			Object.values(this._queues).reduce((a, b) => a + b.length, 0) > 0;
	}

	public hasPreviousStep(): boolean {
		throw new Error("Method not implemented.");
	}

	/**
	 * Sets the simulator to its initial state without erasing the processes
	 */
	public reset(): void {
		// simulator is stopped
		this._running = false;
		this.currentProcess = null;

		// clear the queues
		Object.keys(this._queues).map(key => this._queues[key] = []);

		// all processes are in the incoming queue
		this._queues.incoming = this._processList.map(process => this.createProcessWrap(process));
	}
	
	/**
	 * Erases all simulator processes
	 */
	public clear(): void {
		// simulator is stopped
		this._running = false;
		this.currentProcess = null;

		// process list and queues are cleared
		this._processList = [];
		Object.keys(this._queues).map(key => this._queues[key] = []);
	}

	public processNextRequest() : ProcessSnapshot[] {
		// is the first time processing a request?
		if (!this._running) {
			// we must initialize CPU queues with the correct process
			this._cycle = 0;
			this._queues = {
				incoming: this._processList.map(process => this.createProcessWrap(process)),
				ready: [],
				blocked: []
			};
			this._readyQueues = [];
			this._running = true;
		}

		this.updateState();

		// generate processor snapshot
		let events: ProcessSnapshot[] = [];
		if (this._currentProcess != null) {
			events.push({ id: this._currentProcess.process.id, status: "running" });
		}

		this._queues.blocked.map(process => events.push({
			id: process.process.id,
			status: "blocked"
		}));

		return events;
	}

	private updateState() : void {
		// move incoming processes to the ready queue if their arrival is cycle is the current one
		for (let i = 0; i < this._queues.incoming.length; i++) {
			let process = this._queues.incoming[i];
			if (process.process.arrival == this._cycle) {
				// add the process to the ready queue
				this.addProcessToReady(0, process);

				// and remove it from the incoming queue
				this._queues.incoming.splice(i, 1);
			}
		}

		// TODO: update blocked processes and move them to the ready queue
		for (let i = 0; i < this._queues.blocked.length; i++) {
			this._queues.blocked[i].currentCycle++;
			
			if (this._queues.blocked[i].currentCycle >= this._queues.blocked[i].currentCycle) {
				// this process has finished
				// remove it from the blocked queue
				let p: ProcessWrap = this._queues.blocked[i];
				this._queues.blocked.splice(i, 1);

				// and notify its finalization
				this._processFinish(p);
			}else if (!this._queues.blocked[i].currentCycle) {
				// process has finished the IO burst
				// add it to the ready queue
				//this._queues.ready.push(this._queues.blocked[i]);
				this.addProcessToReady(this._queues.blocked[i].priority, this._queues.blocked[i]);
				this._queues.blocked.splice(i, 1);
			}
		}

		// update running process
		if (this._currentProcess != null) {
			let process: ProcessWrap = this._currentProcess;

			// increase cycle counters
			process.currentCycle++;
			process.burstCycles++;

			// if the selected algorithm is preemptive, we might stop the current process
			let newProcess: NextProcess = this.algorithmFunctions[this._algorithm]();

			let cycles = process.process.cycles;
			if (process.currentCycle >= cycles.length) {
				// this process has finished!
				this._processFinish(this._currentProcess);
				this.currentProcess = null;
			} else if (cycles[process.currentCycle]) {
				// TODO: only move the process to the blocked queue if the preemptive policy is enabled
				// this process must go to the blocked queue
				this._queues.blocked.push(process);
				this._currentProcess = null;

				if (this._algorithm == "feedback" && (this._maxQueues == -1 || (this._maxQueues > 0 && process.priority < this._maxQueues))) {
					process.priority++;
				}
			} else if (newProcess != null) {
				// TODO: change priority if the algorithm is feedback
				if (this._algorithm == "feedback" && (this._maxQueues == -1 || (this._maxQueues > 0 && this._currentProcess.priority < this._maxQueues))) {
					this._currentProcess.priority++;
				}

				this.addProcessToReady(this._currentProcess.priority, this._currentProcess);
				this._currentProcess = null;
			}
		}

		if (this._currentProcess == null) {
			// there is no process currently running
			// we must choose a process from the ready queue, if any
			let next: NextProcess = this.algorithmFunctions[this._algorithm]();
			if (next != null) {
				let process = next.queue[next.index];
				next.queue.splice(next.index, 1);
				this._currentProcess = process;

				// if this process hasn't received any CPU burst before, update its
				// start cycle to keep track of the execution time
				if (this._currentProcess.startCycle < 0) {
					this._currentProcess.startCycle = this._cycle;
				}

				// set the burst counter to zero, this process has just arrived at the CPU
				this._currentProcess.burstCycles = 0;
			}
		}

		// this cycle has ended
		this._cycle++;

		this.onQueueChange(this._queues);
	}

	/**
	 * Selects a process from the ready queue to be executed using the
	 * FIFO algorithm
	 * If there isn't any available process, it will return a null value
	 */
	private FIFO() : NextProcess {
		let process: NextProcess = null;

		// this algorithm, by default, is not preemptive
		// if there is a process running, this must be executed until it's completed
		if (this._currentProcess == null && this._readyQueues[0].length > 0) {
			process = { 
				queue: this._readyQueues[0],
				index: 0
			};
		}

		return process;
	}

	/**
	 * Selects a process from the ready queue using the SPN algorithm
	 * If no process is available, it will return a negative value
	 */
	private SPN() : NextProcess {
		let process: NextProcess = null;

		// this algorithm is not preemptive, there is a process running
		// this process must finish its execution
		if (this._currentProcess == null && this._readyQueues[0].length > 0) {
			let index: number = 0;
			let min: number = this._readyQueues[0][index].process.cycles.length;
			for (let i = 1; i < this._readyQueues[0].length; i++) {
				if (this._readyQueues[0][i].process.cycles.length < min) {
					index = i;
					min = this._readyQueues[0][i].process.cycles.length;
				}
			}

			process = {
				queue: this._readyQueues[0],
				index
			};
		}

		return process;
	}

	private SRTN() : NextProcess {
		let process: NextProcess = null;
		let index: number = -1;

		const remainingTime = (process: ProcessWrap) => process.process.cycles.length - process.currentCycle;

		let min: number = Number.MAX_VALUE;
		if (this._readyQueues[0].length > 0) {
			index = 0;
			min = remainingTime(this._readyQueues[0][index]);
			for (let i = 0; i < this._readyQueues[0].length; i++) {
				let tmp: number = remainingTime(this._readyQueues[0][i]);
				if (tmp < min) {
					index = i;
					min = tmp;
				}
			}
		}

		// if there is a process running, this might be the shortest process
		if (this._currentProcess != null && index > 0) {
			if (remainingTime(this._currentProcess) < min) {
				index = -1;
			}
		}

		if (index >= 0) {
			process = {
				queue: this._readyQueues[0],
				index
			};
		}

		return process;
	}

	private RR() : NextProcess {
		let process: NextProcess = null;
		let index: number = -1;

		// if there is a process running, we might have to stop if it has reached
		// its burst limit
		if (this._currentProcess != null && this._currentProcess.burstCycles >= this._quantum) {
			// we will stop the current process if there are other processes
			// waiting to use the CPU
			// TODO: for virtual round robin, if the current process has IO cycle, it will be stopped
			if (this._readyQueues[0].length > 0) {
				index = 0;
			}
		} else if (this._currentProcess == null) {
			// there isn't any process, a new process will be executed if there is any
			if (this._readyQueues[0].length > 0) {
				index = 0;
			}
		}

		if (index >= 0) {
			process = {
				queue: this._readyQueues[0],
				index
			};
		}

		return process;
	}

	private HRRN() : NextProcess {
		let process: NextProcess = null;
		let index: number = -1;

		const responseRatio = (process: ProcessWrap) : number => {
			// wait time is the difference between the current cycle and 
			// the arrival cycle
			// TODO: change the actual length for the Estimated Duration field?
			let wait: number = this._cycle - process.process.arrival;
			return (wait + process.process.cycles.length) / process.process.cycles.length;
		};

		// this algorithm is not preemptive, therefore if there is a process it must 
		// not find any other process
		if (this._currentProcess == null) {
			let max: number = -1;

			for (let i = 0; i < this._readyQueues[0].length; i++) {
				let tmp: ProcessWrap = this._readyQueues[0][i];
				let rr: number = responseRatio(tmp);
				if (rr > max) {
					index = i;
					max = rr;
				}
			}
		}

		if (index >= 0) {
			process = {
				queue: this._readyQueues[0],
				index
			};
		}

		return process;
	}

	private Feedback() : NextProcess {
		let process: NextProcess = null;

		// finds the next highest priority process to be executed
		const findNextProcess = () : NextProcess => {
			let process: NextProcess = null;
			for (let i = 0; i < this._readyQueues.length && process == null; i++) {
				if (this._readyQueues[i].length > 0) {
					process = {
						queue: this._readyQueues[i],
						index: 0
					};
				}
			}

			return process;
		};

		const quantum = (process: ProcessWrap) : number => {
			if (this._quantumMode) {
				return 2**process.priority;
			} else {
				return this._quantum;
			}
		};

		// if there is a process and it has exceeded its burst cycles, we must stop it
		if (this._currentProcess != null && this._currentProcess.burstCycles >= quantum(this._currentProcess)) {
			// this process will be stopped if there is another process waiting for the CPU
			process = findNextProcess();
		} else if (this._currentProcess == null) {
			process = findNextProcess();
		}

		return process;
	}

	/**
	 * Returns a list of available algorithms for this simulator
	 */
	public static getAvailableAlgorithms() : Algorithm[] {
		return [
			{ id: "fifo", name: "First In First Out" },
			{ id: "spn", name: "Shortest Process Next" },
			{ id: "srtn", name: "Shortest Remaining Time Next" },
			{ id: "hrrn", name: "Highest Reponse Ratio Next" },
			{ id: "rr", name: "Round Robin" },
			{ id: "feedback", name: "Feedback" },
		];
	}

	private algorithmFunctions: {[key: string]: () => NextProcess} = {
		fifo: this.FIFO.bind(this),
		spn: this.SPN.bind(this),
		srtn: this.SRTN.bind(this),
		rr: this.RR.bind(this),
		hrrn: this.HRRN.bind(this),
		feedback: this.Feedback.bind(this)
	};

	/**
	 * Performs the simulation (without changing the current state) and returns
	 * the number of ticks that it will take
	 */
	get simulationTicks() : number {
		let fakeSimulator: CPUSimulator = new CPUSimulator();
		let counter: number = 0;

		// add the processes and set the correct algorithm
		this._processList.map(process => fakeSimulator.addProcess(process));
		fakeSimulator.algorithm = this._algorithm;
		fakeSimulator.quatum = this._quantum;

		// run the simulation
		while (fakeSimulator.hasNextStep()) {
			fakeSimulator.processNextRequest();
			counter++;
		}

		return counter;
	}

	/**
	 * Sets the value of the quantum used for algorithms such as Round Robin
	 */
	set quatum(value: number) {
		if (value >= 1) {
			this._quantum = value;
		}
	}

	/**
	 * Sets the current process in execution and executes the callbacks
	 */
	private set currentProcess(process: ProcessWrap | null) {
		this._currentProcess = process;
		this.onProcessChange(this._currentProcess);
	}

	/**
	 * Handles the finalization of a process
	 * @param process process to be finished
	 */
	private _processFinish(process: ProcessWrap) {
		// updates the finish cycle
		process.finishCycle = this._cycle;

		// executing the callback with the updated information
		this.onProcessFinish(process);
	}

	/**
	 * Sets the algorithm that the simulator will use
	 */
	set algorithm(id: string) {
		this._algorithm = id;
	}

	private createProcessWrap(process: Process) : ProcessWrap {
		return {
			startCycle: -1,
			finishCycle: -1,
			burstCycles: 0,
			currentCycle: 0,
			priority: 0,
			process
		};
	}

	/**
	 * Adds a process to the correct priority queue
	 * @param priority
	 * @param process 
	 */
	private addProcessToReady(priority: number, process: ProcessWrap) : void {
		if (priority >= this._readyQueues.length) {
			// this ready queue does not exist, let's create it
			while (priority >= this._readyQueues.length) {
				this._readyQueues.push([]);
			}
		}

		this._readyQueues[priority].push(process);
	}

	/**
	 * Sets the maximum number of ready queues for the algorithm Feedback
	 * This value will be ignored when another algorithm is selected
	 */
	public set maxQueues(value: number) {
		if (value >= 0) {
			this._maxQueues = value - 1;
		}
	}

	/**
	 * Sets the quantum mode. 
	 * If false, each queue will use the same quantum value, otherwise
	 * each queue will have a dynamic quantum (2^i)
	 */
	public set quantumMode(value: boolean) {
		this._quantumMode = value;
	}
}

export { CPUSimulator };
export type { Process, ProcessSnapshot, ProcessWrap };
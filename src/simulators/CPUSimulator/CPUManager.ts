import { Simulator } from "../Simulator";
import AlgorithmSettings from "./components/AlgorithmSettings";
import { 
	CPUSimulator,
	Process, 
	ProcessWrap, 
	ProcessSnapshot 
} from "./CPUSimulator";

interface SimulationResult {
	currentProcess: ProcessWrap | null;
	queues: {[name: string]: ProcessWrap[]};
	summary: {[id: string]: ProcessWrap};
	events: ProcessSnapshot[][];
};

class CPUManager {
	// single simulator for simple view
	private _simulator: CPUSimulator;
	private _simulationResult: SimulationResult;

	// multiple simulators for comparaison view
	private _simulators: {[key: string]: CPUSimulator[]};
	private _simulationResults: {[key:string]: SimulationResult[]};
	private _selectedAlgorithms: string[];

	// whether the simple view is enabled or not
	private _simpleView: boolean;

	// process list
	private _processes: Process[];

	// callbacks
	public onResultsChange: (results: {[key: string]: SimulationResult[]}) => void;

	constructor() {
		this._processes = [];
		this._simulator = this.createSimulator();
		this._simulator.onQueueChange = (queues) => this._simulationResult.queues = queues;
		this._simulator.onProcessChange = (process) => this._simulationResult.currentProcess = process;
		this._simulator.onProcessFinish = (p) => this._simulationResult.summary[p.process.id] = p;
		this._simulator.algorithm = "fifo";
		this._simulationResult = this.createEmptyResults();

		// initializing simulator lists
		this._selectedAlgorithms = [];
		this._simulators = {};
		this._simulationResults = {};
		CPUSimulator.getAvailableAlgorithms().map(algorithm => {
			this._simulators[algorithm.id] = [];
			this._simulationResults[algorithm.id] = [];
		});

		// default empty callback
		this.onResultsChange = () => {};

		// initialize view mode
		this._simpleView = false;
	}

	/**
	 * @returns whether or not there is a next step
	 */
	public hasNextStep() : boolean {
		if (this._simpleView) {
			return this._simulator.hasNextStep();
		} else {
			let nextStep: boolean = false;
			Object.values(this._simulators).map(value => {
				nextStep = value.reduce((a, b) => a || b.hasNextStep(), nextStep);
			});

			return nextStep;
		}
	}

	/**
	 * @returns whether or not there is a previous step
	 */
	public hasPreviousStep() : boolean {
		if (this._simpleView) {
			return this._simulator.hasPreviousStep();
		} else {
			let nextStep: boolean = false;
			Object.values(this._simulators).map(value => {
				nextStep = value.reduce((a, b) => a || b.hasPreviousStep(), nextStep);
			});

			return nextStep;
		}
	}

	/**
	 * Steps one step in the simulation
	 */
	public nextStep() : void {
		if (this._simpleView) {
			let results = this._simulator.processNextRequest();
			this._simulationResult.events.push(results);
		} else{
			Object.entries(this._simulators)
			.map(([algorithm, list]) => 
				list.map((simulator, i) => {
					if (simulator.hasNextStep()) {
						let results = simulator.processNextRequest();
						this._simulationResults[algorithm][i].events.push(results);
					}
				})
			);
		}

		this.invokeChangeResults();
	}

	public previousStep() : void {
		if (this._simpleView) {
			this._simulator.previousStep();
			this._simulationResult.events.pop();

			Object.entries(this._simulationResult.summary).map(([id, value]) => {
				if (value.finishCycle == this._simulator.cycle) {
					delete this._simulationResult.summary[id];
				}
			})
		} else {
			Object.values(this._simulators).map(list =>
				list.map(simulator => simulator.previousStep())
			);

			Object.entries(this._simulationResults).map(([algorithmId, list]) =>  
				list.map((result, simulatorIndex) => { 
					result.events.pop();
					Object.entries(result.summary).map(([id, value]) => {
						if (value.finishCycle == this._simulators[algorithmId][simulatorIndex].cycle) {
							delete result.summary[id];
						}
					});
				})
			);
		}

		this.invokeChangeResults();
	}

	/**
	 * Sets the simulation state to the initial one
	 */
	public reset() : void {
		// simple view simulator
		this._simulator.reset();
		this._simulationResult = this.createEmptyResults();

		// comparaison view simulator
		Object.values(this._simulators).map(list =>
			list.map(simulator => simulator.reset())
		);

		Object.values(this._simulationResults).map(list => {
			for (let i = 0; i < list.length; i++) {
				list[i] = this.createEmptyResults();
			}
		});

		this.invokeChangeResults();
	}

	/**
	 * Select an algorithm
	 * @param id algorithm identifier
	 */
	public selectAlgorithm(id: string) : void {
		if (this._simpleView) {
			this._simulator.algorithm = id;
			this._simulationResult = this.createEmptyResults();
			this.invokeChangeResults();
		} else {
			// check if the algorithm is being selected or remove
			let idx = this._selectedAlgorithms.indexOf(id);
			if (idx >= 0) {
				// remove this algorithm
				this._selectedAlgorithms.splice(idx, 1);

				// clean-up simulators and results from this algorithm
				this._simulators[id] = [];
				this._simulationResults[id] = [];
			} else {
				// add the algorithm
				console.log("Selecting " + id)
				if (id == "rr" || id == "feedback") {
					// do nothing, simulators of these algorithms will be added using 
					// the addAlgorithmVariant method
				} else {
					let simulator: CPUSimulator = this.createSimulator();
					simulator.algorithm = id;
					this._selectedAlgorithms.push(id);
					this._simulators[id].push(simulator);

					let idx : number = this._simulators[id].length - 1;
					simulator.onQueueChange = (queues) => this._simulationResults[id][idx].queues = queues;
					simulator.onProcessChange = (process) => this._simulationResults[id][idx].currentProcess = process;
					simulator.onProcessFinish = (p) => this._simulationResults[id][idx].summary[p.process.id] = p;

					this._simulationResults[id].push(this.createEmptyResults());
					this.invokeChangeResults();
				}
			}
		}
	}

	public addAlgorithmVariant(algorithm: string, settings: AlgorithmSettings) {
		if (!this._simpleView && (algorithm in this._simulators)) {
			let simulator: CPUSimulator = this.createSimulator();
			simulator.algorithm = algorithm;

			// we might be doing some innecessarry assignments
			simulator.quantumMode = settings.quantumMode;
			simulator.quatum = settings.quantum;
			simulator.maxQueues = settings.maxQueues;

			// adding simulator results
			this._simulators[algorithm].push(simulator);
			this._simulationResults[algorithm].push(this.createEmptyResults());

			let idx: () => number = () => {
				let i;
				for(i = 0; i < this._simulators[algorithm].length && this._simulators[algorithm][i] != simulator; i++);
				return i;
			};

			simulator.onQueueChange = (queues) => this._simulationResults[algorithm][idx()].queues = queues;
			simulator.onProcessChange = (process) => this._simulationResults[algorithm][idx()].currentProcess = process;
			simulator.onProcessFinish = (p) => this._simulationResults[algorithm][idx()].summary[p.process.id] = p;

			this.invokeChangeResults();
		}
	}

	public removeAlgorithmVariant(algorithm: string, index: number) : void {
		if (!this._simpleView && (algorithm in this._simulators)) {
			if (index < this._simulators[algorithm].length) {
				this._simulators[algorithm].splice(index, 1);
				this._simulationResults[algorithm].splice(index, 1);

				this.invokeChangeResults();
			}
		}
	}

	/**
	 * Creates and adds all the processes to a new simulator instance
	 * @returns a new CPU simulator
	 */
	private createSimulator() : CPUSimulator {
		let simulator = new CPUSimulator();

		// add all the existing processes
		this._processes.map(process => simulator.addProcess(process));

		return simulator;
	}

	private createEmptyResults() : SimulationResult {
		return {
			currentProcess: null,
			queues: {},
			summary: {},
			events: []
		};
	}

	/**
	 * Adds a process to the process list
	 * @param process process to be added
	 */
	public addProcess(process: Process) : void {
		this._processes.push(process);

		// add this process to all existing simulators
		this._simulator.addProcess(process);
		Object.values(this._simulators)
		.map(list => 
			list.map(simulator => simulator.addProcess(process))
		);
	}

	public clear() : void {
		// empty process list
		this._processes = [];

		// and clear the simulation results
		this._simulator.clear();
		this._simulationResult = this.createEmptyResults();
		
		Object.values(this._simulators).map(list =>
			list.map(simulator => simulator.clear())
		);

		Object.values(this._simulationResults).map(list => {
			for (let i = 0; i < list.length; i++) {
				list[i] = this.createEmptyResults();
			}
		});

		this.invokeChangeResults();
	}

	/**
	 * Deletes a process from the process list
	 * @param index process to be removed
	 */
	public removeProcess(index: number) : void {
		this._processes.splice(index, 1);
		
		// remove this process from all existing simulators
		this._simulator.removeProcess(index);
		Object.values(this._simulators)
		.map(list => 
			list.map(simulator => simulator.removeProcess(index))	
		);
	}

	/**
	 * Returns the maximum simulation length
	 */
	public get simulationTicks() : number {
		if (this._simpleView) {
			return this._simulator.simulationTicks;
		} else {
			let max: number = Number.MIN_SAFE_INTEGER;

			for (let x in this._simulators) {
				let tmpMax: number = Math.max(
					...this._simulators[x].map((simulator) => simulator.simulationTicks)
				);

				if (tmpMax > max) {
					max = tmpMax;
				}
			}

			return max;
		}
	}

	/**
	 * Sets the view mode
	 */
	public set simpleView(value: boolean) {
		this._simpleView = value;
		this.invokeChangeResults();
	}

	private invokeChangeResults() : void {
		if (this._simpleView) {
			console.log("cur algorithm is " + this._simulator.algorithm)
			this.onResultsChange({
				[this._simulator.algorithm]: [this._simulationResult]
			});
		} else {
			this.onResultsChange(this._simulationResults);
		}
	}
}

export { CPUManager };
export type { SimulationResult };
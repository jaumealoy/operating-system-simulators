import { Manager } from "../Manager";
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

class CPUManager extends Manager<CPUSimulator> {
	// single simulator for simple view
	private _simulationResult: SimulationResult;

	// multiple simulators for comparaison view
	private _simulators: {[key: string]: CPUSimulator[]};
	private _simulationResults: {[key:string]: SimulationResult[]};
	private _selectedAlgorithms: string[];


	// process list
	private _processes: Process[];

	// callbacks
	public onResultsChange: (results: {[key: string]: SimulationResult[]}) => void;

	constructor() {
		super();

		this._processes = [];
		this.simulator = this.createSimulator();
		this.simulator.onQueueChange = (queues) => this._simulationResult.queues = queues;
		this.simulator.onProcessChange = (process) => this._simulationResult.currentProcess = process;
		this.simulator.onProcessFinish = (p) => this._simulationResult.summary[p.process.id] = p;
		this.simulator.algorithm = "fifo";
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
	 * Steps one step in the simulation
	 */
	public nextStep() : void {
		if (this._simpleView) {
			let results = this.simulator.processNextRequest();
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
			this.simulator.previousStep();
			this._simulationResult.events.pop();

			Object.entries(this._simulationResult.summary).map(([id, value]) => {
				if (value.finishCycle == this.simulator.cycle) {
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
		this.simulator.reset();
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
			this.simulator.algorithm = id;
			this._simulationResult = this.createEmptyResults();
			this.invokeChangeResults();
		} else {
			// check if the algorithm is being selected or removed
			let idx = this._selectedAlgorithms.indexOf(id);
			if (idx >= 0) {
				// remove this algorithm
				this._selectedAlgorithms.splice(idx, 1);

				// clean-up simulators and results from this algorithm
				this._simulators[id] = [];
				this._simulationResults[id] = [];
				this.invokeChangeResults();
			} else {
				// add the algorithm
				if (id == "rr" || id == "feedback") {
					// do nothing, simulators of these algorithms will be added using 
					// the addAlgorithmVariant method
					this._selectedAlgorithms.push(id);
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
			events: [],
		};
	}

	/**
	 * Adds a process to the process list
	 * @param process process to be added
	 */
	public addProcess(process: Process) : void {
		this._processes.push(process);

		// add this process to all existing simulators
		this.simulator.addProcess(process);
		Object.values(this._simulators)
		.map(list => 
			list.map(simulator => simulator.addProcess(process))
		);

		this.invokeChangeResults();
	}

	public clear() : void {
		// empty process list
		this._processes = [];

		// and clear the simulation results
		this.simulator.clear();
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
		this.simulator.removeProcess(index);
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
			return this.simulator.simulationTicks;
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
			this.onResultsChange({
				[this.simulator.algorithm]: [this._simulationResult]
			});
		} else {
			this.onResultsChange(this._simulationResults);
		}
	}

	public set algorithmSettings(settings: AlgorithmSettings)  {
		if (this._simpleView) {
			this.simulator.quatum = settings.quantum;
			this.simulator.quantumMode = settings.quantumMode;
			this.simulator.maxQueues = settings.maxQueues;
		}
	}

	public resetManager() : void {
		this._selectedAlgorithms = [];
		Object.keys(this._simulators).map(key => {
			this._simulators[key] = [];
			this._simulationResults[key] = [];
		});
	}

	get simulators() : CPUSimulator[] {
		let list: CPUSimulator[] = [];

		Object.values(this._simulators).map(value => {
			list = [...list, ...value];
		});

		return list;
	};
}

export { CPUManager };
export type { SimulationResult };
import { MemorySimulator, ProcessWrap, Process, Queues } from "./MemorySimulator";

interface MemorySimulatorResults {
	nextPointer: number;
	currentCycle: number;
	memory: number[];
	memoryGroups: number[];
	allocationHistory: ProcessWrap[];
	queues: Queues;
}

class MemoryManager {
	private _isSimpleView: boolean;
	
	// selected algorithms
	private _selectedAlgorithms: string[] = [];
	
	// process list
	private processes: Process[];

	// simulators
	private simulator: MemorySimulator;
	private simpleResults: MemorySimulatorResults;

	private simulators: MemorySimulator[];
	private multipleResults: {[key: string]: MemorySimulatorResults};

	// simulator settings
	private _capacity: number;

	// callback
	public onResultsChange: (reuslts: {[key: string]: MemorySimulatorResults}) => void;

	constructor() {
		// simple view by default
		this._isSimpleView = true;

		// by default there isn't any selected algorithm in the comparaison view
		this._selectedAlgorithms = [];

		// initializing simulators
		this.simulator = new MemorySimulator();
		this.simpleResults = this.createEmptyResults();
		this.initializeSimulator(this.simulator, true);

		this.simulators = [];
		this.multipleResults = {};

		this.processes = [];

		this._capacity = 16;

		// default empty callback
		this.onResultsChange = () => {};
	}

	/**
	 * Selects the algorithm for the simulation
	 * @param algorithm
	 */
	public selectAlgorithm(algorithm: string) {
		if (this._isSimpleView) {
			this.simulator.selectAlgorithm(algorithm);
		} else { 
			let idx: number = this._selectedAlgorithms.indexOf(algorithm);
			if (idx < 0) {
				// add this algorithm to the list and create its simulator
				let simulator: MemorySimulator = new MemorySimulator();
				simulator.selectAlgorithm(algorithm);
				this.multipleResults[algorithm] = this.createEmptyResults();
				this.initializeSimulator(simulator, false);

				// add all the added preocesses to the list
				this.processes.map(process => {
					simulator.addProcess(process);
				});

				// and set the simulator settings
				simulator.capacity = this._capacity;

				this.simulators.push(simulator);
			} else {
				// remove this simulator from the list
				this.processes.splice(idx, 1);
			}
		}

		this.invokeChangeCallback();
	}

	/**
	 * @returns whether there is or not a next step
	 */
	public hasNextStep() : boolean {
		if (this._isSimpleView) {
			return this.simulator.hasNextStep();
		} else {
			let nextStep = false;

			for (let i = 0; i < this.simulators.length && !nextStep; i++) {
				nextStep = this.simulators[i].hasNextStep();
			}

			return nextStep;
		}
	}

	/**
	 * Executes the next simulation step
	 */
	public nextStep() : void {
		if (this._isSimpleView) {
			this.simulator.nextStep();
		} else {
			this.simulators.map(simulator => {
				if (simulator.hasNextStep()) {
					simulator.nextStep();
				}
			})
		}

		this.invokeChangeCallback();
	}

	/**
	 * @returns whether there is or not a previous step
	 */
	public hasPreviousStep() : boolean {
		if (this._isSimpleView) {
			return this.simulator.hasPreviousStep();
		} else {
			let previousStep = false;

			for (let i = 0; i < this.simulators.length && !previousStep; i++) {
				previousStep = this.simulators[i].hasPreviousStep();
			}

			return previousStep;
		}
	}

	/**
	 * Returns to the previous step of the simulation
	 */
	public previousStep() : void {
		if (this._isSimpleView) {
			this.simulator.previousStep();
		} else {
			this.simulators.map(simulator => {
				if (simulator.hasPreviousStep()) {
					simulator.previousStep();
				}
			});
		}

		this.invokeChangeCallback();
	}

	/**
	 * Adds a process to the simulation list
	 * @param process
	 */
	public addProcess(process: Process) : void {
		// add process to the list
		this.processes.push(process);

		// and all existing simulators
		this.simulator.addProcess(process);
		this.simulators.map(simulator => {
			simulator.addProcess(process);
		});

		this.invokeChangeCallback();
	}

	/**
	 * Removes a process from the simulation list
	 * @param index index of the process in the process list
	 */
	public removeProcess(index: number) : void {
		this.simulator.removeProcess(index);
		this.simulators.map(simulator => {
			simulator.removeProcess(index);
		})
	}

	public clear() : void {
		this.simulator.clear();
		this.simulators.map(simulator => {
			simulator.clear();
		});
	}

	public reset() : void {
		this.simulator.reset();
		this.simulators.map(simulator => {
			simulator.reset();
		});
	}

	/**
	 * Toggles the simple view and comparaison view
	 * @param value whether simple view is enabled or not
	 */
	public set simpleView(value: boolean) {
		this._isSimpleView = value;

		if (value) {
			// recover the simulation results from the simple view
		} else {
			// show the simulation reuslts from the comparaison view
		}

		this.invokeChangeCallback();
	} 

	/**
	 * Sets the memoy size
	 */
	public set capacity(value: number) {
		this._capacity = value;

		// and set this setting to all simulators
		this.simulator.capacity = value;
		this.simulators.map(simulator => {
			simulator.capacity = value;
		});

		this.invokeChangeCallback();
	}

	private invokeChangeCallback() : void {
		if (this._isSimpleView) {
			this.onResultsChange({ 
				[this.simulator.algorithm]: this.simpleResults
			});
		} else {
			this.onResultsChange(this.multipleResults);
		}
	}

	/**
	 * @returns an empty simulator results object
	 */
	private createEmptyResults() : MemorySimulatorResults {
		return {
			currentCycle: 0,
			nextPointer: 0,
			memory: [],
			memoryGroups: [],
			queues: { incoming: [], allocated: [] },
			allocationHistory: []
		};
	}

	private initializeSimulator(simulator: MemorySimulator, simple: boolean) {
		let ref: MemorySimulatorResults;
		if (simple) {
			ref = this.simpleResults;
		} else {
			ref = this.multipleResults[simulator.algorithm];
		}

		simulator.onMemoryChange = (memory: number[]) => {
			ref.memory = memory;
		};

		simulator.onNextPointerChange = (value: number) => {
			ref.nextPointer = value;
		};

		simulator.onMemoryGroupsChange = (groups: number[]) => {
			ref.memoryGroups = groups;
		};

		simulator.onQueuesChange = (queues: Queues) => {
			ref.queues = queues;
		};

		simulator.onAllocationHistoryChange = (history: ProcessWrap[]) => {
			ref.allocationHistory = history;
		};

		simulator.onCurrentCycleChange = (cycle: number) => {
			ref.currentCycle = cycle;
		};
	}
}

export { MemoryManager };
export type { MemorySimulatorResults };
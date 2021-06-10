import { MemorySimulator, ProcessWrap, Process, Queues, MemoryBlock } from "./MemorySimulator";
import { Manager } from "./../../Manager";

interface MemorySimulatorResults {
	nextPointer: number;
	currentCycle: number;
	memory: MemoryBlock[];
	memoryGroups: number[];
	allocationHistory: ProcessWrap[];
	queues: Queues;
}

class MemoryManager extends Manager<MemorySimulator> {	
	// selected algorithms
	private _selectedAlgorithms: string[] = [];
	
	// process list
	private processes: Process[];

	// simulators
	//private simulator: MemorySimulator;
	private simpleResults: MemorySimulatorResults;

	private _simulators: MemorySimulator[];
	private multipleResults: {[key: string]: MemorySimulatorResults};

	// simulator settings
	private _capacity: number;

	// callback
	public onResultsChange: (results: {[key: string]: MemorySimulatorResults}) => void;

	constructor() {
		super();

		// simple view by default
		this._simpleView = true;

		// by default there isn't any selected algorithm in the comparaison view
		this._selectedAlgorithms = [];

		// initializing simulators
		this.simulator = new MemorySimulator();
		this.simpleResults = this.createEmptyResults();
		this.initializeSimulator(this.simulator, true);

		this._simulators = [];
		this.multipleResults = {};

		this.processes = [];

		this._capacity = 1024;

		// default empty callback
		this.onResultsChange = () => {};
	}

	/**
	 * Selects the algorithm for the simulation
	 * @param algorithm
	 */
	public selectAlgorithm(algorithm: string) {
		if (this._simpleView) {
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

				this._simulators.push(simulator);
				this._selectedAlgorithms.push(algorithm);
			} else {
				// remove this simulator from the list
				this._selectedAlgorithms.splice(idx, 1);
				this._simulators.splice(idx, 1);
				delete this.multipleResults[algorithm];
			}
		}

		this.invokeChangeCallback();
	}

	/**
	 * Executes the next simulation step
	 */
	public nextStep() : void {
		super.nextStep();
		this.invokeChangeCallback();
	}

	/**
	 * Returns to the previous step of the simulation
	 */
	public previousStep() : void {
		super.previousStep();
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
		this._simulators.map(simulator => {
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
		this._simulators.map(simulator => {
			simulator.removeProcess(index);
		});

		this.invokeChangeCallback();
	}

	public clear() : void {
		super.clear();
		this.processes = [];
	}

	public reset() : void {
		super.reset();
		this.invokeChangeCallback();
	}

	/**
	 * Toggles the simple view and comparaison view
	 * @param value whether simple view is enabled or not
	 */
	public set simpleView(value: boolean) {
		this._simpleView = value;
		this.invokeChangeCallback();
	}

	/**
	 * Sets the memoy size
	 */
	public set capacity(value: number) {
		this._capacity = value;

		// and set this setting to all simulators
		this.simulator.capacity = value;
		this._simulators.map(simulator => {
			simulator.capacity = value;
		});

		this.invokeChangeCallback();
	}

	private invokeChangeCallback() : void {
		if (this._simpleView) {
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

		simulator.onMemoryChange = (memory: MemoryBlock[]) => {
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

	public get simulators() : MemorySimulator[] {
		return this._simulators;
	}
}

export { MemoryManager };
export type { MemorySimulatorResults };
import { Manager } from "./../../Manager";
import { 
	PaginationSimulator, 
	ProcessTable,
	Process, Request
} from "./PaginationSimulator";

interface PaginationResult {
	processTable: ProcessTable;
	memory: number[];
	pages: number[];
	pageFailures: number;
	currentCycle: number;
}

class PaginationManager extends Manager<PaginationSimulator> {
	// single simulator result
	private simpleResult: PaginationResult;

	// comparaison view simulators and results
	private _simulators: PaginationSimulator[];
	private multipleResults: {[key: string]: PaginationResult};
	public onResultsChange: (results: {[key: string]: PaginationResult}) => void;

	// selected algorithms
	private _selectedAlgorithms: string[];

	// processes and requests
	private _processes: Process[];
	private _requests: Request[];

	constructor() {
		super();

		this.simpleResult = this.createEmptyResults();
		this.simulator = new PaginationSimulator();
		this.initializeSimulator(this.simulator, true);

		this._simulators = [];
		this.multipleResults = {};
		this.onResultsChange = () => {};

		// initialize processes and requests lists
		this._processes = [];
		this._requests = [];

		// there is no selected algorithm by default
		this._selectedAlgorithms = [];
	}

	public clear() : void {
		// clear internal simulators
		super.clear();

		this.simpleResult.currentCycle = 0;

		// clear manager lists
		this._processes = [];
		this._requests = [];
	}

	public addProcess(process: Process) : void {
		this._processes.push(process);

		// add this process to all existing simulators
		this.simulator.addProcess(process);
		this.simulators.map(simulator => simulator.addProcess(process));

		this.invokeChangeCallback();
	}

	public removeProcess(index: number) : void {
		let process: Process = this._processes[index];
		for (let i = 0; i < this._requests.length;) {
			if (this._requests[i].process == process.id) {
				this._requests.splice(i, 1);
			} else {
				i++;
			}
		}
		
		// remove this process from all simulators
		this.simulator.removeProcess(index);
		this.simulators.map(simulator => simulator.removeProcess(index));

		this.invokeChangeCallback();
	}

	public addRequest(request: Request) {
		this._requests.push(request);

		// add this request to all simulators
		this.simulator.addRequest(request);
		this.simulators.map(simulator => simulator.addRequest(request));

		this.invokeChangeCallback();
	}

	public removeRequest(index: number) {
		this._requests.splice(index, 1);

		// remove this request from all simulators
		this.simulator.removeRequest(index);
		this.simulators.map(simulator => simulator.removeRequest(index));

		this.invokeChangeCallback();
	}

	public selectAlgorithm(algorithm: string) : void {
		if (this.simpleView) {
			// just change the algorithm to the unique simulator
			this.simulator.selectAlgorithm(algorithm);
		} else {
			let index: number = this._selectedAlgorithms.indexOf(algorithm);
			if (index >= 0) {
				// remove this algorithm from the selected list and its simulator
				this._selectedAlgorithms.splice(index, 1);
				this._simulators.splice(index, 1);
				delete this.multipleResults[algorithm];
			} else {
				this.multipleResults[algorithm] = this.createEmptyResults();
				let simulator: PaginationSimulator = new PaginationSimulator();
				simulator.selectAlgorithm(algorithm);
				this.initializeSimulator(simulator, false);

				// add all existing processes to the simulator
				this._processes.map(process => {
					simulator.addProcess(process);
				});

				// and all the requests
				this._requests.map((request) => {
					simulator.addRequest(request);
				});

				this._selectedAlgorithms.push(algorithm);
				this._simulators.push(simulator);
			}
		}

		this.invokeChangeCallback();
	}

	public nextStep() : void {
		super.nextStep();
		this.invokeChangeCallback();
	}

	public previousStep() : void {
		super.previousStep();
		this.invokeChangeCallback();
	}

	private createEmptyResults() : PaginationResult {
		return {
			processTable: {},
			memory: [],
			pages: [],
			pageFailures: 0,
			currentCycle: 0
		}
	}

	private initializeSimulator(simulator: PaginationSimulator, simpleView: boolean) {
		let ref: PaginationResult;
		if (simpleView) {
			ref = this.simpleResult;
		} else {
			ref = this.multipleResults[simulator.algorithm];
		}

		simulator.onProcessTableChange = (table) => {
			ref.processTable = table;
		};

		simulator.onMemoryChange = (memory, pages) => {
			ref.memory = memory;
			ref.pages = pages;
		};

		simulator.onPageFailuresChange = (value) => ref.pageFailures = value;
		simulator.onCurrentCycleChange = (value) => ref.currentCycle = value; 
	}

	private invokeChangeCallback() : void {
		if (this.simpleView) {
			this.onResultsChange({
				[this.simulator.algorithm]: this.simpleResult
			})
		} else {
			this.onResultsChange(this.multipleResults);
		}
	}

	get simulators() : PaginationSimulator[] {
		return this._simulators;
	}
}

export { PaginationManager };
export type { PaginationResult }
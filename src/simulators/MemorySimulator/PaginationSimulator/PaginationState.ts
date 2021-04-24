import { ProcessTable, Request, ProcessTableSnapshot } from "./PaginationSimulator";
import State from "../../State";

interface AlgorithmStepData {
	step: number;
	index: number;
	index2: number;
};

interface SimulatorStatusData {
	requests: Request[];
	memory: number[];
	pages: number[];
	cycle: number;
	pageFailures: number;
	processTable: ProcessTable;
	snapshots: {[key: string]: ProcessTableSnapshot[]};
};

class PaginationState extends State {
	// simulator status
	private _pendingRequests: Request[];
	private _memory: number[];
	private _pages: number[];
	private _counter: number;
	private _pageFailures: number;
	private _processTable: ProcessTable;
	private _snapshots: {[key: string]: ProcessTableSnapshot[]};

	// algorithm steps
	private _stepData: AlgorithmStepData;

	constructor(simulatorData: SimulatorStatusData, stepData: AlgorithmStepData) {
		super();

		// initialize simulator data
		this._pendingRequests = [...simulatorData.requests];
		this._memory = [...simulatorData.memory];
		this._pages = [...simulatorData.pages];
		this._counter = simulatorData.cycle;
		this._pageFailures = simulatorData.pageFailures;

		let snaphshots: {[key: string]: ProcessTableSnapshot[]} = {};
		Object.entries(simulatorData.snapshots).map(([key, value]) => {
			snaphshots[key] = [...value];
		});
		this._snapshots = snaphshots;

		// process table is a bit trickier, we cannot make a direct shallow copy
		// data such as bits are inside the ProcessPage object, we must deep copy it!
		this._processTable = PaginationState.copyProcessTable(simulatorData.processTable);

		// initialize step data
		this._stepData = stepData;
	}

	get simulatorStatus() : SimulatorStatusData {
		return {
			requests: this._pendingRequests,
			memory: this._memory,
			pages: this._pages,
			cycle: this._counter,
			pageFailures: this._pageFailures,
			processTable: this._processTable,
			snapshots: this._snapshots
		};
	}

	get stepData() : AlgorithmStepData {
		return this._stepData;
	}

	public static copyProcessTable(table: ProcessTable) : ProcessTable {
		let processTable: ProcessTable = {};
		Object.entries(table).map(([key, value]) => {
			processTable[key] = {
				pages: value.pages.map(page => ({ ...page, data: {...page.data} })),
				loadedPages: [...value.loadedPages],
				pointer: value.pointer,
				failures: value.failures
			}
		});

		return processTable;
	}
}

export { PaginationState };
export type { AlgorithmStepData, SimulatorStatusData };

import { ProcessWrap, Queues, MemoryBlock } from "./MemorySimulator";
import State from "../../State";

class MemoryState extends State {
	private _currentCycle: number;
	private _memory: MemoryBlock[];
	private _memoryGroups: number[];
	private _allocationHistory: ProcessWrap[];
	private _queues: Queues;
	private _lastSearch: number;

	constructor(
		currentCycle: number, memory: MemoryBlock[], memoryGroups: number[], 
		history: ProcessWrap[], queues: Queues, lastSearch: number) 
	{
		super();

		this._currentCycle = currentCycle;
		this._memory = memory.map(x => ({...x}));
		this._memoryGroups = memoryGroups.map(x => x);
		this._allocationHistory = history.map(x => ({...x}));
		this._lastSearch = lastSearch;

		// queues is an object with arrays, we must deep copy those arrays
		// in addition, elements of these arrays are ProcessWraps
		// it is not necessary to copy the process data as this never changes
		this._queues = { 
			incoming: queues.incoming.map(x => ({ ...x })),
			allocated: queues.allocated.map(x => ({ ...x }))
		};
	}


	get currentCycle() : number { 
		return this._currentCycle;
	}

	get memory() : MemoryBlock[] {
		return this._memory;
	}

	get memoryGroups() : number[] {
		return this._memoryGroups;
	}

	get allocationHistory() : ProcessWrap[] {
		return this._allocationHistory;
	}

	get queues() : Queues {
		return this._queues;
	}

	get lastSearch() : number {
		return this._lastSearch;
	}
}

export default MemoryState;
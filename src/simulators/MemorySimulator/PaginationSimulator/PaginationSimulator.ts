import { Simulator, Algorithm } from "../../Simulator";
import { PaginationState } from "./PaginationState";

const SINGLE_STEP: boolean = true;

interface Process {
	id: string;
	frames: number;
}

interface Request { 
	process: string;
	page: number;
	modified: boolean;
}

interface ProcessPage {
	frame: number;
	accessBit: boolean;
	modifiedBit:boolean;
}

interface ProcessPageWrap {
	arrival: number;
	lastUse: number;
	data: ProcessPage
}

interface ProcessEntry {
	pages: ProcessPageWrap[];
	pointer: number;
	loadedPages: number[];
	failures: number;
}

type ProcessTable = {[key: string]: ProcessEntry};

interface ProcessTableSnapshot {
	table: ProcessEntry;
	pageFailure: number;
	write: boolean;
	request: Request;
}

class PaginationSimulator extends Simulator {
	// processes and requests
	private processes: Process[];
	private requests: Request[];

	// simulator status
	private _algorithm: string;
	private _pendingRequests: Request[];
	private running: boolean;
	private _memory: number[];
	private _pages: number[];
	private _counter: number;
	private _pageFailures: number;

	private state: PaginationState[];

	// memory and process tables
	private _processTable: ProcessTable;
	private _snapshots: {[key: string]: ProcessTableSnapshot[]};

	// simulator callbacks
	public onProcessTableChange: (table: ProcessTable) => void;
	public onMemoryChange: (memory: number[], pages: number[]) => void;
	public onPageFailuresChange: (value: number) => void;
	public onCurrentCycleChange: (value: number) => void;
	public onSnapshotsChange: (snaphshots: {[key: string]: ProcessTableSnapshot[]}) => void;

	// variables only used when SINGLE_STEP is true
	private _algorithmStep: number;
	private _algorithmIndex: number;
	private _algorithmIndex2: number;

	constructor() {
		super();

		// initializing processes and request lists
		this.processes = [];
		this.requests = [];
		this._counter = 0;

		this._memory = [];
		this._pages = [];
		this._pendingRequests = [];
		this.running = false;

		this._pageFailures = 0;
		
		this._algorithm = "optimal";

		this._processTable = {};
		this._snapshots = {};

		this._algorithmStep = 0;
		this._algorithmIndex = 0;
		this._algorithmIndex2 = 0;

		this.state = [];

		this.onProcessTableChange = () => {};
		this.onMemoryChange = () => {};
		this.onPageFailuresChange = () => {};
		this.onCurrentCycleChange = () => {};
		this.onSnapshotsChange = () => {};
	}

	public hasNextStep(): boolean {
		return this._pendingRequests.length > 0;
	}

	public hasPreviousStep(): boolean {
		return this.state.length > 0;
	}

	public reset(): void {
		this._pendingRequests = [...this.requests];
		this._pageFailures = 0;
		this.state = [];
		this.running = false;

		this._counter = 0;
		this.onCurrentCycleChange(this._counter);

		this.initializeMemory();
		this.onMemoryChange(this._memory, this._pages);

		this.initializeProcessTables();
		this.onProcessTableChange(this._processTable);
	}

	public clear(): void {
		this.processes = [];
		this.requests = [];
		this._pendingRequests = [];
		this.state = [];
		this.running = false;

		this.initializeMemory();
		this.onMemoryChange(this._memory, this._pages);

		this.initializeProcessTables();
		this.onProcessTableChange(this._processTable);
	}

	public addProcess(process: Process) : void {
		this.processes.push(process);

		// initialize its process table
		this.initializeProcessTable(process);
		this.initializeMemory();
	}

	/**
	 * Removes a process from the simulator. It also deletes
	 * all requests from this process
	 * @param index 
	 */
	public removeProcess(index: number) : void {
		let process: Process = this.processes[index];
		this.processes.splice(index, 1);

		// remove all requests, including those that are in the pending queue
		for (let i = 0; i < this.requests.length;) {
			if (this.requests[i].process == process.id) {
				this.requests.splice(i, 1);

				// if this function is called it means that the simulator
				// has not been started, therefore request array and pending queue
				// have the same elements
				this._pendingRequests.splice(i, 1);
			} else {
				i++;
			}
		}

		// remove the process table of the deleted process
		delete this._processTable[process.id];

		this.onProcessTableChange(this._processTable);
	}

	public addRequest(request: Request) : void {
		this.requests.push(request);

		// add it to the pending requests
		this._pendingRequests.push(request);

		// and reinitialize process table as this process might have more
		// pages than before
		let process: Process | null = this.getProcess(request.process);
		if (process != null) {
			this.initializeProcessTable(process);
		}

		this.onProcessTableChange(this._processTable);
	}

	/**
	 * Removes a request from the list. 
	 * This function should only be called if the simulation has not been started
	 * @param index number of the request to be removed
	 */
	public removeRequest(index: number) : void {
		let request: Request = this.requests[index];
		this.requests.splice(index, 1);
		this._pendingRequests.splice(index, 1);

		// initialize memory and process table
		let p: Process | null = this.getProcess(request.process);
		if (p != null) {
			this.initializeProcessTable(p);
			this.onProcessTableChange(this._processTable);
		}
	}

	/**
	 * Removes all requests from the request list
	 */
	public clearRequests() : void {
		this.requests = [];
		this._pendingRequests = [];

		this.initializeProcessTables();
		this.onProcessTableChange(this._processTable);
	}

	public previousStep() : void {
		let state: PaginationState | undefined = this.state.pop();

		if (state != undefined) {
			// recover simulation status
			let simulatorStatus = state.simulatorStatus;
			this._pendingRequests = simulatorStatus.requests;
			this._memory = simulatorStatus.memory;
			this._pages = simulatorStatus.pages;
			this._counter = simulatorStatus.cycle;
			this._pageFailures = simulatorStatus.pageFailures;
			this._processTable = simulatorStatus.processTable;
			this._snapshots = simulatorStatus.snapshots;

			// recover algorithm status
			let algorithmStatus = state.stepData;
			this._algorithmStep = algorithmStatus.step;
			this._algorithmIndex = algorithmStatus.index;
			this._algorithmIndex2 = algorithmStatus.index2;

			// invoke callbacks with new data
			this.onMemoryChange(this._memory, this._pages);
			this.onPageFailuresChange(this._pageFailures);
			this.onCurrentCycleChange(this._counter);
			this.onProcessTableChange(this._processTable);
			this.onSnapshotsChange(this._snapshots);
		}
	}

	public nextStep() : void {
		let state: PaginationState = new PaginationState(
			{
				requests: this._pendingRequests,
				memory: this._memory,
				pages: this._pages,
				cycle: this._counter,
				pageFailures: this._pageFailures,
				processTable: this._processTable,
				snapshots: this._snapshots
			},
			{
				step: this._algorithmStep,
				index: this._algorithmIndex,
				index2: this._algorithmIndex2
			}
		);
		this.state.push(state);
		
		// process the next request
		this.update();

		// notify changes
		this.onProcessTableChange(this._processTable);
		this.onMemoryChange(this._memory, this._pages);
		this.onCurrentCycleChange(this._counter);
		this.onSnapshotsChange(this._snapshots);
	}

	private update() : void {
		if (!this.running) {
			this._pendingRequests = [...this.requests];
			this._pageFailures = 0;
			this._counter = 0;
			this.running = true;

			this.initializeMemory();
			this.initializeProcessTables();
		}

		let request: Request | undefined = this._pendingRequests.shift();
		if (request != undefined) {
			let process: Process | null = this.getProcess(request.process);

			if (process != null) {
				let pageTable = this._processTable[request.process];

				// is this page loaded?
				let loaded: boolean = pageTable.pages[request.page].data.frame >= 0;
				let requiresWrite: boolean = false;

				let pageFailureBits: number = 0;
				
				if (loaded) {
					// this page is loaded, do nothing
				} else {
					// check if we can load this page into a new frame
					let frame: number = this.allocateProcessFrame(process);
					if (frame < 0) {
						// we must replace a loaded page
						let replacedPage: number = this.algorithmFunctions[this._algorithm](request);

						if (SINGLE_STEP) {
							if (replacedPage < 0) {
								this._pendingRequests.unshift(request);
								return;
							}
						}

						frame = pageTable.pages[replacedPage].data.frame;

						// replace the current loaded page with the new
						let idx: number = 0;
						while(pageTable.loadedPages[idx] != replacedPage) {
							idx++;
						}

						pageTable.loadedPages[idx] = request.page;

						// mark the replaced page as unloaded
						pageTable.pages[replacedPage].data.frame = -1;
						pageTable.pages[replacedPage].arrival = -1;

						pageFailureBits = 0b101;
						if (pageTable.pages[replacedPage].data.modifiedBit) {
							requiresWrite = true;
							pageFailureBits = pageFailureBits | 0b010;
						}

						pageTable.pages[request.page].data.frame = frame;
						pageTable.pages[request.page].arrival = this._counter;
						this._pages[frame] = request.page;

					} else {
						// we could allocate a new frame as this process hasn't reached its limit
						let page: ProcessPageWrap = pageTable.pages[request.page];
						page.arrival = this._counter;
						page.data.frame = frame;
						this._pages[frame] = request.page;

						// add a new page to the loaded pages
						pageTable.loadedPages.push(request.page);

						pageFailureBits = 0b100;
					}

					// this is a page fault
					this._pageFailures++;
					this._processTable[request.process].failures++;

					this.onPageFailuresChange(this._pageFailures);

					this._memory[frame] = this.getProcessIndex(request.process) + 1;

					// page has been loaded for the first time
					if (this._algorithm == "clock" || this._algorithm == "nru") {
						// increase pointer
						let nextPointer: number = (pageTable.pointer + 1) % process.frames;
						pageTable.pointer = nextPointer;
					}

					// and mark it as not modified (it has just been loaded)
					pageTable.pages[request.page].data.modifiedBit = false;
				}

				// mark this page as used
				pageTable.pages[request.page].lastUse = this._counter;
				pageTable.pages[request.page].data.accessBit = true;

				// if this request makes changes to the page, mark it as modified
				if (request.modified) {
					pageTable.pages[request.page].data.modifiedBit = true;
				}

				// a request has been processed, create the Process Table snapshot
				let tableSnapshot: ProcessEntry = {
					pages: pageTable.pages.map(p => ({...p, data: {...p.data}})),
					pointer: pageTable.pointer,
					loadedPages: [...pageTable.loadedPages],
					failures: pageTable.failures
				};

				let snapshot: ProcessTableSnapshot = {
					table: tableSnapshot,
					write: false,
					request: request,
					pageFailure: pageFailureBits
				};

				this._snapshots[request.process].push(snapshot);
			}
		}

		this._counter++;
	}
	
	private FIFO(request: Request) : number {
		let page: number = -1;
		for (let i = 0; i < this._processTable[request.process].pages.length; i++) {
			if (this._processTable[request.process].pages[i].arrival != -1) {
				if (page == -1 || this._processTable[request.process].pages[i].arrival < this._processTable[request.process].pages[page].arrival){
					page = i;
				}
			}
		}

		return page;
	}

	private Optimal(request: Request) : number {
		// loadedPages indicates for each page when the page will be used
		let loadedPages: {[key: number]: number} = {};
		for (let i = 0; i < this._processTable[request.process].pages.length; i++) {
			if (this._processTable[request.process].pages[i].data.frame >= 0) {
				// mark the page as it will not be used in the future
				loadedPages[i] = this.requests.length + 1;
			}
		}

		this._pendingRequests.map((r, index) => {
			if (r.process == request.process) {
				if (r.page in loadedPages) {
					loadedPages[r.page] = index;
				}
			}
		});

		let max: number = -1;
		let maxUsage: number = -1;
		let maxFrame: number = -1;
		Object.entries(loadedPages).map(([page, nextUsage]) => {
			if (nextUsage > maxUsage 
				|| (nextUsage == maxUsage && this._processTable[request.process].loadedPages.indexOf(parseInt(page)) < maxFrame)) {
				max = parseInt(page);
				maxUsage = nextUsage;
				maxFrame = this._processTable[request.process].loadedPages.indexOf(parseInt(page));
			}
		});

		return max;
	}


	private LRU(request: Request) : number {
		// select the page that hasn't been used recently
		// that is the page with the lowest "lastUse" variable
		let min: number = -1;
		let minPage: number = -1;

		this._processTable[request.process].pages.map((page, index) => {
			if (page.data.frame >= 0 && (min < 0 || page.lastUse < min)) {
				min = page.lastUse;
				minPage = index;
			}
		});

		return minPage;
	}

	private Clock(request: Request) : number {
		let process: Process | null = this.getProcess(request.process);
		let page: number = -1;

		if (process != null) {
			let pageTable = this._processTable[request.process];
		
			// check if the candidate page has been accessed or not recently
			while (pageTable.pages[pageTable.loadedPages[pageTable.pointer]].data.accessBit) {
				pageTable.pages[pageTable.loadedPages[pageTable.pointer]].data.accessBit = false;
				pageTable.pointer = (pageTable.pointer + 1) % process.frames;

				if (SINGLE_STEP) {
					return -1;
				}
			}

			page = pageTable.loadedPages[pageTable.pointer];
		}

		return page;
	}

	private NRU(request: Request) : number {
		let process: Process | null = this.getProcess(request.process);
		let page: number = -1;


		if (process != null) {
			let pageTable = this._processTable[request.process];

			if (this._algorithmStep == 0) {
				// algoritm has not been started yet
				this._algorithmStep = 1;
				this._algorithmIndex = 0;
				this._algorithmIndex2 = 0;
			}

			while (page == -1) {
				// search for a page with a = 0 and m = 0
				while (this._algorithmIndex < process.frames
					&& (pageTable.pages[pageTable.loadedPages[pageTable.pointer]].data.accessBit
						|| pageTable.pages[pageTable.loadedPages[pageTable.pointer]].data.modifiedBit))
				{
					this._algorithmIndex++;
					pageTable.pointer = (pageTable.pointer + 1) % process.frames;

					if (SINGLE_STEP) {
						return -1;
					}
				}

				if (this._algorithmIndex == process.frames) {
					// a page has not been found
					while (this._algorithmIndex2 < process.frames
						&& pageTable.pages[pageTable.loadedPages[pageTable.pointer]].data.accessBit)
					{
						pageTable.pages[pageTable.loadedPages[pageTable.pointer]].data.accessBit = false;
						this._algorithmIndex2++;
						pageTable.pointer = (pageTable.pointer + 1) % process.frames;

						if (SINGLE_STEP) {
							return -1;
						}
					}

					if (this._algorithmIndex2 != process.frames) {
						page = pageTable.loadedPages[pageTable.pointer];
						this._algorithmStep = 0;
					}
				} else {
					page = pageTable.loadedPages[pageTable.pointer];
					this._algorithmStep = 0;
				}

				// reset indexes for next search, if needed
				this._algorithmIndex = 0;
				this._algorithmIndex2 = 0;
			}
		}

		return page;
	}

	public static getAvailableAlgorithms() : Algorithm[] {
		return [
			{ name: "Optimal", id: "optimal" },
			{ name: "First In First Out", id: "fifo" },
			{ name: "Least Recently Used", id: "lru" },
			{ name: "Clock", id: "clock" },
			{ name: "Not Recently Used", id: "nru" },
		];
	}

	private algorithmFunctions: {[key: string]: (request: Request) => number} = {
		fifo: this.FIFO.bind(this),
		optimal: this.Optimal.bind(this),
		lru: this.LRU.bind(this),
		clock: this.Clock.bind(this),
		nru: this.NRU.bind(this)
	};

	/**
	 * Initialize empty process tables for each process
	 */
	private initializeProcessTables() : void {
		this._processTable = {};
		this.processes.map(process => this.initializeProcessTable(process));
	}

	private initializeProcessTable(process: Process) {
		this._processTable[process.id] = {
			pages: [],
			pointer: 0,
			loadedPages: [],
			failures: 0
		};

		this._snapshots[process.id] = [];

		this.requests.map(request => {
			if (request.process == process.id) {
				while (this._processTable[process.id].pages.length <= request.page) {
					this._processTable[request.process].pages.push({
						arrival: -1,
						lastUse: -1,
						data: {
							frame:  -1,
							accessBit: false,
							modifiedBit: false
						}
					});
				}
			}
		});
	}

	/**
	 * @param process identifier of the process
	 * @returns number of pages currenty allocated
	 */
	private getNumberOfAllocatedPages(process: string) : number {
		let allocated: number = 0;

		if (process in this._processTable) {

			/*this._processTable[process].pages.map((page) => {
				if (page.data.frame >= 0) {
					allocated++;
				}
			});*/
			allocated = this._processTable[process].loadedPages.length;
		}

		return allocated;
	}

	/**
	 * This function should be called only when a process has less than its maximum
	 * of allocated pages. Therefore, it always will return a valid frame number.
	 * @returns an available frame
	 */
	private getFirstAvailableFrame() : number {
		let index: number = 0;

		while (index < this._memory.length && this._memory[index] != 0) {
			index++;
		}

		return index;
	}

	/**
	 * @param id name of the process
	 * @returns a process object or null if it does not exist
	 */
	private getProcess(id: string) : Process | null {
		let process: Process | null = null;

		let idx: number = 0;
		while(idx < this.processes.length && this.processes[idx].id != id){
			idx++;
		}

		if (idx < this.processes.length) {
			process = this.processes[idx];
		}

		return process;
	}

	private getProcessIndex(id: string) : number {
		let index: number = -1;
		
		for (let i = 0; i < this.processes.length && index == -1; i++) {
			if (this.processes[i].id == id) {
				index = i;
			}
		}

		return index;
	}

	/**
	 * @param process 
	 * @returns a negative number if there isn't any available frame; a number otherwise
	 */
	private allocateProcessFrame(process: Process) : number {
		let allocated: number = this.getNumberOfAllocatedPages(process.id);
		
		if (allocated < process.frames) {
			// this process can have more allocated pages
			return this.getFirstAvailableFrame();
		} else {
			// this process cannot have more allocated pages
			// at the same time, it must remove a page
			return -1;
		}
	}

	/**
	 * Sets the simulation algorithm
	 * @param id algorithm identifier
	 */
	public selectAlgorithm(id: string) : void {
		this._algorithm = id;
	}

	private initializeMemory() : void {
		// calculate the number of total frames
		let total: number = this.processes.map(p => p.frames).reduceRight((a, b) => a + b, 0);

		this._memory = [];
		this._pages = [];

		for (let i = 0; i < total; i++) {
			this._memory[i] = 0;
			this._pages[i] = -1;
		}
	}

	get algorithm() : string {
		return this._algorithm;
	}
}

export { PaginationSimulator };
export type { Process, Request, ProcessTable, ProcessEntry, ProcessTableSnapshot };
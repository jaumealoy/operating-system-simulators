import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import { Simulator, Algorithm } from "../../Simulator";

interface Process {
	id: string;
	frames: number;
}

interface Request { 
	process: string;
	page: number;
}

interface ProcessPage {
	frame: number;
	bits: boolean[];
}

interface ProcessPageWrap {
	arrival: number;
	data: ProcessPage
}

type ProcessTable = {[key: string]: ProcessPageWrap[]};

class PaginationSimulator extends Simulator {
	// processes and requests
	private processes: Process[];
	private requests: Request[];

	// simulator status
	private algorithm: string;
	private _pendingRequests: Request[];
	private running: boolean;
	private _memory: number[];
	private _pages: number[];
	private _counter: number;
	private _pageFailures: number;

	// memory and process tables
	private _processTable: ProcessTable;

	// simulator callbacks
	public onProcessTableChange: (table: ProcessTable) => void;
	public onMemoryChange: (memory: number[], pages: number[]) => void;
	public onPageFailuresChange: (value: number) => void;
	public onCurrentCycleChange: (value: number) => void;

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
		
		this.algorithm = "optimal";

		this._processTable = {};

		this.onProcessTableChange = () => {};
		this.onMemoryChange = () => {};
		this.onPageFailuresChange = () => {};
		this.onCurrentCycleChange = () => {};
	}

	public hasNextStep(): boolean {
		return this._pendingRequests.length > 0;
	}

	public hasPreviousStep(): boolean {
		throw new Error("Method not implemented.");
	}

	public reset(): void {
		throw new Error("Method not implemented.");
	}

	public clear(): void {
		throw new Error("Method not implemented.");
	}

	public addProcess(process: Process) : void {
		this.processes.push(process);

		// initialize its process table
		this.initializeProcessTable(process);
		this.initializeMemory();
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

	public nextStep() : void {
		// TODO: save current state
		
		// process the next request
		this.update();

		// notify changes
		this.onProcessTableChange(this._processTable);
		this.onMemoryChange(this._memory, this._pages);
		this.onCurrentCycleChange(this._counter);
	}

	private update() : void {
		if (!this.running) {
			this._pendingRequests = [...this.requests];
			this._pageFailures = 0;
			this.running = true;

			this.initializeMemory();
			this.initializeProcessTables();
		}

		console.log(this._pendingRequests);

		let request: Request | undefined = this._pendingRequests.shift();
		if (request != undefined) {
			let process: Process | null = this.getProcess(request.process);

			if (process != null) {
				// is this page loaded?
				let loaded: boolean = this._processTable[request.process][request.page].data.frame >= 0;
				
				if (loaded) {
					// this page is loaded, do nothing
				} else {
					// this is a page fault
					this._pageFailures++;
					this.onPageFailuresChange(this._pageFailures);

					// check if we can load this page into a new frame
					let frame: number = this.allocateProcessFrame(process);
					if (frame < 0) {
						// we must replace a loaded page
						let replacedPage: number = this.algorithmFunctions[this.algorithm](request);
						frame = this._processTable[request.process][replacedPage].data.frame;

						console.log(`Replacing page ${replacedPage} with ${request.page}`);

						// mark the replaced page as unloaded
						this._processTable[request.process][replacedPage].data.frame = -1;
						this._processTable[request.process][replacedPage].arrival = -1;

						this._processTable[request.process][request.page].data.frame = frame;
						this._processTable[request.process][request.page].arrival = this._counter;
						this._pages[frame] = request.page;
					} else {
						console.log("Allocating new frame " + frame + " to process " + request.process, request.page)

						// we could allocate a new frame as this process hasn't reached its limit
						let page: ProcessPageWrap = this._processTable[request.process][request.page];
						page.arrival = this._counter;
						page.data.frame = frame;
						this._pages[frame] = request.page;

						console.log(page)
					}

					this._memory[frame] = this.getProcessIndex(request.process) + 1;

					console.log(this._processTable);
				}
			}
		}

		this._counter++;
	}
	
	private FIFO(request: Request) : number {
		let page: number = -1;
		for (let i = 0; i < this._processTable[request.process].length; i++) {
			if (this._processTable[request.process][i].arrival != -1) {
				if (page == -1 || this._processTable[request.process][i].arrival < this._processTable[request.process][page].arrival){
					page = i;
				}
			}
		}

		return page;
	}

	private Optimal(request: Request) {
		let loadedPages: {[key: number]: number} = {};
		for (let i = 0; i < this._processTable[request.process].length; i++) {
			if (this._processTable[request.process][i].data.frame >= 0) {
				loadedPages[i] = this.requests.length + 1;
			}
		}

		console.log("loadedPages=",loadedPages)

		this._pendingRequests.map((r, index) => {
			if (r.process == request.process) {
				console.log("Found a request from this same process page " + r.page, r.page in loadedPages)
				if (r.page in loadedPages) {
					loadedPages[r.page] = index;
				}
			}
		});

		console.log(loadedPages)

		let max: number = -1;
		let maxUsage: number = -1;
		Object.entries(loadedPages).map(([page, nextUsage]) => {
			if (nextUsage > maxUsage) {
				console.log("New max page found at " + nextUsage + " page = " + page);
				max = parseInt(page);
				maxUsage = nextUsage;
			}
		});

		return max;
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
		optimal: this.Optimal.bind(this)
	};

	/**
	 * Initialize empty process tables for each process
	 */
	private initializeProcessTables() : void {
		this._processTable = {};
		this.processes.map(process => this.initializeProcessTable(process));
	}

	private initializeProcessTable(process: Process) {
		this._processTable[process.id] = [];

		this.requests.map(request => {
			if (request.process == process.id) {
				while (this._processTable[process.id].length <= request.page) {
					this._processTable[request.process].push({
						arrival: -1,
						data: {
							bits: [],
							frame:  -1
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
			this._processTable[process].map((page) => {
				if (page.data.frame >= 0) {
					allocated++;
				}
			});
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
		this.algorithm = id;
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
}

export { PaginationSimulator };
export type { Process, Request, ProcessTable };
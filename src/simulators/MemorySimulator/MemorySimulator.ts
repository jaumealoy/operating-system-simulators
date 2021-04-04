import { Simulator, Algorithm } from "./../Simulator";

interface Process {
	id: string;
	size: number;
	arrival: number;
	duration: number;
};

interface ProcessWrap {
	start: number;
	blockBegin: number;
	process: Process;
}

type MemoryBlock = { type: number; start: number; size: number; } | null;
type Queues = {[key in "incoming" | "allocated"]: ProcessWrap[]};

class MemorySimulator extends Simulator {
	// simulator settings
	private algorithm: string;

	// simulator data
	private processes: Process[];
	private queues: Queues; 

	private currentCycle: number;
	private memory: number[];

	// for Next First algorithm
	private lastSearch: number;

	// callbacks
	public onMemoryChange: (data: number[]) => void;
	public onNextPointerChange: (value: number) => void;

	constructor() {
		super();

		this.processes = [];
		this.currentCycle = 0;
		this.memory = [];

		this.lastSearch = 0;

		this.onMemoryChange = () => {};
		this.onNextPointerChange = () => {};

		this.algorithm = "first_fit";

		this.capacity = 16;

		this.queues = {
			incoming: [],
			allocated: []
		};
	}

	/**
	 * Adds a process to the request list
	 * @param process process to be added
	 */
	public addProcess(process: Process) : void {
		this.processes.push(process);
	}

	public hasNextStep(): boolean {
		return true;
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

	public static getAvailableAlgorithms() : Algorithm[] {
		return [
			{ id: "first_fit", name: "First Fit" },
			{ id: "next_fit", name: "Next Fit" },
			{ id: "worst_fit", name: "Worst Fit" },
			{ id: "best_fit", name: "Best fit" },
			{ id: "buddy", name: "Buddy system" }
		];
	}

	public nextStep() : void {
		// TODO: save current state
		this.update();
		this.onMemoryChange(this.memory);
	}

	private update() : void {
		// add processes to incoming queue
		this.processes.map((process) => {
			if (process.arrival == this.currentCycle) {
				this.queues.incoming.push(this.createProcessWrap(process));
				console.log(`Process ${process.id} has arrived`);
			}
		});

		// we have to free the memory from processes that have finished on this cycle
		for (let i = 0; i < this.queues.allocated.length;) {
			let process: ProcessWrap = this.queues.allocated[i];
			
			if (process.process.duration > 0 && this.currentCycle >= (process.start + process.process.duration)) {
				// this process must be freed
				for (let i = 0; i < process.process.size; i++) {
					this.memory[i + process.blockBegin] = 0;
				}

				this.queues.allocated.splice(i, 1);
			} else {
				i++;
			}
		}

		// allocate all the processes that are in the incoming queue
		// there might be processes from previous cycles that couldn't be allocated
		for (let i = 0; i < this.queues.incoming.length;) {
			let block: MemoryBlock = this.algorithmFunctions[this.algorithm](this.queues.incoming[i].process);
			
			if (block != null) {
				// process was allocated
				let processId = -1;
				for (let j = 0; j < this.processes.length && processId < 0; j++) {
					if (this.processes[j].id == this.queues.incoming[i].process.id) {
						processId = j;
					}
				}

				for (let j = block.start; j < (block.start + this.processes[processId].size); j++) {
					this.memory[j] = processId + 1;
				}

				let process: ProcessWrap = this.queues.incoming[i];
				process.start = this.currentCycle;
				process.blockBegin = block.start;

				this.queues.allocated.push(process);
				this.queues.incoming.splice(i, 1);
			} else {
				// this process couldn't be allocated, save it for the next cycle
				i++;
			}
		}

		// increase the cycle counter
		this.currentCycle++;
	}

	/**
	 * Finds a memory block of the given type below or at the start position
	 * @param start start position for the search
	 * @param size minimum size of the found block
	 * @param type block type
	 * @returns a block, if any
	 */
	private findNextBlockFrom(start: number, size?: number, type?: number) : MemoryBlock {
		// block type, by default a free block
		let blockType: number = type || 0;

		// suppose that there isn't any block
		let memoryBlock: MemoryBlock = null;

		let i: number = start;
		while (memoryBlock == null && i < this.memory.length) {
			let blockSize: number = 0;

			// process the current block
			let j: number = i;
			while(this.memory[i] == this.memory[j]) {
				blockSize++;
				j++;
			}

			if (this.memory[i] == blockType) {
				memoryBlock = {
					start: i,
					type: blockType,
					size: blockSize
				};
			} else {
				i = j;
			}
		} 

		return memoryBlock;
	}

	private FirstFit(process: Process) : MemoryBlock {
		// find the first block of size process' size
		let block: MemoryBlock = this.findNextBlockFrom(0, process.size, 0);
		return block;
	}

	private NextFit(process: Process) : MemoryBlock {
		// find the first available block but start searching from the last block 
		// visited
		let block: MemoryBlock = this.findNextBlockFrom(this.lastSearch, process.size, 0);

		// there might not be a block below "lastSearch" block
		if (block == null) {
			// search again from the beggining
			block = this.findNextBlockFrom(0, process.size, 0);
		}

		if (block != null) {
			this.lastSearch = (block.start + process.size) % this.memory.length;
			console.log(`Next pointer is ${this.lastSearch}`);
			this.onNextPointerChange(this.lastSearch);
		}

		return block;
	}

	private WorstFit(process: Process) : MemoryBlock {
		// search the biggest block for this process
		let bestBlock: MemoryBlock = null;

		let currentBlock: MemoryBlock = this.findNextBlockFrom(0, process.size, 0);
		while (currentBlock != null) {
			if (bestBlock == null || currentBlock.size > bestBlock.size) {
				bestBlock = currentBlock;
			}

			// search for possible next block
			currentBlock = this.findNextBlockFrom(currentBlock.start + currentBlock.size, process.size, 0);
		}

		return bestBlock;
	}

	/**
	 * Sets the memory capacity and initializes.
	 */
	set capacity(value: number) {
		this.memory = [];

		for(let i = 0; i < value; i++) {
			this.memory.push(0);
		}
	}

	/**
	 * Mapping of algorithm functions by its name
	 */
	private algorithmFunctions: {[key: string]: (process: Process) => MemoryBlock} = {
		first_fit: this.FirstFit.bind(this),
		next_fit: this.NextFit.bind(this),
		worst_fit: this.WorstFit.bind(this),
	};

	/**
	 * @param process process to be wrapped
	 * @returns a new ProcessWrap object
	 */
	private createProcessWrap(process: Process) : ProcessWrap {
		return {
			start: -1,
			blockBegin: -1,
			process: process
		};
	}

	/**
	 * Selectes an algorithm for the simulation
	 * @param algorithm
	 */
	public selectAlgorithm(algorithm: string) : void {
		this.algorithm = algorithm;
	}
}

export { MemorySimulator };
export type { Process };
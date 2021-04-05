import { GiHalfBodyCrawling } from "react-icons/gi";
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
	blockEnd: number;
	process: Process;
}

type MemoryBlock = { type: number; start: number; size: number; } | null;
type Queues = {[key in "incoming" | "allocated"]: ProcessWrap[]};

class MemorySimulator extends Simulator {
	// simulator settings
	private algorithm: string;
	private oneActionPerStep: boolean;

	// simulator data
	private processes: Process[];
	private addedProcesses: number[];
	private queues: Queues;
	private running: boolean;
	private allocationHistory: ProcessWrap[];

	private currentCycle: number;
	private memory: number[];

	// for Next First algorithm
	private lastSearch: number;

	// for Buddy System algorithm
	private memoryGroups: number[];

	// callbacks
	public onMemoryChange: (data: number[]) => void;
	public onNextPointerChange: (value: number) => void;
	public onMemoryGroupsChange: (groups: number[]) => void;
	public onQueuesChange: (queues: Queues) => void;
	public onAllocationHistoryChange: (processes: ProcessWrap[]) => void;
	public onCurrentCycleChange: (cycle: number) => void;

	constructor() {
		super();

		this.processes = [];
		this.currentCycle = 0;
		this.memory = [];

		this.lastSearch = 0;

		this.onMemoryChange = () => {};
		this.onNextPointerChange = () => {};
		this.onMemoryGroupsChange = () => {};
		this.onQueuesChange = () => {};
		this.onAllocationHistoryChange = () => {};
		this.onCurrentCycleChange = () => {};

		this.algorithm = "first_fit";

		this.capacity = 16;
		this.memoryGroups = [16];

		this.queues = {
			incoming: [],
			allocated: []
		};

		this.allocationHistory = [];

		this.addedProcesses = [];

		this.oneActionPerStep = true;

		this.running = false;
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
		this.onMemoryGroupsChange(this.memoryGroups);
		this.onQueuesChange(this.queues);
		this.onAllocationHistoryChange(this.allocationHistory);
		this.onCurrentCycleChange(this.currentCycle);
	}

	private update() : void {
		if (!this.running) {
			// add processes to incoming queue
			this.processes.map(process => {
				this.queues.incoming.push(this.createProcessWrap(process));
			});

			this.running = true;
		}
		

		// we have to free the memory from processes that have finished on this cycle
		for (let i = 0; i < this.queues.allocated.length;) {
			let process: ProcessWrap = this.queues.allocated[i];
			
			if (process.process.duration > 0 && this.currentCycle >= (process.start + process.process.duration)) {
				// this process must be freed
				for (let i = process.blockBegin; i <= process.blockEnd; i++) {
					this.memory[i] = 0;
				}

				this.queues.allocated.splice(i, 1);

				if (this.algorithm == "buddy") {
					// merge empty blocks in bigger partitions
					this.memoryGroups = this.mergeMemoryBlocks(this.memoryGroups, 0);
				}

				if (this.oneActionPerStep) {
					return;
				}
			} else {
				i++;
			}
		}

		// allocate all the processes that are in the incoming queue
		// there might be processes from previous cycles that couldn't be allocated
		for (let i = 0; i < this.queues.incoming.length;) {
			if (this.currentCycle >= this.queues.incoming[i].process.arrival) {
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
					process.blockEnd = block.start + block.size - 1;

					for (let j = block.start + process.process.size; j <= process.blockEnd; j++) {
						this.memory[j] = -1;
					}

					this.queues.allocated.push(process);
					this.queues.incoming.splice(i, 1);
					this.allocationHistory.push(process);

					if (this.oneActionPerStep) {
						return;
					}
				} else {
					// this process couldn't be allocated, save it for the next cycle
					i++;
				}
			} else {
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
		
		if (block != null) {
			block.size = process.size;
		}

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
			this.onNextPointerChange(this.lastSearch);
		}

		if (block != null) {
			block.size = process.size;
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

		if (bestBlock != null) {
			bestBlock.size = process.size;
		}

		return bestBlock;
	}

	private BestFit(process: Process) : MemoryBlock {
		let bestBlock: MemoryBlock = null;

		let currentBlock: MemoryBlock = this.findNextBlockFrom(0, process.size, 0);
		while (currentBlock != null) {
			if (bestBlock == null || currentBlock.size < bestBlock.size) {
				bestBlock = currentBlock;
			}

			currentBlock = this.findNextBlockFrom(currentBlock.start + currentBlock.size, process.size, 0);
		}

		if (bestBlock != null) {
			bestBlock.size = process.size;
		}

		return bestBlock;
	}

	private BuddySystem(process: Process) : MemoryBlock {
		let block: MemoryBlock = null;

		// find the first of available memory that can fit this process
		let i: number = 0;
		let offset: number = 0;
		console.log(this.memoryGroups, this.memory)
		while (i < this.memoryGroups.length && (this.memory[offset] != 0 || this.memoryGroups[i] < process.size)) {
			offset += this.memoryGroups[i];
			i++;
		}

		if (i < this.memoryGroups.length) {
			// there is an available block
			// this block might be bigger, reduce until the process cannot fit
			while ((this.memoryGroups[i] >> 1) >= process.size) {
				let half: number = this.memoryGroups[i] >> 1;
				this.memoryGroups[i] = half;
				this.memoryGroups.splice(i, 0, half);
			}

			console.log("Assigning block of " + this.memoryGroups[i]);

			block = {
				start: offset,
				size: this.memoryGroups[i],
				type: 0
			};
		}

		return block;
	}

	private mergeMemoryBlocks(blocks: number[], offset: number) : number[] {
		if (blocks.length == 1) {
			return blocks;
		} else if (blocks.length == 2) {
			// check if both blocks can be merged
			if (this.memory[offset] == 0 && this.memory[offset + blocks[0]] == 0) {
				// blocs can be merged, the result will be a node equal to the sum
				// of both nodes, which should be a power of 2
				return [blocks[0] + blocks[1]];
			} else {
				// block cannot be merged
				return blocks;
			}
		} else {
			// find the half of the memory blocks
			let sum: number = 0;
			for (let i: number = 0; i < blocks.length; i++) {
				sum += blocks[i];
			}

			// sum is a power of 2
			let halfValue: number = sum >> 1;
			let halfIndex: number = 0;
			while (halfValue > 0) {
				halfValue -= blocks[halfIndex];
				halfIndex++;
			}

			// now we have 2 possible nodes
			let leftNode = this.mergeMemoryBlocks(blocks.slice(0, halfIndex), offset);
			let rightNode = this.mergeMemoryBlocks(blocks.slice(halfIndex), offset + sum >> 1);

			// these nodes could be merged if they are only one node
			if (leftNode.length == 1 && rightNode.length == 1) {
				return this.mergeMemoryBlocks([leftNode[0], rightNode[0]], offset);
			} else {
				// this nodes cannot be merged
				return [...leftNode, ...rightNode];
			}
		}
	}

	/**
	 * Sets the memory capacity and initializes.
	 */
	set capacity(value: number) {
		this.memory = [];

		for(let i = 0; i < value; i++) {
			this.memory.push(0);
		}

		this.memoryGroups = [value];
	}

	/**
	 * Mapping of algorithm functions by its name
	 */
	private algorithmFunctions: {[key: string]: (process: Process) => MemoryBlock} = {
		first_fit: this.FirstFit.bind(this),
		next_fit: this.NextFit.bind(this),
		worst_fit: this.WorstFit.bind(this),
		best_fit: this.BestFit.bind(this),
		buddy: this.BuddySystem.bind(this)
	};

	/**
	 * @param process process to be wrapped
	 * @returns a new ProcessWrap object
	 */
	private createProcessWrap(process: Process) : ProcessWrap {
		return {
			start: -1,
			blockBegin: -1,
			blockEnd: -1,
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
export type { Process, ProcessWrap };
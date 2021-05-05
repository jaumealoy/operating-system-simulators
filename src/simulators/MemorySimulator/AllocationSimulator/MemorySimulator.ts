import { Simulator, Algorithm } from "../../Simulator";
import MemoryState from "./MemoryState";

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

type MemoryBlock = { type: number; start: number; size: number; };
type Queues = {[key in "incoming" | "allocated"]: ProcessWrap[]};

class MemorySimulator extends Simulator {
	// simulator settings
	private _algorithm: string;
	private oneActionPerStep: boolean;

	// simulator data
	private processes: Process[];
	private _capacity: number;
	private queues: Queues;
	private running: boolean;
	private _allocationHistory: ProcessWrap[];

	private _currentCycle: number;
	//private _memory: number[];
	private _memory: MemoryBlock[];

	private states: MemoryState[];

	// for Next First algorithm
	private _lastSearch: number;

	// for Buddy System algorithm
	private _memoryGroups: number[];

	// callbacks
	public onMemoryChange: (data: MemoryBlock[]) => void;
	public onNextPointerChange: (value: number) => void;
	public onMemoryGroupsChange: (groups: number[]) => void;
	public onQueuesChange: (queues: Queues) => void;
	public onAllocationHistoryChange: (processes: ProcessWrap[]) => void;
	public onCurrentCycleChange: (cycle: number) => void;

	constructor() {
		super();

		// process list
		this.processes = [];

		// default callbacks
		this.onMemoryChange = () => {};
		this.onNextPointerChange = () => {};
		this.onMemoryGroupsChange = () => {};
		this.onQueuesChange = () => {};
		this.onAllocationHistoryChange = () => {};
		this.onCurrentCycleChange = () => {};

		// simulator data
		this.states = [];

		this._currentCycle = 0;
		this._memory = [];
		this._memoryGroups = [];
		this._capacity = 16
		this.capacity = this._capacity;
		this._lastSearch = 0;
		this.running = false;

		this.queues = {
			incoming: [],
			allocated: []
		};

		this._allocationHistory = [];

		// simulator settings
		this._algorithm = "first_fit";
		this.oneActionPerStep = true;
	}

	/**
	 * Adds a process to the request list
	 * @param process process to be added
	 */
	public addProcess(process: Process) : void {
		this.processes.push(process);

		// add it to the incoming queue
		this.queues.incoming.push(this.createProcessWrap(process));

		this.onQueuesChange(this.queues);
	}

	/**
	 * Removes a process from the request list
	 * @param index position of the process to be removed
	 */
	public removeProcess(index: number) : void {
		this.processes.splice(index, 1);

		// if a process is being removed, the simulation is not started
		// and processes and incoming queue have the same elements
		this.queues.incoming.splice(index, 1);
		this.onQueuesChange(this.queues);
	}

	public hasNextStep(): boolean {
		// there will be a next step as long as there are allocable 
		// in the incoming queue
		let nextStep: boolean = false;

		// are there processes waiting?
		let processWaiting: boolean = false;
		for (let i = 0; i < this.queues.incoming.length && !processWaiting; i++) {
			processWaiting = this.queues.incoming[i].process.arrival >= this._currentCycle;
		}

		// will a process be freed in the upcoming cycles?
		let processFreed: boolean = false;
		for (let i = 0; i < this.queues.allocated.length && !processFreed; i++) {
			processFreed = this.queues.allocated[i].process.duration != 0;
		}

		// check if all pending processes are from previous cycles
		let fromPreviousCycles: boolean = false;
		for (let i = 0; i < this.queues.incoming.length && !fromPreviousCycles; i++) {
			fromPreviousCycles = this.queues.incoming[i].process.arrival < this._currentCycle;
		}

		nextStep = processWaiting || processFreed;

		return nextStep;
	}

	public hasPreviousStep(): boolean {
		return this.states.length > 0;
	}
	
	public reset(): void {
		// clear previous steps
		this.states = [];

		// and set the simulator to its initial step
		// 1. reset the memory
		this.capacity = this._capacity; 

		// 2. initialize process queues
		this.queues = { incoming: [], allocated: [] };
		this.processes.map(process => {
			this.queues.incoming.push(this.createProcessWrap(process));
		});
		this.currentCycle = 0;
		this.running = false;
		
		// clear simulator results
		this._allocationHistory = [];

		// 3. show results
		this.onMemoryChange(this._memory);
		this.onQueuesChange(this.queues);
		this.onAllocationHistoryChange(this._allocationHistory);
	}

	public clear(): void {
		// clear the memory and reset to an empty state
		this.capacity = this._capacity;
		this._allocationHistory = [];
		this.processes = [];
		this.queues = { incoming: [], allocated: [] };
		this.currentCycle = 0;
		this.running = false;
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

	/**
	 * Processes the next step
	 */
	public nextStep() : void {
		// save current state before processing next step
		let state: MemoryState = new MemoryState(
			this._currentCycle, 
			this._memory, 
			this._memoryGroups, 
			this._allocationHistory,
			this.queues,
			this._lastSearch
		);

		this.states.push(state);

		// we can now safely change the current state
		this.update();

		this.onMemoryChange(this._memory);
		this.onMemoryGroupsChange(this._memoryGroups);
		this.onQueuesChange(this.queues);
		this.onAllocationHistoryChange(this._allocationHistory);
		this.onCurrentCycleChange(this._currentCycle);
	}

	/**
	 * Returns to the previous state
	 */
	public previousStep() : void {
		let state: MemoryState | undefined = this.states.pop();

		if (state != undefined) {
			// recover data from the previous state
			this.currentCycle = state.currentCycle;
			this.memory = state.memory;
			this.memoryGroups = state.memoryGroups;
			this._allocationHistory = state.allocationHistory;
			this.queues = state.queues;
			this.lastSearch = state.lastSearch;
		}
	}

	private update() : void {
		if (!this.running) {
			// set to an initial state
			this.queues = { incoming: [], allocated: [] }
			this._currentCycle = 0;
			this._lastSearch = 0;

			// add processes to incoming queue
			this.processes.map(process => {
				this.queues.incoming.push(this.createProcessWrap(process));
			});

			this.running = true;
		}

		// we have to free the memory from processes that have finished on this cycle
		for (let i = 0; i < this.queues.allocated.length;) {
			let process: ProcessWrap = this.queues.allocated[i];
			
			if (process.process.duration > 0 && this._currentCycle >= (process.start + process.process.duration)) {
				// this process must be freed
				// free this memory block
				let found: boolean  = false;
				let blockId: number = -1;
				for (let j = 0; j < this._memory.length && !found; j++) {
					if (this._memory[j].type > 0 && this.processes[this._memory[j].type - 1].id == process.process.id) {
						found = true;
						this._memory[j].type = 0;
						blockId = j;
					}
				}

				this.queues.allocated.splice(i, 1);

				if (this._algorithm == "buddy") {
					// before trying to merge with other blocs, check if the removed process
					// uses a partition of the power 2^i, if not merge the fragmentation with
					// the process block
					let blockSize: number = this._memory[blockId].size;
					if ((blockSize & (blockSize - 1)) != 0) {
						// block size is not a power of 2
						let mergedBlock: MemoryBlock = {
							start: this._memory[blockId].start,
							size: this._memory[blockId].size + this._memory[blockId + 1].size,
							type: 0
						};
						
						this._memory.splice(blockId, 2, mergedBlock);
					}
					
					let result = this.mergeMemoryBlocksBuddy(this._memory, this._memoryGroups);
					this._memory = result[0];
					this._memoryGroups = result[1];
				} else {
					this.mergeMemoryBlocks();
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
			if (this._currentCycle >= this.queues.incoming[i].process.arrival) {
				let block: MemoryBlock | null = this.algorithmFunctions[this._algorithm](this.queues.incoming[i].process);
				
				if (block != null) {
					// process was allocated
					let processId = -1;
					for (let j = 0; j < this.processes.length && processId < 0; j++) {
						if (this.processes[j].id == this.queues.incoming[i].process.id) {
							processId = j;
						}
					}

					// this process can be allocated in this block
					// this block might be bigger than the process allocated, in that
					// case the block must be splitted into two parts
					let processBlock: MemoryBlock = block;
					let secondBlock: MemoryBlock | null = null;
					if (this.queues.incoming[i].process.size <= block.size) {
						let blockIndex: number = this._memory.indexOf(block);
						processBlock = {
							start: block.start,
							size: this.queues.incoming[i].process.size,
							type: processId + 1
						};

						secondBlock = {
							start: block.start + this.queues.incoming[i].process.size,
							size: block.size - this.queues.incoming[i].process.size,
							type: 0
						};

						if (secondBlock.size > 0) {
							this._memory.splice(blockIndex, 1, processBlock, secondBlock);

							if (this._algorithm == "buddy") {
								secondBlock.type = -1;
							}
						} else {
							this._memory.splice(blockIndex, 1, processBlock);
						}
					}

					let process: ProcessWrap = this.queues.incoming[i];
					process.start = this._currentCycle;
					process.blockBegin = processBlock.start;

					if (this._algorithm == "buddy") {
						process.blockEnd = block.start + block.size - 1;
					} else {
						process.blockEnd = block.start + processBlock.size - 1;
					}

					console.log("Hey ", process)

					this.queues.allocated.push(process);
					this.queues.incoming.splice(i, 1);
					this._allocationHistory.push(process);

					if (this._algorithm == "next_fit") {
						this.lastSearch = (processBlock.start + processBlock.size) % this._capacity;;
					}

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
		this._currentCycle++;
	}

	private FirstFit(process: Process) : MemoryBlock | null {
		// find the first block of size process' size
		let block: MemoryBlock | null = null;
		for (let i = 0; i < this._memory.length && block == null; i++) {
			if (this._memory[i].type == 0 && this._memory[i].size >= process.size) {
				block = this._memory[i];
			}
		}

		return block;
	}

	/**
	 * Returns a block that maximizes a score function
	 * @param process 
	 * @param fn maximization function
	 * @returns 
	 */
	private MaximizeFit(process: Process, fn: (block: MemoryBlock) => number) : MemoryBlock | null {
		let block: MemoryBlock | null = null;
		let maximum: number = Number.MIN_SAFE_INTEGER;

		for (let i = 0; i < this._memory.length; i++) {
			if (this._memory[i].type == 0 && this._memory[i].size >= process.size) {
				let score: number = fn(this._memory[i]);
				if (score > maximum) {
					block = this._memory[i];
					maximum = score;
				}
			}
		}

		return block;
	}

	private NextFit(process: Process) : MemoryBlock | null {
		let block: MemoryBlock | null = null;

		let displacement: number = 0;
		while (displacement < this._capacity && block == null) {
			// find the block where the pointer is pointing
			let sum: number = 0;
			let index: number = 0;
			while (index < this._memory.length && (sum + this._memory[index].size - 1) < this._lastSearch) {
				sum += this._memory[index].size;
				index++;
			}

			let actualSize: number = this._memory[index].size + this._memory[index].start - this._lastSearch + 1;

			// check if this block has enough space for this process
			if (this._memory[index].type == 0 && process.size < actualSize) {
				// we might have to split this block if the pointer is not pointing at its start
				if (this._memory[index].start == this._lastSearch) {
					// we have found a valid block
					block = this._memory[index];
				} else {
					let firstBlock: MemoryBlock = {
						start: this._memory[index].start,
						size: this._lastSearch - this._memory[index].start,
						type: 0
					};

					let secondBlock: MemoryBlock = {
						start: this._lastSearch,
						size: (this._memory[index].start + this._memory[index].size - this._lastSearch),
						type: 0
					};

					this._memory.splice(index, 1, firstBlock, secondBlock);
					block = secondBlock;
				}
			} else {
				// this block does not have enough space, move the pointer to next block
				this._lastSearch = (this._memory[index].start + this._memory[index].size) % this._capacity;
				displacement += actualSize;
			}
		}

		return block;
	}

	private BuddySystem(process: Process) : MemoryBlock | null {
		let block: MemoryBlock | null = null;

		// find the first available block that can fit this process
		let i: number = 0;
		while (i < this._memory.length && (this._memory[i].type != 0 || this._memory[i].size < process.size)) {
			i++;
		}

		if (i < this._memory.length) {
			// find the equivalent memory group
			let sum: number = 0;
			let j: number = 0;
			while (sum < this._memory[i].start) {
				sum += this._memoryGroups[j];
				j++;
			}

			// once we have found a suitable block, we must shrink it to the minimum size possible
			while ((this._memory[i].size >> 1) >= process.size) {
				let half: number = this._memory[i].size >> 1;

				// split the block into two halves
				let firstBlock: MemoryBlock = {
					start: this._memory[i].start,
					size: half,
					type: 0
				};

				let secondBlock: MemoryBlock = {
					start: this._memory[i].start + half,
					size: half,
					type: 0
				};

				this._memory.splice(i, 1, firstBlock, secondBlock);
				this._memoryGroups.splice(j, 1, half, half);
			}

			block = this._memory[i];
		}

		return block;
	}

	private mergeMemoryBlocksBuddy(blocks: MemoryBlock[], groups: number[]) : [MemoryBlock[], number[]] {
		if (blocks.length == 1) {
			return [blocks, groups];
		} else if (blocks.length == 2) {
			// check if both blocks can be merged, both must bee free
			if (blocks[0].type == 0 && blocks[1].type == 0) {
				// create a bigger block
				let block: MemoryBlock = {
					start: blocks[0].start,
					size: blocks[0].size + blocks[1].size,
					type: 0
				};

				return [[block], [groups[0] + groups[1]]];
			} else {
				// blocks cannot be merged
				return [blocks, groups];
			}
		} else {
			// calculate what blocks belong to the left node and right node
			let sum: number = blocks.reduceRight((a, b) => a + b.size, 0);

			// sum must be a power of 2
			let halfValue: number = sum >> 1;
			let halfIndex: number = 0;
			while (halfValue > 0) {
				halfValue -= blocks[halfIndex].size;
				halfIndex++;
			}

			halfValue = sum >> 1;
			let halfGroupIndex: number = 0;
			while (halfValue > 0) {
				halfValue -= groups[halfGroupIndex];
				halfGroupIndex++;
			}

			// try to merge left nodes and right nodes
			let leftNodes = this.mergeMemoryBlocksBuddy(
				blocks.slice(0, halfIndex),
				groups.slice(0, halfGroupIndex)
			);

			let rightNodes = this.mergeMemoryBlocksBuddy(
				blocks.slice(halfIndex),
				groups.slice(halfGroupIndex)
			);

			// the current node could be merged if child nodes were merged successfully
			if (leftNodes[0].length == 1 && rightNodes[0].length == 1) {
				// try to merge the current node
				return this.mergeMemoryBlocksBuddy(
					[leftNodes[0][0], rightNodes[0][0]], 
					[leftNodes[1][0], rightNodes[1][0]]
				);
			} else {
				return [
					[...leftNodes[0], ...rightNodes[0]], 
					[...leftNodes[1], ...rightNodes[1]]
				];
			}
		}
	}

	/** */
	private mergeMemoryBlocks() : void {
		let changes: boolean = true;

		while (changes) {
			changes = false;

			for (let i = 0; i < this._memory.length - 1; i++) {
				if (this._memory[i].type == 0 && this._memory[i + 1].type == 0) {
					// there are 2 neighbour free blocks, these can be merged
					let block: MemoryBlock = {
						start: this._memory[i].start,
						size: this._memory[i].size + this._memory[i + 1].size,
						type: 0
					};

					// remove the old blocks and add the new one
					this._memory.splice(i, 2, block);

					changes = true;
					break;
				}
			}
		}
	}

	/**
	 * Sets the memory capacity and initializes.
	 */
	set capacity(value: number) {
		this._capacity = value;
		this._memory = [];

		this.initializeMemory();

		this.memoryGroups = [value];
	}

	/**
	 * Mapping of algorithm functions by its name
	 */
	private algorithmFunctions: {[key: string]: (process: Process) => MemoryBlock | null} = {
		first_fit: this.FirstFit.bind(this),
		next_fit: this.NextFit.bind(this),
		worst_fit: (process: Process) => this.MaximizeFit(process, (block) => block.size),
		best_fit: (process: Process) => this.MaximizeFit(process, (block) => -block.size),
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
		this._algorithm = algorithm;
	}

	/**
	 * Sets the memory blocks and invokes its callback
	 */
	private set memoryGroups(value: number[]) {
		this._memoryGroups = value;
		this.onMemoryGroupsChange(this._memoryGroups);
	}

	private set memory(value: MemoryBlock[]) {
		this._memory = value;
		this.onMemoryChange(this._memory);
	}

	private set currentCycle(value: number) {
		this._currentCycle = value;
		this.onCurrentCycleChange(this._currentCycle);
	}

	/**
	 * Sets the lastSearch pointer to a memory position
	 * Then invokes its callback
	 */
	private set lastSearch(value: number) {
		this._lastSearch = value;
		this.onNextPointerChange(this._lastSearch);
	}

	/**
	 * Returns the selected algorithm
	 */
	public get algorithm() : string {
		return this._algorithm;
	}

	/**
	 * Initialize an empty memory
	 */
	private initializeMemory() : void {
		this.memory = [
			{
				start: 0,
				size: this._capacity,
				type: 0
			}
		];
	}
}

export { MemorySimulator };
export type { Process, ProcessWrap, Queues, MemoryBlock };
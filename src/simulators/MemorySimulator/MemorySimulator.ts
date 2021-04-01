import { Simulator, Algorithm } from "./../Simulator";

interface Process {
	id: string;
	size: number;
	arrival: number;
	duration: number;
};

type MemoryBlock = { type: number; start: number; size: number; } | null;

class MemorySimulator extends Simulator {

	// simulator data
	private processes: Process[];
	private currentCycle: number;
	private memory: number[];

	// for Next First algorithm
	private lastSearch: number;

	constructor() {
		super();

		this.processes = [];
		this.currentCycle = 0;
		this.memory = [];

		this.lastSearch = 0;
	}

	public hasNextStep(): boolean {
		throw new Error("Method not implemented.");
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

	private update() : void {
		// we have to free the memory from processes that have finished on this cycle
		this.processes.map((process, index) => {
			if ((process.arrival + process.duration) >= this.currentCycle) {
				// this process must be freed
				let processBlock: number = index + 1;
				for (let i = 0; i < this.memory.length; i++) {
					if (this.memory[i] == processBlock) {
						this.memory[i] = 0;
					}
				}
			}
		});

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

	private NextFirst(process: Process) : MemoryBlock {
		// find the first available block but start searching from the last block 
		// visited
		let block: MemoryBlock = this.findNextBlockFrom(this.lastSearch, process.size, 0);

		// there might not be a block below "lastSearch" block
		if (block == null) {
			// search again from the beggining
			block = this.findNextBlockFrom(0, process.size, 0);
		}

		if (block != null) {
			this.lastSearch = block.start + block.size;
		}

		return block;
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
}

export { MemorySimulator };
export type { Process };
import { Simulator, Algorithm } from "./../Simulator";

interface Process {
	id: string;
	size: number;
	arrival: number;
	duration: number;
};

type MemoryBlock = { type: number; start: number; size: number; } | null;

class MemorySimulator extends Simulator {
	// simulator settings
	private algorithm: string;

	// simulator data
	private processes: Process[];
	private currentCycle: number;
	private memory: number[];

	// for Next First algorithm
	private lastSearch: number;

	// callbacks
	public onMemoryChange: (data: number[]) => void;

	constructor() {
		super();

		this.processes = [];
		this.currentCycle = 0;
		this.memory = [];

		this.lastSearch = 0;

		this.onMemoryChange = () => {};

		this.algorithm = "first_fit";

		this.capacity = 16;
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

		// allocate all the processes that arrived at this cycle
		for (let i = 0; i < this.processes.length; i++) {
			if (this.processes[i].arrival == this.currentCycle) {
				let block: MemoryBlock = this.algorithmFunctions[this.algorithm](this.processes[i]);

				if (block != null) {
					for (let j = block.start; j < (block.start + this.processes[i].size); j++) {
						this.memory[j] = i + 1;
					}
				}
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

	/**
	 * Mapping of algorithm functions by its name
	 */
	private algorithmFunctions: {[key: string]: (process: Process) => MemoryBlock} = {
		first_fit: this.FirstFit.bind(this),
		next_fit: this.NextFit.bind(this)
	};


}

export { MemorySimulator };
export type { Process };
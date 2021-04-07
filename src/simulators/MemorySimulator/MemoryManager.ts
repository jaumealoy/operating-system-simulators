import { MemorySimulator, ProcessWrap } from "./MemorySimulator";

interface MemorySimulatorResults {
	nextPointer: number;
	currentCycle: number;
	memory: number[];
	memoryGroups: number[];
	allocationHistory: ProcessWrap[];
}

class MemoryManager {
	constructor() {
		console.log("This should be called only once");
	}
}

export default MemoryManager;
import { useState } from "react";
import { Process } from "./MemorySimulator";

const useMemorySimulator = () => {
	// memory capacity
	const [memoryCapacity, setMemoryCapacityInternal] = useState<number>(16);
	const setMemoryCapacity = (value: number) => {
		// make sure that the number is a power of two
		if (value > memoryCapacity) {
			setMemoryCapacityInternal(memoryCapacity * 2);
		} else if(value < memoryCapacity) {
			let newValue: number = memoryCapacity / 2;
			if (newValue < 1) {
				newValue = 1;
			}

			setMemoryCapacityInternal(newValue);
		}
	};

	// process list
	const [processes, setProcesses] = useState<Process[]>([]);

	return {
		memoryCapacity, setMemoryCapacity
	};
};

export default useMemorySimulator;
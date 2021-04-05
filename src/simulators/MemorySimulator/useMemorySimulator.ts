import { FormEvent, useState, useRef, useEffect } from "react";
import { Process, ProcessWrap, MemorySimulator } from "./MemorySimulator";

const useMemorySimulator = () => {
	const simulator = useRef<MemorySimulator>(new MemorySimulator());

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

	// algorithm settings
	const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("first_fit");
	useEffect(() => {
		simulator.current.selectAlgorithm(selectedAlgorithm);
	}, [selectedAlgorithm]);

	// process list
	const [processes, setProcesses] = useState<Process[]>([]);
	const addProcess = (process: Process) => { 
		setProcesses([...processes, process]);
		simulator.current.addProcess(process);
	};
	const removeProcess = (index: number) => {
		processes.splice(index, 1);
		setProcesses([...processes]);
	};

	const loadProcessesFromList = (list: Process[]) => {
		setProcesses([...list]);
		list.map(process => simulator.current.addProcess(process));
	};

	// simulation results
	const [memoryData, setMemoryData] = useState<number[]>([]);
	simulator.current.onMemoryChange = (memory) => {
		console.log(memory)
		setMemoryData([...memory]);
	};

	const [nextPointer, setNextPointer] = useState<number>(0);
	simulator.current.onNextPointerChange = (value: number) => setNextPointer(value);

	const [currentCycle, setCurrentCycle] = useState<number>(0);
	simulator.current.onCurrentCycleChange = (cycle: number) => setCurrentCycle(cycle);
	
	const [memoryGroups, setMemoryGroups] = useState<number[]>([16]);
	simulator.current.onMemoryGroupsChange = (groups: number[]) => setMemoryGroups(groups);

	const [processQueues, setProcessQueues] = useState<{[key: string]: ProcessWrap[]}>({});
	simulator.current.onQueuesChange = (queues) => setProcessQueues(queues);

	const [allocationHistory, setAllocationHistory] = useState<ProcessWrap[]>([]);
	simulator.current.onAllocationHistoryChange = (processes) => setAllocationHistory(processes);

	// simulation control
	const hasNextStep = () : boolean => simulator.current.hasNextStep();

	const nextStep = () => simulator.current.nextStep();

	return {
		selectedAlgorithm, setSelectedAlgorithm,
		memoryCapacity, setMemoryCapacity,
		processes, addProcess, removeProcess, loadProcessesFromList,
		memoryData, nextPointer, memoryGroups, processQueues, allocationHistory, currentCycle,
		hasNextStep, nextStep
	};
};

export default useMemorySimulator;
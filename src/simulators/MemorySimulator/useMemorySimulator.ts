import { FormEvent, useState, useRef, useEffect } from "react";
import { Process, ProcessWrap, MemorySimulator } from "./MemorySimulator";
import MemoryManager from "./MemoryManager";

type Manager = null | MemoryManager;

const useMemorySimulator = () => {
	const simulator = useRef<MemorySimulator>(new MemorySimulator());

	const initialized = useRef<boolean>(false);
	const manager = useRef<Manager>(null);
	if (!initialized.current) {
		manager.current = new MemoryManager();
		initialized.current = true;
	}

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

	useEffect(() => {
		simulator.current.capacity = memoryCapacity;
	}, [memoryCapacity]);

	// comparaison view
	const [isSimpleView, setSimpleView] = useState<boolean>(true);

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
		simulator.current.removeProcess(index);
	};

	const loadProcessesFromList = (list: Process[]) => {
		simulator.current.clear();
		setProcesses([...list]);
		list.map(process => simulator.current.addProcess(process));
	};

	useEffect(() => {
		setRunning(false);
		setStarted(false);
		simulator.current.reset();
	}, [memoryCapacity, processes, selectedAlgorithm]);

	// simulation results
	const [memoryData, setMemoryData] = useState<number[]>([]);
	simulator.current.onMemoryChange = (memory) => {
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
	const [isRunning, setRunning] = useState<boolean>(false);
	const [isStarted, setStarted] = useState<boolean>(false);

	const hasNextStep = () : boolean => simulator.current.hasNextStep();
	const nextStep = () => {
		setStarted(true);

		simulator.current.nextStep();

		if (!simulator.current.hasNextStep()) {
			setStarted(false);
			setRunning(false);
		}
	};

	const hasPreviousStep = () : boolean => simulator.current.hasPreviousStep();
	const previousStep = () => {
		simulator.current.previousStep();
	};

	const stop = () => {
		setRunning(false);
		setStarted(false);
		simulator.current.reset();
	};

	const clear = () => {
		setRunning(false);
		setStarted(false);
		setProcesses([]);
		simulator.current.clear();
	};

	const play = () => setRunning(true);
	const pause = () => setRunning(false);

	return {
		isSimpleView, setSimpleView,
		selectedAlgorithm, setSelectedAlgorithm,
		memoryCapacity, setMemoryCapacity,
		processes, addProcess, removeProcess, loadProcessesFromList,
		memoryData, nextPointer, memoryGroups, processQueues, allocationHistory, currentCycle,
		isRunning, isStarted,
		hasNextStep, nextStep, hasPreviousStep, previousStep, stop, clear, play, pause
	};
};

export default useMemorySimulator;
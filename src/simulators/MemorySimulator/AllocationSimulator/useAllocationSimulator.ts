import { FormEvent, useState, useRef, useEffect } from "react";
import { Process, ProcessWrap, MemorySimulator } from "./MemorySimulator";
import { MemoryManager, MemorySimulatorResults } from "./MemoryManager";
import { SaveFile } from "../../Simulator";

type Manager = null | MemoryManager;

const useMemorySimulator = (simpleView: boolean) => {
	const initialized = useRef<boolean>(false);
	const manager = useRef<Manager>(null);
	if (!initialized.current) {
		manager.current = new MemoryManager();
		manager.current.onResultsChange = (results) => {
			setResults({ ...results });
		}
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
		if (manager.current != null) {
			manager.current.capacity = memoryCapacity;
		}
	}, [memoryCapacity]);

	// comparaison view
	useEffect(() => {
		if (manager.current != null) {
			manager.current.simpleView = simpleView;
			setStarted(false);
			setRunning(false);
		}
	}, [simpleView]);

	// algorithm settings
	const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("first_fit");
	const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);
	const selectAlgorithm = (algorithm: string) => {
		if (manager.current != null) {
			manager.current.selectAlgorithm(algorithm);

			if (simpleView) {
				setSelectedAlgorithm(algorithm);
			} else {
				let idx: number = selectedAlgorithms.indexOf(algorithm);
				if (idx >= 0) {
					selectedAlgorithms.splice(idx, 1);
					setSelectedAlgorithms([...selectedAlgorithms]);
				} else {
					setSelectedAlgorithms([...selectedAlgorithms, algorithm]);
				}
			}
		}
	};

	// process list
	const [processes, setProcesses] = useState<Process[]>([]);
	const addProcess = (process: Process) => {
		if (manager.current != null) {
			setProcesses([...processes, process]);
			manager.current.addProcess(process);
		}
	};
	const removeProcess = (index: number) => {
		if (manager.current != null) {
			processes.splice(index, 1);
			setProcesses([...processes]);
			manager.current.removeProcess(index);
		}
	};

	const loadProcessesFromList = (list: Process[]) => {
		if (manager.current != null) {
			manager.current.clear();
			setProcesses([...list]);

			for (let i in list) {
				manager.current.addProcess(list[i]);
			}
		}
	};

	useEffect(() => {
		if (manager.current != null) {
			setRunning(false);
			setStarted(false);
			manager.current.reset();
		}
	}, [memoryCapacity, processes, selectedAlgorithm, setSelectedAlgorithms]);

	// simulation results
	const [results, setResults] = useState<{[key: string]: MemorySimulatorResults}>({});

	// simulation control
	const [isRunning, setRunning] = useState<boolean>(false);
	const [isStarted, setStarted] = useState<boolean>(false);

	const hasNextStep = () : boolean => {
		if (manager.current != null) {
			return manager.current.hasNextStep();
		}

		return false;
	};

	const nextStep = () => {
		if (manager.current != null) {
			setStarted(true);

			manager.current.nextStep();

			if (!manager.current.hasNextStep()) {
				setStarted(false);
				setRunning(false);
			}
		}
	};

	const hasPreviousStep = () : boolean => {
		if (manager.current != null) {
			return manager.current.hasPreviousStep()
		}

		return false;
	};

	const previousStep = () => {
		if (manager.current != null) {
			manager.current.previousStep();
		}
	};

	const stop = () => {
		if (manager.current != null) {
			setRunning(false);
			setStarted(false);
			manager.current.reset();
		}
	};

	const clear = () => {
		if (manager.current != null) {
			setRunning(false);
			setStarted(false);
			setProcesses([]);
			manager.current.clear();
		}
	};

	const play = () => setRunning(true);
	const pause = () => setRunning(false);

	// load and save simulations
	const saveFile = (download: (content: string) => void) => {
		let fileData: SaveFile = {
			type: "allocation",
			data: {
				memoryCapacity: memoryCapacity,
				requests: processes,
				selectedAlgorithm,
				selectedAlgorithms
			}
		};

		download(JSON.stringify(fileData));
	};

	const loadFile = (data: string) => {
		try {
			let parsedData = JSON.parse(data);

			if ("type" in parsedData && "data" in parsedData) {
				if (parsedData["type"] == "allocation") {
					let simulatorData = parsedData["data"];

					// simulate algorithm selection
					if (manager.current != null) {
						let original = simpleView;

						clear();

						manager.current.simpleView = true;
						manager.current.selectAlgorithm(simulatorData.selectedAlgorithm);

						manager.current.simpleView = false;
						for (let i = 0; i < simulatorData.selectedAlgorithms.length; i++) {
							manager.current.selectAlgorithm(simulatorData.selectedAlgorithms[i]);
						}
 
						manager.current.simpleView = original;

						for (let i = 0; i < simulatorData.requests.length; i++) {
							manager.current.addProcess(simulatorData.requests[i]);
						}

						setMemoryCapacity(simulatorData.memoryCapacity);
						setProcesses(simulatorData.requests);
						setSelectedAlgorithm(simulatorData.selectedAlgorithm);
						setSelectedAlgorithms(simulatorData.selectedAlgorithms);
					}
				} else {
					throw new Error("Invalid File Format");
				}
			} else {
				throw new Error("JSON error");
			}
		} catch(error) {
			alert("Error while loading save file.");
		}
 	};

	return {
		selectedAlgorithm, selectedAlgorithms, selectAlgorithm,
		memoryCapacity, setMemoryCapacity,
		processes, addProcess, removeProcess, loadProcessesFromList,
		results,
		isRunning, isStarted,
		hasNextStep, nextStep, hasPreviousStep, previousStep, stop, clear, play, pause,
		saveFile, loadFile
	};
};

export default useMemorySimulator;
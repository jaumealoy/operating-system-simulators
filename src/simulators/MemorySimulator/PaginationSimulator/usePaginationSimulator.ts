import { useEffect, useRef, useState } from "react";
import { BsListOl } from "react-icons/bs";
import { 
	PaginationSimulator, 
	Process, Request,
	ProcessTable
} from "./PaginationSimulator";
import { PaginationManager, PaginationResult } from "./PaginationManager";
import { SaveFile } from "./../../Simulator";

const usePaginationSimulator = (isSimpleView: boolean) => {
	const initialized = useRef<boolean>(false);
	const manager = useRef<PaginationManager | null>(null);

	if (!initialized.current) {
		manager.current = new PaginationManager();
		initialized.current = true;
	}

	const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("optimal");
	const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);
	const selectAlgorithm = (algorithm: string) => {
		if (manager.current != null) {
			if (isSimpleView) {
				setSelectedAlgorithm(algorithm);
				manager.current.selectAlgorithm(algorithm);
			} else {
				let index: number = selectedAlgorithms.indexOf(algorithm);
				
				if (index < 0) {
					setSelectedAlgorithms([...selectedAlgorithms, algorithm]);
				} else {
					selectedAlgorithms.splice(index, 1);
					setSelectedAlgorithms([...selectedAlgorithms]);
				}

				manager.current.selectAlgorithm(algorithm);
			}
		}
	};

	// processes and requests
	const [processes, setProcesses] = useState<Process[]>([]);
	const addProcess = (process: Process) => {
		if (manager.current != null) {
			setProcesses([...processes, process]);
			manager.current.addProcess(process);
		}		
	};

	const removeProcess = (index: number) => {
		if (manager.current != null) {
			// remove all requests from this process
			let id: string = processes[index].id;
			processes.splice(index, 1);

			for (let i = 0; i < requests.length;) {
				if (requests[i].process == id) {
					requests.splice(i, 1);
				} else {
					i++;
				}
			}

			manager.current.removeProcess(index);

			setProcesses([...processes]);
			setRequests([...requests]);
		}
	};

	const [requests, setRequests] = useState<Request[]>([]);
	const addRequest = (request: Request) => {
		if (manager.current != null) {
			setRequests([...requests, request]);
			manager.current.addRequest(request);
		}
	};

	const removeRequest = (index: number) => {
		if (manager.current != null) {
			requests.splice(index, 1);
			manager.current.removeRequest(index);
			setRequests([...requests]);
		}
	};

	const loadProcessesFromList = (list: Process[]) => {
		if (manager.current != null) {
			setRequests([]);
			setProcesses([...list]);

			// removes all processes and requests from the simulator
			manager.current.clear();

			for (let i = 0; i < list.length; i++) {
				manager.current.addProcess(list[i]);
			}
		}
	};

	const loadRequestsFromList = (list: Request[]) => {
		if (manager.current != null) {
			setRequests([...list]);

			for (let i = 0; i < list.length; i++) {
				manager.current.addRequest(list[i]);
			}
		}
	};

	// simulator results
	const [results, setResults] = useState<{[key: string]: PaginationResult}>({});

	if (manager.current != null) {
		manager.current.onResultsChange = (results: {[key: string]: PaginationResult}) => {
			setResults({...results});			
		};
	}

	// simulator control
	const [isStarted, setStarted] = useState<boolean>(false);
	const [isRunning, setRunning] = useState<boolean>(false);

	const hasNextStep = () : boolean => {
		if (manager.current != null) {
			return manager.current.hasNextStep();
		}

		return false;
	};

	const nextStep = () : void => {
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
			return manager.current.hasPreviousStep();
		}

		return false;
	};

	const previousStep = () : void => {
		if (manager.current != null) {
			manager.current.previousStep();
		}
	};

	const reset = () : void => {
		if (manager.current != null) {
			manager.current.reset();
			setStarted(false);
			setRunning(false);
		}
	};

	const clear = () : void => {
		if (manager.current != null) {
			setProcesses([]);
			setRequests([]);
			manager.current.clear();
			setStarted(false);
			setRunning(false);
		}
	};

	const play = () : void => {
		if (manager.current != null) {
			setRunning(true);
		}
	};

	const pause = () : void => {
		if (manager.current != null) {
			setRunning(false);
		}
	}

	useEffect(() => {
		reset();
	}, [selectedAlgorithm, selectedAlgorithms]);

	useEffect(() => {
		if (manager.current != null) {
			manager.current.simpleView = isSimpleView;
		}
	}, [isSimpleView]);

	// load and save simulation
	const saveFile = (download: (content: string) => void) => {
		let fileData: SaveFile = {
			type: "pagination",
			data: {
				processes,
				requests,
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
				if (parsedData.type == "pagination") {
					let simulatorData = parsedData.data;

					if (manager.current != null) {
						manager.current.clear();

						// add processes and requests
						for (let i = 0; i < simulatorData.processes.length; i++) {
							manager.current.addProcess(simulatorData.processes[i]);
						}

						for (let i = 0; i < simulatorData.requests.length; i++) {
							manager.current.addRequest(simulatorData.requests[i]);
						}

						// simulate algorithm selection
						let original: boolean = isSimpleView;

						manager.current.simpleView = true;
						manager.current.selectAlgorithm(simulatorData.selectedAlgorithm);

						manager.current.simpleView = false;
						for (let i = 0; i < simulatorData.selectedAlgorithms.length; i++) {
							manager.current.selectAlgorithm(simulatorData.selectedAlgorithms[i]);
						}

						manager.current.simpleView = original;

						// update internal state
						setProcesses(simulatorData.processes);
						setRequests(simulatorData.requests);
						setSelectedAlgorithm(simulatorData.selectedAlgorithm);
						setSelectedAlgorithms(simulatorData.selectedAlgorithms);
					}
				} else {
					throw new Error();
				}
			} else {
				throw new Error();
			}
		} catch (error) {
			alert("Invalid save file");
		}
	};

	return {
		selectedAlgorithm, selectedAlgorithms, selectAlgorithm,
		processes, addProcess, removeProcess,
		requests, addRequest, removeRequest,
		loadRequestsFromList, loadProcessesFromList,
		results,
		hasNextStep, nextStep, hasPreviousStep, previousStep, reset, clear, play, pause,
		isRunning, isStarted,
		saveFile, loadFile
	};
}

export default usePaginationSimulator;
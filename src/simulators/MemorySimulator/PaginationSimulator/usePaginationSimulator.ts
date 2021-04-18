import { useEffect, useRef, useState } from "react";
import { BsListOl } from "react-icons/bs";
import { 
	PaginationSimulator, 
	Process, Request,
	ProcessTable
} from "./PaginationSimulator";
import { PaginationManager, PaginationResult } from "./PaginationManager";

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

	useEffect(() => {
		reset();
	}, [selectedAlgorithm, selectedAlgorithms]);

	useEffect(() => {
		if (manager.current != null) {
			manager.current.simpleView = isSimpleView;
		}
	}, [isSimpleView]);

	return {
		selectedAlgorithm, selectedAlgorithms, selectAlgorithm,
		processes, addProcess, removeProcess,
		requests, addRequest, removeRequest,
		loadRequestsFromList, loadProcessesFromList,
		results,
		//processTable, memory, pageFailures, currentCycle, pages,
		hasNextStep, nextStep, hasPreviousStep, previousStep, reset, clear,
		isRunning, isStarted
	};
}

export default usePaginationSimulator;
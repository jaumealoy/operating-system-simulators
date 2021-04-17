import { useEffect, useRef, useState } from "react";
import { BsListOl } from "react-icons/bs";
import { 
	PaginationSimulator, 
	Process, Request,
	ProcessTable
} from "./PaginationSimulator";

const usePaginationSimulator = (isSimpleView: boolean) => {
	const initialized = useRef<boolean>(false);
	const simulator = useRef<PaginationSimulator | null>(null);

	if (!initialized.current) {
		simulator.current = new PaginationSimulator();
		initialized.current = true;
	}

	const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("optimal");
	const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);
	const selectAlgorithm = (algorithm: string) => {
		if (simulator.current != null) {
			if (isSimpleView) {
				setSelectedAlgorithm(algorithm);
				simulator.current.selectAlgorithm(algorithm);
			} else {

			}
		}
	};

	// processes and requests
	const [processes, setProcesses] = useState<Process[]>([]);
	const addProcess = (process: Process) => {
		if (simulator.current != null) {
			setProcesses([...processes, process]);
			simulator.current.addProcess(process);
		}		
	};

	const removeProcess = (index: number) => {
		if (simulator.current != null) {
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

			simulator.current.removeProcess(index);

			setProcesses([...processes]);
			setRequests([...requests]);
		}
	};

	const [requests, setRequests] = useState<Request[]>([]);
	const addRequest = (request: Request) => {
		if (simulator.current != null) {
			setRequests([...requests, request]);
			simulator.current.addRequest(request);
		}
	};

	const removeRequest = (index: number) => {
		if (simulator.current != null) {
			requests.splice(index, 1);
			simulator.current.removeRequest(index);
			setRequests([...requests]);
		}
	};

	const loadProcessesFromList = (list: Process[]) => {
		if (simulator.current != null) {
			setRequests([]);
			setProcesses([...list]);

			// removes all processes and requests from the simulator
			simulator.current.clear();

			for (let i = 0; i < list.length; i++) {
				simulator.current.addProcess(list[i]);
			}
		}
	};

	const loadRequestsFromList = (list: Request[]) => {
		if (simulator.current != null) {
			setRequests([...list]);

			for (let i = 0; i < list.length; i++) {
				simulator.current.addRequest(list[i]);
			}
		}
	};

	// simulator results
	const [processTable, setProcessTable] = useState<ProcessTable>({});
	const [memory, setMemory] = useState<number[]>([]);
	const [pages, setPages] = useState<number[]>([]);
	const [pageFailures, setPageFailures] = useState<number>(0);
	const [currentCycle, setCurrentCycle] = useState<number>(0);

	if (simulator.current != null) {
		simulator.current.onProcessTableChange = (table) => {
			setProcessTable({...table})
		};

		simulator.current.onMemoryChange = (memory, pages) => {
			setMemory([...memory]);
			setPages([...pages]);
		};

		simulator.current.onPageFailuresChange = (value) => {
			setPageFailures(value);
		};

		simulator.current.onCurrentCycleChange = (value) => {
			setCurrentCycle(value);
		};
	}

	// simulator control
	const [isStarted, setStarted] = useState<boolean>(false);
	const [isRunning, setRunning] = useState<boolean>(false);

	const hasNextStep = () : boolean => {
		if (simulator.current != null) {
			return simulator.current.hasNextStep();
		}

		return false;
	};

	const nextStep = () : void => {
		if (simulator.current != null) {
			setStarted(true);
			simulator.current.nextStep();

			if (!simulator.current.hasNextStep()) {
				setStarted(false);
			}
		}
	};

	const hasPreviousStep = () : boolean => {
		if (simulator.current != null) {
			return simulator.current.hasPreviousStep();
		}

		return false;
	};

	const previousStep = () : void => {
		if (simulator.current != null) {
			simulator.current.previousStep();
		}
	};

	const reset = () : void => {
		if (simulator.current != null) {
			simulator.current.reset();
			setStarted(false);
			setRunning(false);
		}
	};

	const clear = () : void => {
		if (simulator.current != null) {
			setProcesses([]);
			setRequests([]);
			simulator.current.clear();
			setStarted(false);
			setRunning(false);
		}
	};

	useEffect(() => {
		reset();
	}, [selectedAlgorithm, selectedAlgorithms]);

	return {
		selectedAlgorithm, selectedAlgorithms, selectAlgorithm,
		processes, addProcess, removeProcess,
		requests, addRequest, removeRequest,
		loadRequestsFromList, loadProcessesFromList,
		processTable, memory, pageFailures, currentCycle, pages,
		hasNextStep, nextStep, hasPreviousStep, previousStep, reset, clear,
		isRunning, isStarted
	};
}

export default usePaginationSimulator;
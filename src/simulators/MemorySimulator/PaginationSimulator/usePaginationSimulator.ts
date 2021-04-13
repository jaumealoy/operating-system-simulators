import { useRef, useState } from "react";
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

		setProcesses([...processes]);
		setRequests([...requests]);
	};

	const [requests, setRequests] = useState<Request[]>([]);
	const addRequest = (request: Request) => {
		if (simulator.current != null) {
			setRequests([...requests, request]);
			simulator.current.addRequest(request);
		}
	};

	const removeRequest = (index: number) => {
		requests.splice(index, 1);
		setRequests([...requests]);
	};

	const loadProcessesFromList = (list: Process[]) => {
		if (simulator.current != null) {
			setRequests([]);
			setProcesses([...list]);

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
	const [pageFailures, setPageFailures] = useState<number>(0);
	const [currentCycle, setCurrentCycle] = useState<number>(0);

	if (simulator.current != null) {
		simulator.current.onProcessTableChange = (table) => {
			setProcessTable({...table})
		};

		simulator.current.onMemoryChange = (memory) => {
			setMemory([...memory]);
		};

		simulator.current.onPageFailuresChange = (value) => {
			setPageFailures(value);
		};

		simulator.current.onCurrentCycleChange = (value) => {
			setCurrentCycle(value);
		};
	}

	// simulator control
	const hasNextStep = () : boolean => {
		if (simulator.current != null) {
			return simulator.current.hasNextStep();
		}

		return false;
	};

	const nextStep = () : void => {
		if (simulator.current != null) {
			simulator.current.nextStep();
		}
	};

	return {
		selectedAlgorithm, selectedAlgorithms, selectAlgorithm,
		processes, addProcess, removeProcess,
		requests, addRequest, removeRequest,
		loadRequestsFromList, loadProcessesFromList,
		processTable, memory, pageFailures, currentCycle,
		hasNextStep, nextStep,
	};
}

export default usePaginationSimulator;
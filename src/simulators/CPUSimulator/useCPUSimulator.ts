import { useState, FormEvent, useEffect, useRef } from "react";
import { CPUSimulator, Process, ProcessSnapshot, ProcessWrap } from "./CPUSimulator";

const DEFAULT_NAMES: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DEFAULT_ALGORITHM: string = CPUSimulator.getAvailableAlgorithms()[0].id;

const useCPUSimulator = () => {
	// simulator manager
	const manager = useRef(null);

	const simulator = useRef(new CPUSimulator());

	// process list
	const [processes, setProcesses] = useState<Process[]>([]);
   
	const addProcess = (id: string, arrival: number, cycles: boolean[], estimatedDuration: number) : void => {
		let process: Process = {
			id,
			arrival,
			cycles,
			estimatedDuration
		};

		simulator.current.addProcess(process);

		setProcesses((processes) => [...processes, process]);
	};


	const loadProcessesFromList = (list: Process[]) => {
		// clear the current process list
		simulator.current.clear();
		setProcesses([]);
		list.map(process => addProcess(process.id, process.arrival, process.cycles, process.estimatedDuration));
	};

	const removeProcess = (index: number) : void => {
		if (index >= 0 && index < processes.length) {
			let tmp: Process[] = [...processes];
			tmp.splice(index, 1);
			setProcesses(tmp);
		}
	};

	// simulator settings (algorithm, selected quantums)
	const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(DEFAULT_ALGORITHM);

	const selectAlgorithm = (algorithm: string) => {
		// TOOD: on simple view, change the selected algorithm variable
		// and in comparaison view add or remove it from the list
		setSelectedAlgorithm(algorithm);
		simulator.current.algorithm = algorithm;
	};

	const [quantum, setQuantum] = useState<number>(1);
	useEffect(() => {
		simulator.current.quatum = quantum;
	}, [quantum]);

	// add process form
	const [name, setName] = useState<string>("");
	const [estimatedDuration, setEstimatedDuration] = useState<string>("");
	const [duration, setDuration] = useState<string>("5");
	const [cycleDistribution, setCycleDistribution] = useState<boolean[]>([]);
	const [arrival, setArrival] = useState<string>("");

	const selectCycleType = (index: number, value: boolean) : void => {
		if (index < cycleDistribution.length) {
			let distribution = [...cycleDistribution];
			distribution[index] = value;
			setCycleDistribution(distribution);
		}
	};

	useEffect(() => {
		let distribution = [];
		let p_duration: number = parseInt(duration);
		for (let i = 0; i < p_duration; i++) {
			if (i < cycleDistribution.length) {
				distribution.push(cycleDistribution[i]);
			} else {
				distribution.push(false);
			}
		}
		setCycleDistribution(distribution);
	}, [duration]);


	const onSubmit = (e: FormEvent) => {
		e.preventDefault();

		// adding the process to the list
		addProcess(
			name,
			parseInt(arrival),
			cycleDistribution,
			parseInt(estimatedDuration)
		);
	};


	// simulation results
	// simple view
	const [currentProcess, setCurrentProcess] = useState<ProcessWrap | null>(null);
	simulator.current.onProcessChange = (process: ProcessWrap | null) : void => setCurrentProcess(process);

	const [events, setEvents] = useState<ProcessSnapshot[][]>([]);
	const [queues, setQueues] = useState<{[key:string]: ProcessWrap[]}>({
		incoming: [], ready: [], blocked: []
	});

	simulator.current.onQueueChange = (q) => {
		setQueues({...q});
	};

	const [processSummary, setProcessSummary] = useState<{[key: string]: ProcessWrap}>({});
	const getProcessSummary = (id: string) => {
		let data = {
			turnaround: "-",
			response: "-",
			normalizedResponse: "-"
		};

		if (id in processSummary) {
			let turnaround = processSummary[id].finishCycle - processSummary[id].process.arrival;
			let response = processSummary[id].finishCycle -  processSummary[id].startCycle;
			data.turnaround = turnaround.toString();
			data.response = response.toString();
			data.normalizedResponse = (turnaround / processSummary[id].process.cycles.length).toFixed(2).toString();
			
		}

		return data;
	};

	simulator.current.onProcessFinish = (p: ProcessWrap) => {
		setProcessSummary({...processSummary, [p.process.id]: p});
	};

	// calculate an estimation of the simulation length
	const [simulationLength, setSimulationLength] = useState<number>(0);
	useEffect(() => {
		setSimulationLength(simulator.current.simulationTicks);
	}, [processes]);

	// simulator controls
	const hasNextStep = () : boolean => simulator.current.hasNextStep();
	const next = () => {
		setEvents([...events, simulator.current.processNextRequest()])
	};

	return {
		name, estimatedDuration, duration, cycleDistribution, arrival,
		setName, setEstimatedDuration, setDuration, setArrival, selectCycleType,
		onSubmit,
		loadProcessesFromList,
		processes,
		next,
		hasNextStep,
		currentProcess, queues, events, getProcessSummary,
		selectedAlgorithm, selectAlgorithm,
		quantum, setQuantum,
		simulationLength
	};
};

export default useCPUSimulator;
import { useState, FormEvent, useEffect, useRef } from "react";
import AlgorithmSettings from "./components/AlgorithmSettings";
import { CPUManager, SimulationResult } from "./CPUManager";
import { CPUSimulator, Process, ProcessSnapshot, ProcessWrap } from "./CPUSimulator";

const DEFAULT_NAMES: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DEFAULT_ALGORITHM: string = CPUSimulator.getAvailableAlgorithms()[0].id;



const useCPUSimulator = () => {
	// simulator manager
	const manager = useRef(new CPUManager());
	const simulator = useRef(new CPUSimulator());

	const [isSimpleView, setSimpleViewState] = useState(true);
	const setSimpleView = (value: boolean) => {
		//manager.current.simpleView = value;
		setSimpleViewState(value);
	};

	useEffect(() => {
		manager.current.simpleView = isSimpleView;
	}, [isSimpleView]);

	// process list
	const [processes, setProcesses] = useState<Process[]>([]);
   
	const addProcess = (id: string, arrival: number, cycles: boolean[], estimatedDuration: number) : void => {
		let process: Process = {
			id,
			arrival,
			cycles,
			estimatedDuration
		};

		//simulator.current.addProcess(process);
		manager.current.addProcess(process);

		setProcesses((processes) => [...processes, process]);
	};


	const loadProcessesFromList = (list: Process[]) => {
		// clear the current process list
		manager.current.clear();
		setProcesses([...list]);
		list.map(process => manager.current.addProcess(process));
	};

	const removeProcess = (index: number) : void => {
		if (index >= 0 && index < processes.length) {
			let tmp: Process[] = [...processes];
			tmp.splice(index, 1);
			setProcesses(tmp);

			simulator.current.removeProcess(index);
			manager.current.removeProcess(index);
		}
	};

	// simulator settings (algorithm, selected quantums)
	const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(DEFAULT_ALGORITHM);
	const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([]);
	const [algorithmVariants, setAlgorithmVariants] = useState<{[key: string]: AlgorithmSettings[]}>({
		rr: [],
		feedback: []
	});
	const [currentVariant, setCurrentVariant] = useState<string>("");

	const selectAlgorithm = (algorithm: string) => {
		manager.current.selectAlgorithm(algorithm);
		if (isSimpleView) {
			// just select the new algorithm
			setSelectedAlgorithm(algorithm);
			simulator.current.algorithm = algorithm;
		} else {
			// add or remove the selected algorithm from the list
			let idx: number = selectedAlgorithms.indexOf(algorithm);
			if (idx >= 0) {
				selectedAlgorithms.splice(idx, 1);
				setSelectedAlgorithms([...selectedAlgorithms]);
			} else {
				setSelectedAlgorithms([...selectedAlgorithms, algorithm]);
			}
		}
	};

	const isAlgorithmSelected = (id: string) : boolean => {
		if (isSimpleView) {
			return selectedAlgorithm == id;
		} else {
			return selectedAlgorithms.indexOf(id) >= 0;
		}
	};

	const addAlgorithmVariant = (algorithm: string, settings: AlgorithmSettings) : void => {
		if (algorithm != "rr" && algorithm != "feedback") {
			return;
		}

		setAlgorithmVariants({
			...algorithmVariants,
			[algorithm]: [
				...algorithmVariants[algorithm],
				settings
			]
		});

		manager.current.addAlgorithmVariant(algorithm, settings);
	};

	const removeAlgorithmVariant = (algorithm: string, index: number) : void => {
		if (algorithm in algorithmVariants) {
			algorithmVariants[algorithm].splice(index, 1);
			setAlgorithmVariants({
				...algorithmVariants,
				[algorithm]: [...algorithmVariants[algorithm]]
			});

			manager.current.removeAlgorithmVariant(algorithm, index);
		}
	};

	const startVariantCreation = (algorithm: string) : void => {
		if (algorithm == "rr" || algorithm == "feedback") {
			setCurrentVariant(algorithm);
		}
	};

	const [quantum, setQuantum] = useState<number>(1);
	useEffect(() => {
		simulator.current.quatum = quantum;
	}, [quantum]);

	// feedback algorithm settings
	const [feedbackSettings, setFeedbackSettings] = useState<AlgorithmSettings>({
		quantum: 1,
		quantumMode: false,
		maxQueues: 10
	});

	useEffect(() => {
		if (selectedAlgorithm == "feedback") {
			simulator.current.maxQueues = feedbackSettings.maxQueues;
			simulator.current.quantumMode = feedbackSettings.quantumMode;

			if (!feedbackSettings.quantumMode) {
				simulator.current.quatum = feedbackSettings.quantum;
			}
		} else if (selectedAlgorithm == "rr") {
			simulator.current.quatum = quantum;
		}
	}, [selectedAlgorithm, feedbackSettings]);

	const changeAlgorithmSettings = (algorithm: string, settings: AlgorithmSettings) => {
		if (algorithm == "rr") {
			setQuantum(settings.quantum);
		} else if(algorithm == "feedback") {
			setFeedbackSettings({...settings});
		}
	};

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


	const [results, setResults] = useState<{[key: string]: SimulationResult[]}>({});
	manager.current.onResultsChange = (results) => {
		setResults({...results});
	};

	// calculate an estimation of the simulation length
	const [simulationLength, setSimulationLength] = useState<number>(0);
	useEffect(() => {
		setSimulationLength(manager.current.simulationTicks);
	}, [processes, isSimpleView, algorithmVariants, selectedAlgorithms]);

	// simulator controls
	const hasNextStep = () : boolean => manager.current.hasNextStep();
	const next = () => {
		manager.current.nextStep();
		//setEvents([...events, simulator.current.processNextRequest()])
	};

	const hasPreviousStep = () : boolean => manager.current.hasPreviousStep();
	const previous = () => {
		events.splice(events.length - 1, 1);
		setEvents([...events]);
		simulator.current.previousStep();
	};

	const stop = () => {
		simulator.current.reset();
		setProcessSummary({});
		setEvents([]);
	};

	const reset = () => {
		simulator.current.clear();
		setProcesses([]);
		setProcessSummary({});
		setEvents([]);	
	};

	return {
		name, estimatedDuration, duration, cycleDistribution, arrival,
		setName, setEstimatedDuration, setDuration, setArrival, selectCycleType,
		onSubmit,removeProcess,
		loadProcessesFromList,
		processes,
		next, stop, reset, previous,
		hasNextStep, hasPreviousStep,
		currentProcess, queues, events, getProcessSummary,
		selectedAlgorithm, selectedAlgorithms, selectAlgorithm,
		quantum, setQuantum,
		feedbackSettings, setFeedbackSettings,
		simulationLength,
		isSimpleView, setSimpleView,
		isAlgorithmSelected,
		algorithmVariants, addAlgorithmVariant, removeAlgorithmVariant, startVariantCreation,
		currentVariant,
		changeAlgorithmSettings,
		results
	};
};

export default useCPUSimulator;
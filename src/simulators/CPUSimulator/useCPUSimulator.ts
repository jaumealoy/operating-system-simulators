import { useState, FormEvent, useEffect, useRef } from "react";
import AlgorithmSettings from "./components/AlgorithmSettings";
import { CPUManager, SimulationResult } from "./CPUManager";
import { CPUSimulator, Process, ProcessSnapshot, ProcessWrap } from "./CPUSimulator";

const DEFAULT_NAMES: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DEFAULT_ALGORITHM: string = CPUSimulator.getAvailableAlgorithms()[0].id;



const useCPUSimulator = () => {
	// simulator manager
	const manager = useRef(new CPUManager());

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
   
	const addProcess = (process: Process) => {
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
		} else {
			// add or remove the selected algorithm from the list
			let idx: number = selectedAlgorithms.indexOf(algorithm);
			if (idx >= 0) {
				selectedAlgorithms.splice(idx, 1);
				setSelectedAlgorithms([...selectedAlgorithms]);
			} else {
				setSelectedAlgorithms([...selectedAlgorithms, algorithm]);

				// add algorithm variants if this algorithm has any
				if (algorithm in algorithmVariants) {
					algorithmVariants[algorithm].map(variant => 
						manager.current.addAlgorithmVariant(algorithm, variant)
					);
				}
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

		// hide algorithm variant form
		setCurrentVariant("");
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
		manager.current.algorithmSettings = {
			quantum: quantum,
			quantumMode: false,
			maxQueues: 0
		}
	}, [quantum]);

	// feedback algorithm settings
	const [feedbackSettings, setFeedbackSettings] = useState<AlgorithmSettings>({
		quantum: 1,
		quantumMode: false,
		maxQueues: 10
	});

	useEffect(() => {
		manager.current.algorithmSettings = {
			quantumMode: feedbackSettings.quantumMode,
			maxQueues: feedbackSettings.maxQueues,
			quantum: (selectedAlgorithm == "rr" ? quantum : feedbackSettings.quantum)
		};

	}, [selectedAlgorithm, feedbackSettings]);

	const changeAlgorithmSettings = (algorithm: string, settings: AlgorithmSettings) => {
		if (algorithm == "rr") {
			setQuantum(settings.quantum);
		} else if(algorithm == "feedback") {
			setFeedbackSettings({...settings});
		}
	};

	// simulation results
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
	const [isStarted, setStarted] = useState<boolean>(false);

	const [isRunning, setRunning] = useState<boolean>(false); // automatic simulation
	const [speed, setSpeed] = useState<number>(0);

	const hasNextStep = () : boolean => manager.current.hasNextStep();
	const next = () => {
		if (!isStarted) {
			setStarted(true);
		}

		manager.current.nextStep();

		if (!manager.current.hasNextStep()) {
			setStarted(false);
		}
	};

	const hasPreviousStep = () : boolean => manager.current.hasPreviousStep();
	const previous = () => {
		manager.current.previousStep();
	};

	const stop = () => {
		manager.current.reset();
		setStarted(false);
	};

	const reset = () => {
		manager.current.clear();
		setProcesses([]);
		setStarted(false);
	};

	const play = () => setRunning(true);
	const pause = () => setRunning(false);

	const timerCallback = () => {
		if (manager.current.hasNextStep()) {
			next();
		} else {
			setRunning(false);
		}
	}

	// simulation will have finished once there isn't a next step
	useEffect(() => {
	
	}, []);

	// simulation reset to its initial state if there is a change in the process list or 
	// simulator settings
	useEffect(() => {
		stop();
	}, [processes, selectedAlgorithm, algorithmVariants, quantum, feedbackSettings]);

	return {
		addProcess, removeProcess,
		loadProcessesFromList,
		processes,
		next, stop, reset, previous, play, pause, timerCallback,
		hasNextStep, hasPreviousStep,
		speed, setSpeed,
		selectedAlgorithm, selectedAlgorithms, selectAlgorithm,
		quantum, setQuantum,
		feedbackSettings, setFeedbackSettings,
		simulationLength,
		isSimpleView, setSimpleView,
		isAlgorithmSelected,
		algorithmVariants, addAlgorithmVariant, removeAlgorithmVariant, startVariantCreation,
		currentVariant,
		changeAlgorithmSettings,
		results,
		isStarted, isRunning
	};
};

export default useCPUSimulator;
import { FormEvent, useState, useRef, useEffect } from "react";
import { IOSimulator, ProcessedRequest, Request } from "./IOSimulator";

const MAX_TRACKS: number = 200;

const useIOSimulator = () => {
    // simulators
	const simulators = useRef<IOSimulator[]>([]);
	const simulator = useRef<IOSimulator>(new IOSimulator());

	// algorithm selected for the simulation
	const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(
		IOSimulator.getAvailableAlgorithms()[0].id
	);

	useEffect(() => { 
		simulator.current.algorithm = selectedAlgorithm;
	}, [selectedAlgorithm]);

	// text inputs
	const [initialPosition, setInitialPosition] = useState<number>(IOSimulator.MIN);
	useEffect(() => {
		simulator.current.initialPosition = initialPosition;
	}, [initialPosition]);
	
	const [requestTrack, setRequestTrack] = useState<number>(NaN);
	const [maxTracks, setMaxTracks] = useState<number>(MAX_TRACKS);
	useEffect(() => {
		simulator.current.tracks = maxTracks;
	}, [maxTracks]);

	const [direction, setDirection] = useState<boolean>(true);

	// request list
	const [requests, setRequests] = useState<Request[]>([]);

	simulator.current.onRequestsChange = (list: Request[]) => {
		setRequests([...list]);
	};

	simulator.current.onProcessedRequestsChange = (list: ProcessedRequest[]) => {
		setProcessedRequests([...list]);
	}

	const addRequest = (track: number) => simulator.current.addRequest(track, 0);
	const removeRequest = (index: number) => simulator.current.removeRequest(index);

	const loadRequestsFromList = (requests: number[]) => {
		// remove all current requests
		simulator.current.clear();
		
		// add new requests from list
		requests.map((request: number) => addRequest(request));
	};

	// view mode
	const [isSimpleView, setSimpleView] = useState<boolean>(true);
	useEffect(() => {
		if (isSimpleView) {
			// removing all simulators
			simulators.current = [new IOSimulator()];
			simulator.current = simulators.current[0];
		} else {

		}
	}, [isSimpleView]);

	// request add form
	const onSubmitForm = (e: FormEvent) => {
		e.preventDefault();

		// adding request to simulator and UI list
		setRequestTrack(NaN);
		addRequest(requestTrack);
	};

	// processed request
	const [processedRequests, setProcessedRequests] = useState<ProcessedRequest[]>([]);

	// simulator control
	const [isStarted, setStarted] = useState(false);
	const [isRunning, setRunning] = useState(false);
	const [hasNext, setHasNext] = useState(false);
	const [hasPrevious, setHasPrevious] = useState(false);

	const step = () => {
		// simulator is running
		if(!isStarted){
			simulator.current.direction = direction;
			setStarted(true);
		}

		// process next request
		simulator.current.processRequest();
	};

	const previous = () => {
		simulator.current.previousStep();
	}

	const stop = () => {
		// reset to simulation initial state
		setStarted(false);
		setRunning(false);
		simulator.current.reset();
	};

	const reset = () => {
		// removes all requests
		setStarted(false);
		setRunning(false);
		simulator.current.clear();
	};

	const pause = () => {
		setRunning(false);
	};

	const play = () => {
		setRunning(true);
	};

	const timerCallback = () => {
		if (!hasNext) {
			setRunning(false);
			return;
		}

		step();
	};

	useEffect(() => {
		setHasNext(simulator.current.hasNextStep());
		setHasPrevious(simulator.current.hasPreviousStep());
	}, [requests, processedRequests]);

	return {
		selectedAlgorithm, setSelectedAlgorithm,
		requests, removeRequest, loadRequestsFromList,
		initialPosition, setInitialPosition,
		requestTrack, setRequestTrack,
		maxTracks, setMaxTracks,
		direction, setDirection,
		onSubmitForm,
		processedRequests,
		isRunning, isStarted,
		step, reset, stop, previous, pause, play, timerCallback,
		hasNext, hasPrevious,
		isSimpleView, setSimpleView
	};
};

export default useIOSimulator;
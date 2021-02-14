import { FormEvent, useState, useRef, useEffect } from "react";
import { IOSimulator, ProcessedRequest } from "./IOSimulator";

const useIOSimulator = () => {
    // simulator
	const simulator = useRef<IOSimulator>(new IOSimulator());

	// algorithm selected for the simulation
	const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(
		IOSimulator.getAvailableAlgorithms()[0].id
	);

	useEffect(() => { 
		simulator.current.algorithm = selectedAlgorithm 
	}, [selectedAlgorithm]);

	// text inputs
	const [initialPosition, setInitialPosition] = useState<number>(0);
	useEffect(() => {
		simulator.current.initialPosition = initialPosition;
	}, [initialPosition]);
	
	const [requestTrack, setRequestTrack] = useState<number>(0);

	// request list
	const [requests, setRequests] = useState<number[]>([]);
	const addRequest = (track: number) => setRequests([...requests, track]);
	const removeRequest = (index: number) => {
		let tmp: number[] = [...requests];
		tmp.splice(index, 1);
		setRequests(tmp);
	};

	// request add form
	const onSubmitForm = (e: FormEvent) => {
		e.preventDefault();

		// adding request to simulator and UI list
		simulator.current.addRequest(requestTrack, 0);
		addRequest(requestTrack);
	};

	// processed request
	const [processedRequests, setProcessedRequests] = useState<ProcessedRequest[]>([]);

	// simulator control
	const [isRunning, setRunning] = useState(false);
	const [hasNext, setHasNext] = useState(false);
	const [hasPrevious, setHasPrevious] = useState(false);

	const step = () => {
		// simulator is running
		setRunning(true);

		// get next request
		let nextRequest: ProcessedRequest = simulator.current.processRequest();
		setProcessedRequests([...processedRequests, nextRequest]);
	};

	const stop = () => {
		// reset to simulation initial state
		setProcessedRequests([]);
		setRunning(false);
		simulator.current.reset();
	};

	const reset = () => {
		// removes all requests
		setProcessedRequests([]);
		setRequests([]);
		setRunning(false);
		simulator.current.clear();
	};

	useEffect(() => {
		console.log("hasNext=" + simulator.current.hasNextStep());
		setHasNext(simulator.current.hasNextStep());
	}, [requests, processedRequests]);

	return {
		selectedAlgorithm, setSelectedAlgorithm,
		requests, removeRequest,
		initialPosition, setInitialPosition,
		requestTrack, setRequestTrack,
		onSubmitForm,
		processedRequests,
		isRunning,
		step, reset, stop,
		hasNext, hasPrevious
	};
};

export default useIOSimulator;
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
	const step = () => {
		// get next request
		console.log(simulator.current)
		let nextRequest: ProcessedRequest = simulator.current.processRequest();
		setProcessedRequests([...processedRequests, nextRequest]);
	};

	return {
		selectedAlgorithm, setSelectedAlgorithm,
		requests, removeRequest,
		initialPosition, setInitialPosition,
		requestTrack, setRequestTrack,
		onSubmitForm,
		processedRequests,
		step
	};
};

export default useIOSimulator;
import { exception } from "console";
import { FormEvent, useState, useRef, useEffect } from "react";
import { SaveFile } from "../Simulator";
import IOManager from "./IOManager";
import { IOSimulator, ProcessedRequest, Request } from "./IOSimulator";

// max number of tracks
const MAX_TRACKS: number = 200;

// default selected algorithm
const DEFAULT_ALGORITHM: string = IOSimulator.getAvailableAlgorithms()[0].id;

const INITIAL_VALUE: {[key: string]: ProcessedRequest[]} = {}
IOSimulator.getAvailableAlgorithms().map(algorithm => {
	INITIAL_VALUE[algorithm.id] = [];
});

const useIOSimulator = () => {
	// simulator manager
	const manager = useRef(new IOManager());

	// algorithm selected for the simulations, simple and comparaison view
	const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(DEFAULT_ALGORITHM);
	const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([DEFAULT_ALGORITHM]);

	const selectAlgorithm = (id: string) => {
		if (isSimpleView) {
			setSelectedAlgorithm(id);
		} else {
			// check if the algorithm is already selected
			if (selectedAlgorithms.indexOf(id) >= 0) {
				// remove the selected algorithm
				let tmp = [...selectedAlgorithms];
				tmp.splice(selectedAlgorithms.indexOf(id), 1);
				setSelectedAlgorithms(tmp);
			} else {
				// add the new algorithm
				setSelectedAlgorithms([...selectedAlgorithms, id]);
			}
		}
	};

	useEffect(() => {
		manager.current.selectedAlgorithms = selectedAlgorithms;
	}, [selectedAlgorithms]);


	// text inputs
	const [initialPosition, setInitialPosition] = useState<number>(IOSimulator.MIN);
	useEffect(() => {
		manager.current.initialPosition = initialPosition;
	}, [initialPosition]);
	
	const [requestTrack, setRequestTrack] = useState<number>(NaN);
	const [maxTracks, setMaxTracks] = useState<number>(MAX_TRACKS);
	useEffect(() => {
		manager.current.tracks = maxTracks;
	}, [maxTracks]);

	const [direction, setDirection] = useState<boolean>(true);

	// request list
	const [requests, setRequests] = useState<Request[]>([]);


	const addRequest = (track: number) => {
		manager.current.addRequest(track);
		setRequests((requests) => [...requests, { track: track, sector: 0 }]);
	};

	const removeRequest = (index: number) => {
		let tmp = [...requests];
		tmp.splice(index, 1);
		setRequests(tmp);
		manager.current.removeRequest(index);
	};

	const loadRequestsFromList = (requests: number[]) => {
		if(isRunning) return;

		// remove all current requests
		setRequests([]);
		manager.current.clear();
		
		// add new requests from list
		requests.map((request: number) => addRequest(request));
	};

	// view mode
	const [isSimpleView, setSimpleView] = useState<boolean>(true);
	useEffect(() => {
		// update the manager view mode
		manager.current.simpleView = isSimpleView;

		// pause the simulation
		pause();
	}, [isSimpleView]);

	// request add form
	const onSubmitForm = (e: FormEvent) => {
		e.preventDefault();

		// adding request to simulator and UI list
		setRequestTrack(NaN);
		addRequest(requestTrack);
	};

	// processed request
	const [processedRequests, setProcessedRequests] = useState<{[key: string]: ProcessedRequest[]}>(INITIAL_VALUE);
	manager.current.onProcessedRequestChange = (algorithm: string, requests: ProcessedRequest[]) => {
		setProcessedRequests((processedRequests) => ({ ...processedRequests, [algorithm]: requests }));
	};

	// simulator control
	const [isStarted, setStarted] = useState(false);
	const [isRunning, setRunning] = useState(false);
	const [hasNext, setHasNext] = useState(false);
	const [hasPrevious, setHasPrevious] = useState(false);

	const step = () => {
		// simulator is running
		if(!isStarted){
			manager.current.direction = direction;
			setStarted(true);
		}

		// process next request
		manager.current.processRequest();
	};

	const previous = () => {
		// process next request
		manager.current.previousStep();
	}

	const stop = () => {
		// reset to simulation initial state
		setStarted(false);
		setRunning(false);
		manager.current.reset();
	};

	const reset = () => {
		// removes all requests
		setRequests([]);
		setStarted(false);
		setRunning(false);
		manager.current.clear();
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
		setHasNext(manager.current.hasNextStep());
		setHasPrevious(manager.current.hasPreviousStep());
	}, [requests, processedRequests, isSimpleView]);

	// simulation storage
	const saveSimulation = (download: ((content: string) => void)) : void => {
		let req: number[] = requests.map((request: Request) => request.track);
		let data: SaveFile = {
			type: "io",
			data: {
				initialTrack: initialPosition,
				tracks: maxTracks,
				requests: req,
				algorithm: selectedAlgorithm,
				algorithms: selectedAlgorithms,
				direction: direction
			}
		};

		download(JSON.stringify(data));
	};

	const loadSimulation = (content: string) => {
		let data = JSON.parse(content);

		if (("type" in data) && data.type === "io") {
			if ("data" in data) {
				data = data.data;
				// check that we actually have all the required fields
				if (("initialTrack" in data)
					&& ("tracks" in data)
					&& ("direction" in data)
					&& ("requests" in data)
					&& ("algorithm" in data)
					&& ("algorithms" in data)
				) {

					setInitialPosition(data.initialTrack);
					setMaxTracks(data.tracks);
					setDirection(data.direction);
					setSelectedAlgorithm(data.algorithm);
					loadRequestsFromList(data.requests);
					setSelectedAlgorithms(data.algorithms);
				} else {
					throw new Error("invalid file format");
				}
			}
		}
	};

	return {
		selectedAlgorithm, setSelectedAlgorithm, selectedAlgorithms, selectAlgorithm,
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
		isSimpleView, setSimpleView,
		saveSimulation, loadSimulation
	};
};

export default useIOSimulator;
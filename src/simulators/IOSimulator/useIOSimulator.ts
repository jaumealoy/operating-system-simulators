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
			manager.current.selectedAlgorithms = [id];
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


	// errors
	const [errors, setErrors] = useState<{[key: string]: boolean}>({});
	const isFieldInvalid = (key: string) => (key in errors) && errors[key];

	// text inputs
	const [initialPosition, setInitialPosition] = useState<number>(IOSimulator.MIN);
	useEffect(() => {
		setErrors({...errors, initialPosition: false});
		manager.current.initialPosition = isNaN(initialPosition) ? 100 : initialPosition;
	}, [initialPosition]);
	
	const [requestTrack, setRequestTrack] = useState<number>(NaN);
	const [maxTracks, setMaxTracks] = useState<number>(MAX_TRACKS);
	useEffect(() => {
		setErrors({...errors, maxTracks: false});
		manager.current.tracks = isNaN(maxTracks) ? 200 : maxTracks;
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

		if (isSimpleView) {
			manager.current.selectedAlgorithms = [selectedAlgorithm]
		} else {
			manager.current.selectedAlgorithms = selectedAlgorithms;
		}

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
	/*const [hasNext, setHasNext] = useState(false);
	const [hasPrevious, setHasPrevious] = useState(false);*/
	const [speed, setSpeed] = useState(0);

	const step = () => {
		// check that everything is valid
		if (isNaN(initialPosition) || initialPosition >= maxTracks) {
			setErrors((errors) => ({...errors, initialPosition: true}));
			return;
		}

		if (isNaN(maxTracks)) {
			setErrors((errors) => ({...errors, maxTracks: true}));
			return;
		}

		// simulator is running
		if(!isStarted){
			manager.current.direction = direction;
			setStarted(true);
		}

		// process next request
		//manager.current.processRequest();
		manager.current.nextStep();

		if (!manager.current.hasNextStep()) {
			setStarted(false);
			setRunning(false);
		}
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

	const hasNext = () : boolean => {
		return manager.current.hasNextStep();
	}

	const hasPrevious = () : boolean => {
		return manager.current.hasPreviousStep();
	}

	/*useEffect(() => {
		setHasNext(manager.current.hasNextStep());
		setHasPrevious(manager.current.hasPreviousStep());
	}, [requests, processedRequests, isSimpleView]);

	useEffect(() => {
		setFinished(!hasNext);
	}, [hasNext]);*/

	useEffect(() => {
		setRunning(false);
		setStarted(false);
		manager.current.reset();
	}, [selectedAlgorithms, selectedAlgorithm, initialPosition, maxTracks, requests, direction]);

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
		saveSimulation, loadSimulation,
		speed, setSpeed,
		isFieldInvalid
	};
};

export default useIOSimulator;
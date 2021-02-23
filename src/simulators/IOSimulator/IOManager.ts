import { 
	IOSimulator, 
	Request, 
	ProcessedRequest 
} from "./IOSimulator";

import { Algorithm } from "./../Simulator";
import { throws } from "assert";

class IOManager {
	// indicates whether simple view is enabled or not
	private _simpleView: boolean;

	// simulator for simple view
	private simulator: IOSimulator;

	// simulator for comparaison view
	private _selectedAlgorithms: string[];
	private simulators: {[key: string]: IOSimulator};

	public onProcessedRequestChange: (algorithm: string, requests: ProcessedRequest[]) => void;

	constructor() {
		this.onProcessedRequestChange = () => {};

		// initializing simple view simulator
		this.simulator = new IOSimulator();
		this.simulator.onProcessedRequestsChange = (requests: ProcessedRequest[]) => {
			this.onProcessedRequestChange(this.simulator.algorithm, requests);
		};

		// initializing simulator for comparaison view
		this._selectedAlgorithms = [];
		this.simulators = {};
		IOSimulator.getAvailableAlgorithms().map((algorithm: Algorithm) => {
			this.simulators[algorithm.id] = new IOSimulator();
			this.simulators[algorithm.id].algorithm = algorithm.id;

			// set callbacks for Processed Requests
			this.simulators[algorithm.id].onProcessedRequestsChange = (requests: ProcessedRequest[]) => {
				this.onProcessedRequestChange(algorithm.id, requests);
			};
		});

		this._simpleView = true;
	}

	public hasNextStep() : boolean {
		if (this._simpleView) {
			return this.simulator.hasNextStep();
		} else {
			let nextStepAvailable: boolean = false;
			this._selectedAlgorithms.map(algorithm => {
				nextStepAvailable = nextStepAvailable 
					|| this.simulators[algorithm].hasNextStep();
			});
			return nextStepAvailable;
		}
	}

	public hasPreviousStep() : boolean {
		if (this._simpleView) {
			return this.simulator.hasPreviousStep();
		} else {
			let previousStepAvailable: boolean = false;
			this._selectedAlgorithms.map(algorithm => {
				previousStepAvailable = previousStepAvailable 
					|| this.simulators[algorithm].hasPreviousStep();
			});
			return previousStepAvailable;
		}
	}

	public addRequest(track: number) : void {
		// add the request to ALL simulators
		this.simulator.addRequest(track, 0);
		Object.values(this.simulators).map(simulator => {
			simulator.addRequest(track, 0);
		});
	}

	public removeRequest(index: number) : void {
		// remove request from ALL simulators
		this.simulator.removeRequest(index);
		Object.values(this.simulators).map(simulator => {
			simulator.removeRequest(index);
		});
	}

	public clear() : void {
		this.simulator.clear();
		Object.values(this.simulators).map(simulator => {
			simulator.clear();
		});
	}

	public reset() : void {
		this.simulator.reset();
		Object.values(this.simulators).map(simulator => {
			simulator.reset();
		});
	}

	public previousStep() : void {
		if (this.simpleView) {
			this.simulator.previousStep();
		} else {
			Object.values(this.simulators).map(simulator => {
				if (simulator.hasPreviousStep()) {
					simulator.previousStep();
				}
			});
		}
	}

	public processRequest() : void {
		if (this.simpleView) {
			this.simulator.processRequest();
		} else {
			Object.values(this.simulators).map(simulator => {
				if (simulator.hasNextStep()) {
					simulator.processRequest();
				}
			});
		}
	}

	set simpleView(enabled: boolean) {
		this._simpleView = enabled;

		// trigger callbacks
		if (this._simpleView) {
			this.onProcessedRequestChange(this.simulator.algorithm, []);
		} else {
			Object.values(this.simulators).map(simulator => simulator.triggerCallbacks());
		}
	}

	set selectedAlgorithms(list: string[]) {
		this._selectedAlgorithms = list;
	}

	// simulator setters
	set direction(value: boolean) {
		this.simulator.direction = value;
		Object.values(this.simulators).map(simulator => {
			simulator.direction = value;
		});
	}

	set tracks(value: number) {
		this.simulator.tracks = value;
		Object.values(this.simulators).map(simulator => {
			simulator.tracks = value;
		});
	}

	set initialPosition(value: number) {
		this.simulator.initialPosition = value;
		Object.values(this.simulators).map(simulator => {
			simulator.initialPosition = value;
		});
	}
}

export default IOManager;
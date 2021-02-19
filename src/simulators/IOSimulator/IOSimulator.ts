import { 
	Simulator, 
	Algorithm,
} from "../Simulator";

import State from "./../State";
import IOState from "./IOState";

interface Request {
	track: number;
	sector: number;
	fast?: boolean;
};

interface ProcessedRequest {
	initialTrack: number;
	finalTrack: number;
	fast: boolean;
}

interface NextRequest {
	index: number;
	request: Request;
}

class IOSimulator extends Simulator {
	// hard drive settings
	private sectors: number;
	private _tracks: number;
	public static MIN: number = 0;

	// simulation settings
	private currentTrack: number;
	private currentSector: number;
	private _initialPosition: number;
	private isUp: boolean;
	private running: boolean;

	// request list
	private requests: Request[];
	private pendingRequests: Request[];
	private proceesedRequests: ProcessedRequest[];

	// selected algorithm
	private _algorithm: string;

	// callbacks for state update
	protected states: IOState[];
	public onRequestsChange: (list: Request[]) => void;
	public onProcessedRequestsChange: (list: ProcessedRequest[]) => void;

	constructor(){
		super();

		this.sectors = 0;
		this._tracks = 0;
		this.currentTrack = 0;
		this.currentSector = 0;
		this._initialPosition = 0;

		this.requests = [];
		this.pendingRequests = [];
		this.proceesedRequests = [];

		this._algorithm = "fifo";
		this.isUp = true;

		this.running = false;

		this.states = [];

		// initial callback values
		this.onRequestsChange = () => {};
		this.onProcessedRequestsChange = () => {};
	}

	/**
	 * Adds a request to the simulator
	 * Requests can only be added BEFORE starting the simulation
	 * @param track
	 * @param sector 
	 */
	public addRequest(track: number, sector: number) : void {
		let request: Request = {
			track,
			sector
		};

		this.requests.push(request);
		this.pendingRequests.push(request);

		// request array has changed
		this.onRequestsChange(this.requests);
	}

	/**
	 * Removes a request from the list.
	 * Requests can only be removed BEFORE starting the simulation
	 * @param index request to be removed
	 */
	public removeRequest(index: number) : void {
		if (index >= this.requests.length) {
			// this request does not exist
			return;
		}

		// as the simulation has not started yet, index will be the same on 
		// the requests list and the pending list
		this.requests.splice(index, 1);
		this.pendingRequests.splice(index, 1);

		// request array has changed
		this.onRequestsChange(this.requests);
	}

	private getNextRequest() : NextRequest {
		if(!this.running){
			// simulator might have been run before, make sure
			// that the current track is the one set on the initial position input
			this.running = true;
			this.currentTrack = this._initialPosition;
		}

		let ALGORITHM_MAP: {[key: string]: () => number} = {
			"fcfs": this.FCFS,
			"sstf": this.SSTF.bind(this),
			"scan": this.SCAN.bind(this),
			"look": this.LOOK.bind(this),
			"cscan": this.CSCAN.bind(this),
			"clook": this.CLOOK.bind(this)
		};

		let nextIndex = ALGORITHM_MAP[this._algorithm]();

		return {
			index: nextIndex,
			request: this.pendingRequests[nextIndex]
		};
	}

	public processRequest() : ProcessedRequest {
		// save current state
		let currentState: IOState = new IOState(this.currentTrack, [...this.pendingRequests], [...this.proceesedRequests]);
		this.states.push(currentState);

		let nextRequest: NextRequest = this.getNextRequest();

		let processedRequest: ProcessedRequest = {
			initialTrack: this.currentTrack,
			finalTrack: nextRequest.request.track,
			fast: nextRequest.request.fast || false
		};

		this.currentTrack = processedRequest.finalTrack;

		// removing this request from the pending list
		this.pendingRequests.splice(nextRequest.index, 1);

		// add this request to the processed list
		this.proceesedRequests.push(processedRequest);
		this.onProcessedRequestsChange(this.proceesedRequests);

		return processedRequest;
	}

	private FCFS() : number {
		return 0;
	}

	/**
	 * Returns the index of the request which minimizes search distance
	 */
	private SSTF() : number {
		// calculates the distance between the current track and a target
		let calculateDistance = (track: number) : number => Math.abs(track - this.currentTrack);

		// find the request that minimizes this distance
		let index: number = 0;
		let dist: number = calculateDistance(this.pendingRequests[index].track);
		for (let i = 1; i < this.pendingRequests.length; i++) {
			let tmp = calculateDistance(this.pendingRequests[i].track);
			if (tmp < dist) {
				index = i;
				dist = tmp;
			}
		}

		return index;
	}

	/**
	 * Elevator algorithm. 
	 */
	private SCAN() : number {
		let index: number = this.findNextRequest();

		if (index < 0) {
			// there isn't any available request on this direction
			// the head must reach the maximum track and then change its direction
			let next: number = this.isUp ? this.maxTrack : IOSimulator.MIN;

			// and then change the direction
			this.isUp = !this.isUp;

			if (next == this.currentTrack) {
				// the head is already on the disk's edge
				// the next request is the actual next request
				index = this.findNextRequest();	
			} else {
				// let's fake that movement
				this.pendingRequests.push({ 
					track: next, 
					sector: 0 
				});

				index = this.pendingRequests.length - 1;
			}
		}

		return index;
	}

	/**
	 * Look algorithm
	 */
	private LOOK() : number {
		let index: number = this.findNextRequest();
		if (index < 0) {
			// there isn't any pending request on this direction
			// reverse the direction and find the nearest request
			this.isUp = !this.isUp;
			index = this.findNextRequest();
		}

		return index;
	}

	private CSCAN() : number {
		let index: number = this.findNextRequest();

		if (index < 0) {
			// there isn't request more in this direction
			// however, before going back to the other edge we must reach the edge
			if (this.isUp && this.currentTrack == this.maxTrack || !this.isUp && this.currentTrack == IOSimulator.MIN) {
				// this is one edge, we must go to the other one
				// fake this request
				this.pendingRequests.push({
					track: (this.isUp ? IOSimulator.MIN : this.maxTrack),
					sector: 0,
					fast: true
				});
			} else {
				// fake a request to the edge
				this.pendingRequests.push({
					track: (this.isUp ? this.maxTrack : IOSimulator.MIN),
					sector: 0,
				});
			}

			index = this.pendingRequests.length - 1;
		}

		return index;
	}

	private CLOOK() : number {
		let index: number = this.findNextRequest();

		if (index < 0) {
			// there isn't any request more in this direction
			// move the head to the nearest request to the other edge
			let originalTrack: number = this.currentTrack;
			this.currentTrack = (this.isUp ? IOSimulator.MIN : this.maxTrack);
			index = this.findNextRequest();
			this.currentTrack = originalTrack;
		}

		return index;
	}

	/**
	 * Returns the nearest requests to the current head position according to its direction
	 * If there isn't any available requests, it returns -1.
	 */
	private findNextRequest() : number {
		let index: number = -1;

		for (let i = 0; i < this.pendingRequests.length; i++) {
			if(this.isUp 
				&& this.pendingRequests[i].track >= this.currentTrack 
				&& (index < 0 || index >= 0 && this.pendingRequests[i].track < this.pendingRequests[index].track)){
				index = i;
			}else if(!this.isUp 
				&& this.pendingRequests[i].track <= this.currentTrack
				&& (index < 0 || index >= 0 && this.pendingRequests[i].track > this.pendingRequests[index].track)){
				index = i;
			}
		}

		return index;
	}

	/**
	 * Returns a list of available algorithms for this simulator
	 */
	public static getAvailableAlgorithms() : Algorithm[] {
		return [
			{ id: "fcfs", name: "First Come First Served (FCFS)" },
			{ id: "sstf", name: "Shortest Seek Time First (SSTF)" },
			{ id: "scan", name: "SCAN" },
			{ id: "cscan", name: "C-SCAN" },
			{ id: "look", name: "LOOK" },
			{ id: "clook", name: "C-LOOK" },
		];
	}

	set algorithm(id: string) {
		this._algorithm = id;
	}

	set initialPosition(value: number) {
		this._initialPosition = value;
	}

	/**
	 * Resets the pending requests to its initial state
	 */
	public reset() : void {
		// make a copy as we want to keep the original list of requests
		this.pendingRequests = [...this.requests];

		// set the initial position as the current position
		this.currentTrack = this._initialPosition;

		// clear the processed request list
		this.proceesedRequests = [];
		this.onProcessedRequestsChange(this.proceesedRequests);

		this.states = [];

		this.running = false;
	}

	public clear() : void {
		this.requests = [];
		this.pendingRequests = [];
		this.proceesedRequests = [];
		this.states = [];
		this.running = false;

		// notify request changes
		this.onRequestsChange(this.requests);
		this.onProcessedRequestsChange(this.proceesedRequests);
	}

	public previousStep() : void {
		// fetch last state
		let state: IOState | undefined = this.states.pop();

		if(state !== undefined) {
			this.pendingRequests = state.pendingRequests;
			this.currentTrack = state.currentTrack;
			this.proceesedRequests = state.processedRequests;

			this.onProcessedRequestsChange(this.proceesedRequests);
		}
	}

	public hasNextStep() : boolean {
		return this.pendingRequests.length > 0;
	}

	public hasPreviousStep() : boolean {
		return this.states.length > 0;
	}

	get tracks() : number {
		return this._tracks;
	}

	set tracks(value: number) {
		this._tracks = value;
	}	

	/**
	 * Sets header direction.
	 * True for UP, False for DOWN
	 */
	set direction(up: boolean) {
		this.isUp = up;
	}

	private get maxTrack() : number {
		return this._tracks - 1 + IOSimulator.MIN;
	}
}

export {
	IOSimulator
};

export type { 
	Request,
	ProcessedRequest
};
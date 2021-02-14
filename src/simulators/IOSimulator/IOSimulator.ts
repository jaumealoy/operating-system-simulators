import { 
	Simulator, 
	Algorithm
} from "../Simulator";

interface Request {
	track: number;
	sector: number;
};

interface ProcessedRequest {
	initialTrack: number;
	finalTrack: number;
}

interface NextRequest {
	index: number;
	request: Request;
}

class IOSimulator extends Simulator {
	// hard drive settings
	private sectors: number;
	private tracks: number;

	// simulation settings
	private currentTrack: number;
	private currentSector: number;

	// request list
	private requests: Request[];
	private pendingRequests: Request[];

	// selected algorithm
	private _algorithm: string;

	constructor(){
		super();

		this.sectors = 0;
		this.tracks = 0;
		this.currentTrack = 0;
		this.currentSector = 0;

		this.requests = [];
		this.pendingRequests = [];

		this._algorithm = "fifo";
	}

	/**
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
	}

	private getNextRequest() : NextRequest {
		let ALGORITHM_MAP: {[key: string]: () => number} = {
			"fifo": this.FIFO,
			"sstf": this.SSTF.bind(this)
		};

		let nextIndex = ALGORITHM_MAP[this._algorithm]();

		return {
			index: nextIndex,
			request: this.pendingRequests[nextIndex]
		};
	}

	public processRequest() : ProcessedRequest {
		let nextRequest: NextRequest = this.getNextRequest();

		let processedRequest: ProcessedRequest = {
			initialTrack: this.currentTrack,
			finalTrack: nextRequest.request.track
		};

		this.currentTrack = processedRequest.finalTrack;

		// removing this request from the pending list
		this.pendingRequests.splice(nextRequest.index, 1);

		return processedRequest;
	}

	private FIFO() : number {
		return 0;
	}

	/**
	 * Returns the index of the request which minimizes search distance
	 */
	private SSTF() : number {
		// calculates the distance between the current track and a target
		let calculateDistance = (track: number) : number => Math.abs(track - this.currentTrack);

		console.log(this)
		console.log(this.pendingRequests)

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
	 * Returns a list of available algorithms for this simulator
	 */
	public static getAvailableAlgorithms() : Algorithm[] {
		return [
			{ id: "fifo", name: "First In First Served (FIFO)" },
			{ id: "sstf", name: "Shortest Seek Time First (SSTF)" }
		];
	}

	set algorithm(id: string) {
		this._algorithm = id;
	}
}

export {
	IOSimulator
};

export type { 
	Request,
	ProcessedRequest
};
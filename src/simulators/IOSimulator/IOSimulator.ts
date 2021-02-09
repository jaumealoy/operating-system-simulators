import Simulator from "../Simulator";

interface Request {
	track: number;
	sector: number;
};

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

	constructor(){
		super();

		this.sectors = 0;
		this.tracks = 0;
		this.currentTrack = 0;
		this.currentSector = 0;

		this.requests = [];
	}

	/**
	 * @param track
	 * @param sector 
	 */
	public addRequest(track: number, sector: number) : void {
		this.requests.push({
			track,
			sector
		});
	}

	private getNextRequest() : NextRequest {
		let nextIndex = this.FIFO();

		return {
			index: nextIndex,
			request: this.requests[nextIndex]
		};
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

		// find the request that minimizes this distance
		let index: number = 0;
		let dist: number = calculateDistance(this.requests[index].track);
		for (let i = 1; i < this.requests.length; i++) {
			let tmp = calculateDistance(this.requests[i].track);
			if (tmp < dist) {
				index = i;
				dist = tmp;
			}
		}

		return index;
	}
}

export {
	IOSimulator
};

export type { 
	Request
};
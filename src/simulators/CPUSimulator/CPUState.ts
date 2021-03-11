import State from "./../State";
import { Process, ProcessWrap } from "./CPUSimulator";

class CPUState extends State {
    private _currentProcess: ProcessWrap | null;
    private _queues: {[key: string]: ProcessWrap[]};
    private _readyQueues: ProcessWrap[][];
    private _cycle: number;

    constructor(process: ProcessWrap | null, cycle: number, queues: {[key: string]: ProcessWrap[]}, readyQueues: ProcessWrap[][]) {
        super();

		this._cycle = cycle;
		this._currentProcess = process == null ? null : CPUState.copy(process);

		this._queues = {};
		Object.entries(queues).map(
			([key, value]) => 
				this._queues[key] = value.map(process => CPUState.copy(process))
		);

		this._readyQueues = [];
		for (let i = 0; i < readyQueues.length; i++) {
			this._readyQueues.push(readyQueues[i].map(process => CPUState.copy(process)));
		}
    }

	private static copy(process: ProcessWrap) : ProcessWrap {
		// we only want to copy data such as current cycle and process state
		// not the original information inputed by the user
		return { ...process };
	};

	public get currentProcess() : ProcessWrap | null {
		return this._currentProcess;
	}

	public get queues() : {[key: string]: ProcessWrap[]} {
		return this._queues;
	}

	public get readyQueues() : ProcessWrap[][] {
		return this._readyQueues;
	}

	public get cycle() : number {
		return this._cycle;
	}
}

export default CPUState;
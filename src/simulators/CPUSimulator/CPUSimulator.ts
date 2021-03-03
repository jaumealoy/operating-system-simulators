import { 
    Simulator, 
    Algorithm 
} from "../Simulator";

interface Process {
    arrival: number;
    cycles: boolean[];
    estimatedDuration: number;
};

interface ProcessWrap {
    currentCycle: number;
    process: Process;
};

class CPUSimulator extends Simulator {
    // processor status
    private _currentProcess: Process | null;
    private _queues: {[key: string]: ProcessWrap[]};

    // simulator settings
    private _algorithm: string;
    private _processList: Process[];
    private _quantum: number;

    // simulator status
    private _running: boolean;

    constructor() {
        super();

        this._running = false;

        this._algorithm = "fifo";
        this._processList = [];
        this._quantum = 0;

        this._currentProcess = null;
        this._queues = {
            incoming: [],
            blocked: [],
            ready: []
        };
    }

    public hasNextStep(): boolean {
        throw new Error("Method not implemented.");
    }
    public hasPreviousStep(): boolean {
        throw new Error("Method not implemented.");
    }
    public reset(): void {
        throw new Error("Method not implemented.");
    }
    public clear(): void {
        throw new Error("Method not implemented.");
    }

    public static getAvailableAlgorithms() : Algorithm[] {
        return [
            { id: "fifo", name: "First In First Out" },
            { id: "spn", name: "Shortest Process Next" },
            { id: "srn", name: "Shortest Remaining Time Next" },
            { id: "hrn", name: "Highest Reponse Next" },
            { id: "rr", name: "Round Robin" },
            { id: "feedback", name: "Feedback" },
        ];
    }

    /**
     * Performs the simulation (withou changing the current state) and returns
     * the number of ticks that it will take
     */
    get simulationTicks() : number {
        return 10;
    }

    set quatum(value: number) {
        if (value >= 1) {
            this._quantum = value;
        }
    }
}

export { CPUSimulator };
export type { Process };
import State from "./State";

interface Algorithm {
	id: string;
	name: string;
}

abstract class Simulator {
	constructor() {
		
	}

	public abstract hasNextStep() : boolean;
	public abstract hasPreviousStep() : boolean;

	/**
	 * Sets the simulator to its initial state
	 */
	public abstract reset() : void;

	/**
	 * Sets the simulator to an empty state, without any request
	 */
	public abstract clear() : void;
};

interface SaveFile {
	type: "io" | "cpu" | "memory";
	data: any;
};

export { 
	Simulator
};

export type {
	Algorithm, SaveFile
};
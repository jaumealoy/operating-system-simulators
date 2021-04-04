import React from "react";
import { Process } from "./../MemorySimulator";

interface ProcessListProps {
	processes: Process[];
	onRemoveProcess: (index: number) => void;
};

function ProcessList(props: ProcessListProps) {
	return (
		props.processes.length == 0 ?
			<>
				No se han añadido peticiones.
			</>
		:
			<>
				{props.processes.map(process => 
					<div key={process.id}>
						{process.id}
					</div>    
				)}
			</>
	);
}

export default ProcessList;
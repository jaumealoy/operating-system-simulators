import React from "react";
import { Process } from "./../MemorySimulator";
import { FiDelete } from "react-icons/fi";

interface ProcessListProps {
	processes: Process[];
	onRemoveProcess: (index: number) => void;
	deletable?: boolean;
};

function ProcessList(props: ProcessListProps) {
	let deletionEnabled: boolean = props.deletable || false;

	return (
		props.processes.length == 0 ?
			<>
				No se han añadido peticiones.
			</>
		:
			<>
				<table className="table horizontal-table">
					<thead>
						<tr>
							<th>Nombre</th>
							<th>Llegada</th>
							<th>Memoria</th>
						</tr>
					</thead>

					<tbody>
						{props.processes.map((process, index) =>
							<tr>
								<td>
									{process.id}
									{deletionEnabled &&
										<button 
											className="btn btn-sm btn-link py-0"
											onClick={() => props.onRemoveProcess(index)}>
											<FiDelete />
										</button>
									}
								</td>
								<td>{process.arrival}</td>
								<td>{process.size}</td>
							</tr>
						)}
					</tbody>
				</table>
			</>
	);
}

export default ProcessList;
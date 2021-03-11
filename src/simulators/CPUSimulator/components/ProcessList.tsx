import React from "react";
import { FormGroup } from "react-bootstrap";
import CycleDistribution from "./../CycleDistribution";
import { useTranslation } from "react-i18next";
import { Process } from "./../CPUSimulator";

import { FiDelete } from "react-icons/fi";

interface ProcessListProps {
	processes: Process[];
	deletionEnabled?: boolean;
	onDeleteProcess?: (index: number) => void;
};

function ProcessList(props: ProcessListProps) {
	const { t } = useTranslation();

	let removeProcess = props.onDeleteProcess || (() => {});
	let deletionEnabled: boolean = props.deletionEnabled || false;

	return (
		<>
			{props.processes.length == 0 ?
				"No has introducido ninguna petición"
				:
				props.processes.map((process, index) => 
					<div className="mr-2" key={`process_${process.id}`}> 
						<table className="table">
							<tbody>
								<tr>
									<th>Nombre</th>
									<td>
										{process.id}

										{deletionEnabled &&
											<button 
												className="btn float-right btn-sm btn-link py-0"
												onClick={() => removeProcess(index)}>
												<FiDelete />
											</button>
										}
									</td>
								</tr>

								<tr>
									<th>Llegada</th>
									<td>{process.arrival}</td>
								</tr>

								<tr>
									<th>Distribución</th>
									<td>
										<FormGroup className="cpu-cycle-distribution">
										<CycleDistribution 
											editable={false}
											cycles={process.cycles}
											currentCycle={Number.MAX_VALUE} />
										</FormGroup>
									</td>
								</tr>
							</tbody>
						</table>
					</div>	
				)
			}
		</>
	);
}

export default ProcessList;
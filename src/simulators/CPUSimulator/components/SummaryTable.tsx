import React from "react";
import { Process, ProcessWrap } from "../CPUSimulator";

interface SummaryTableProps {
	processes: Process[];
	processData: {[key: string]: ProcessWrap};
	extendedHeader?: boolean
};

function SummaryTable(props: SummaryTableProps) {
	let fullHeader: boolean = props.extendedHeader || false;

	return (
		<table className="table text-center">
			<thead>
				<tr>
					<th>Proceso</th>
					<th>
						{fullHeader ?
							<>Tiempo de servicio (T<sub>s</sub>)</>
							:
							<>T<sub>s</sub></>
						}
					</th>
					<th>
						{fullHeader ?
							<>Tiempo de retorno (T<sub>r</sub>)</>
							:
							<>T<sub>r</sub></>
						}
					</th>
					<th>
						{fullHeader ?
							<>Tiempo de respuesta (T<sub>response</sub>)</>
							:
							<>T<sub>response</sub></>
						}
					</th>
					<th>
						{fullHeader ?
							<>Tiempo de respuesta normalizado (T<sub>normalized response</sub>)</>
							:
							<>T<sub>normalized response</sub></>
						}
					</th>
				</tr>
			</thead>

			<tbody>
				{props.processes.map(process => 
					<tr key={`summary_${process.id}`}>
						<td>{process.id}</td>
						<td>{process.cycles.length}</td>
						<td>
							{process.id in props.processData ?
								props.processData[process.id].finishCycle - process.arrival
								:
								"-"
							}
						</td>
						<td>
							{process.id in props.processData ?
								props.processData[process.id].finishCycle - props.processData[process.id].startCycle
								:
								"-"
							}
						</td>
						
						<td>
							{process.id in props.processData ?
								((props.processData[process.id].finishCycle - process.arrival) / process.cycles.length).toFixed(2)
								:
								"-"
							}
						</td>
					</tr>
				)}
			</tbody>
		</table>
	)
}

export default SummaryTable;
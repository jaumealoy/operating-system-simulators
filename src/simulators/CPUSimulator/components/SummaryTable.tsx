import React from "react";
import { useTranslation } from "react-i18next";
import { Process, ProcessWrap } from "../CPUSimulator";

interface SummaryTableProps {
	processes: Process[];
	processData: {[key: string]: ProcessWrap};
	extendedHeader?: boolean
};

function SummaryTable(props: SummaryTableProps) {
	const { t } = useTranslation();

	let fullHeader: boolean = props.extendedHeader || false;

	return (
		<table className="table text-center">
			<thead>
				<tr>
					<th>{t("cpu.summary.process")}</th>
					<th>
						{fullHeader ?
							<>{t("cpu.summary.service_time")} (T<sub>s</sub>)</>
							:
							<>T<sub>s</sub></>
						}
					</th>
					<th>
						{fullHeader ?
							<>{t("cpu.summary.turnaround_time")} (T<sub>r</sub>)</>
							:
							<>T<sub>r</sub></>
						}
					</th>
					<th>
						{fullHeader ?
							<>{t("cpu.summary.response_time")} (T<sub>response</sub>)</>
							:
							<>T<sub>response</sub></>
						}
					</th>
					<th>
						{fullHeader ?
							<>{t("cpu.summary.normalized_response_time")} (T<sub>normalized response</sub>)</>
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
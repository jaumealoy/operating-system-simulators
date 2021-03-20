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

	const turnaroundTime: (process: Process) => number = (process) => {
		if (!(process.id in props.processData)) {
			return NaN;
		}

		return props.processData[process.id].finishCycle - process.arrival;
	};

	// calculate averages
	let turnaroundTimeAverage: number = NaN;
	let normalizedTimeAverage: number = NaN;

	let tmpA: number = 0;
	let tmpB: number = 0;
	let counter: number = 0;

	props.processes.map(process => {
		if (process.id in props.processData) {
			let time: number = turnaroundTime(process);
			tmpA += time;
			tmpB += (time / process.cycles.length);
			counter++;
		}
	});

	if (counter > 0 && counter == props.processes.length) {
		turnaroundTimeAverage = tmpA / counter;
		normalizedTimeAverage = tmpB / counter; 
	}

	return (
		<table className="table text-center">
			<thead>
				<tr>
					<th></th>
					<th>{t("cpu.arrival")}</th>
					<th>{t("cpu.summary.start")}</th>
					<th>{t("cpu.summary.end")}</th>

					<th>
						{fullHeader ?
							<>{t("cpu.summary.response_time")} (T<sub>response</sub>)</>
							:
							<>T<sub>response</sub></>
						}
					</th>

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
						T<sub>r</sub> / T<sub>s</sub>
					</th>
				</tr>
			</thead>

			<tbody>
				{props.processes.map(process => 
					<tr key={`summary_${process.id}`}>
						<td>{process.id}</td>
						<td>{process.arrival}</td>
						<td>
							{process.id in props.processData ?
								props.processData[process.id].startCycle
								:
								"-"
							}
						</td>
						<td>
							{process.id in props.processData ?
								props.processData[process.id].finishCycle
								:
								"-"
							}
						</td>

						<td>
							{process.id in props.processData ?
								props.processData[process.id].startCycle - process.arrival
								:
								"-"
							}
						</td>

						<td>{process.cycles.length}</td>
						
						<td>
							{isNaN(turnaroundTime(process)) ? 
								"-"
								:
								turnaroundTime(process)
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

				<tr>
					<th colSpan={6} style={{ textAlign: "right" }}>
						Media
					</th>

					<td>
						{isNaN(turnaroundTimeAverage) ?
							"-"
							:
							turnaroundTimeAverage.toFixed(2)
						}
					</td>

					<td>
						{isNaN(normalizedTimeAverage) ?
							"-"
							:
							normalizedTimeAverage.toFixed(2)
						}
					</td>
				</tr>
			</tbody>
		</table>
	)
}

export default SummaryTable;
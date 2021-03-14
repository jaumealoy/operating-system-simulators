import React from "react";
import { useTranslation } from "react-i18next";
import { ProcessWrap } from "./CPUSimulator";

interface ProcessQueueProps {
	title: string;
	subtitle?: string | JSX.Element;
	list: ProcessWrap[];
	columnTitle?: string;
	columnValue?: (process: ProcessWrap) => string;
};

function ProcessQueue(props: ProcessQueueProps) {
	const { t } = useTranslation();

	return (
		<>
			<h3>{props.title}</h3>
			{props.subtitle && <h4>{props.subtitle}</h4>}

			<table className="table">
				<thead>
					<tr>
						<th>{t("cpu.summary.process")}</th>
						{props.columnTitle && <th>{props.columnTitle}</th>}
					</tr>
				</thead>

				<tbody>
					{props.list.map(process => 
						<tr key={process.process.id}>
							<td>{process.process.id}</td>
							<td>
								{props.columnValue && props.columnValue(process)}
							</td>
						</tr>
					)}
					
					{props.list.length == 0 &&
						<tr>
							<td colSpan={props.columnTitle ? 2 : 1}>
								{t("cpu.queue_empty")}
							</td>
						</tr>
					}
				</tbody>
			</table>
		</>
	);
}

export default ProcessQueue;
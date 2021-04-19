import React from "react";
import { Process } from "../MemorySimulator";
import { FiDelete } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface ProcessListProps {
	processes: Process[];
	onRemoveProcess: (index: number) => void;
	deletable?: boolean;
};

function ProcessList(props: ProcessListProps) {
	const { t } = useTranslation();

	let deletionEnabled: boolean = props.deletable || false;

	return (
		props.processes.length == 0 ?
			<>
				{t("memory.allocation.no_requests_added")}	
			</>
		:
			<>
				<table className="table horizontal-table">
					<thead>
						<tr>
							<th>{t("cpu.name")}</th>
							<th>{t("cpu.arrival")}</th>
							<th>{t("memory.allocation.memory")}</th>
						</tr>
					</thead>

					<tbody>
						{props.processes.map((process, index) =>
							<tr key={process.id}>
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
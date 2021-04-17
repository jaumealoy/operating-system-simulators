import React from "react";
import SimulatorControl from "../../../components/SimulatorControl";
import { Row, Col, FormCheck, FormGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { PaginationSimulator, Request, Process } from "./PaginationSimulator";
import ProcessForm from "./components/ProcessForm";
import usePaginationSimulator from "./usePaginationSimulator";
import RequestsForm from "./components/RequestsForm";
import MemoryChart from "../components/MemoryChart";

interface PaginationExample {
	frames: number;
	processes: Process[];
	requests: Request[];
}

const EXAMPLES: PaginationExample[] = [
	{
		frames: 3,
		processes: [
			{ id: "A", frames: 1 },
			{ id: "B", frames: 1 },
			{ id: "C", frames: 1 },
		],
		requests: [
			{ process: "A", page: 1, modified: false }, { process: "A", page: 1, modified: false },
			{ process: "B", page: 0, modified: false },
			{ process: "C", page: 3, modified: false },
			{ process: "A", page: 0, modified: false },
		]
	},

	{
		frames: 0,
		processes: [
			{ id: "A", frames: 3 }
		],
		requests: [
			{ process: "A", page: 1, modified: false },
			{ process: "A", page: 2, modified: false },
			{ process: "A", page: 1, modified: false },
			{ process: "A", page: 0, modified: false },
			{ process: "A", page: 4, modified: false },
			{ process: "A", page: 1, modified: false },
			{ process: "A", page: 3, modified: false },
			{ process: "A", page: 4, modified: false },
			{ process: "A", page: 2, modified: false },
			{ process: "A", page: 1, modified: false },
			{ process: "A", page: 4, modified: false },
			{ process: "A", page: 1, modified: false },
		]
	},

	{
		frames: 0,
		processes: [
			{ id: "A", frames: 3 }
		],
		requests: [
			{ process: "A", page: 1, modified: false },
			{ process: "A", page: 2, modified: false },
			{ process: "A", page: 1, modified: true },
			{ process: "A", page: 0, modified: false },
			{ process: "A", page: 4, modified: true },
			{ process: "A", page: 1, modified: false },
			{ process: "A", page: 3, modified: true },
			{ process: "A", page: 4, modified: true },
			{ process: "A", page: 2, modified: false },
			{ process: "A", page: 1, modified: true },
			{ process: "A", page: 4, modified: false },
			{ process: "A", page: 1, modified: true },
		]
	}
];

interface PaginationPageProps {
	simpleView: boolean;
}

function PaginationPage(props: PaginationPageProps) {
	const { t } = useTranslation();

	const {
		selectedAlgorithm, selectedAlgorithms, selectAlgorithm,
		processes, addProcess, removeProcess,
		requests, addRequest, removeRequest,
		loadProcessesFromList, loadRequestsFromList,
		processTable, memory, pageFailures, currentCycle, pages,
		hasNextStep, nextStep, hasPreviousStep, previousStep, clear, reset,
		isRunning, isStarted
	} = usePaginationSimulator(props.simpleView);

	return (
		<>
			{/* Simulator settings */}
			<Row>
				<Col md={6}>
					<div className="simulator-group">
						<div className="simulator-group-content">
							<div className="title">{t("common.simulator_settings")}</div>
							
							<Row>
								<Col md={7}>
									<label>Algoritmo</label>
									{PaginationSimulator.getAvailableAlgorithms().map(algorithm =>
										<FormCheck 
											type={props.simpleView ? "radio" : "checkbox"}
											label={algorithm.name}
											disabled={isStarted}
											checked={props.simpleView ? algorithm.id == selectedAlgorithm : selectedAlgorithms.indexOf(algorithm.id) >= 0}
											onChange={() => selectAlgorithm(algorithm.id)}/>
									)}
								</Col>

								<Col md={5}>
									<FormGroup>
										<label>Páginas por procesos</label>
										<input 
											className="form-control" 
											type="number" 
											min={1}
											value={processes.map(p => p.frames).reduceRight((a, b) => a + b, 0)}
											disabled />
									</FormGroup>
								</Col>
							</Row>
						</div>
					</div>
				</Col>

				<Col md={6} className="mt-3 mt-md-0">
					<div className="simulator-group">
						<div className="simulator-group-content">
							<div className="title">Procesos y peticiones</div>
							<ProcessForm 
								processes={processes}
								onAddProcess={addProcess}
								onRemoveProcess={removeProcess}
								enabled={!isStarted} />

							<RequestsForm 
								processes={processes}
								requests={requests}
								onAddRequest={addRequest}
								onRemoveRequest={removeRequest}
								enabled={!isStarted} />
						</div>

						<div 
							data-tut="demo_requests"
							className="simulator-group-footer">
							<div className="title">{t("common.examples")}</div>

							{EXAMPLES.map((example: PaginationExample, index: number) =>
								<button 
									key={"example_" + index}
									disabled={isStarted}
									onClick={() => {
										loadProcessesFromList(example.processes);
										loadRequestsFromList(example.requests);
									}}
									className="btn btn-link">
									{t("common.example_number", { number: (index + 1) })}
								</button>
							)}
						</div>
					</div>
				</Col>
			</Row>

			{/* Simulator results */}
			{props.simpleView &&
			<Row>
				<h2>Resultados</h2>
				<Col md={4}>
					<MemoryChart
						processes={processes.map(p => p.id)}
						capacity={processes.map(p => p.frames).reduceRight((a, b) => a + b, 0)}
						data={memory}
						groupBlocks={false}
						customBlockText={(slot) => {
							if (memory[slot] != undefined) {
								return processes[memory[slot] - 1].id + " - " + pages[slot];
							}

							return "";
						}} />
				</Col>

				<Col md={8}>
					<Row className="mb-2">
						<Col md={12}>
							<table className="table">
								<tbody>
									<tr>
										<th>Fallos de página</th>
										<td>{pageFailures}</td>
									</tr>

									<tr>
										<th>Peticiones</th>
										<td>
											{requests.map((request, index) =>  
												<span className={"badge mr-1 " + (index < currentCycle ? "bg-success" : "bg-secondary")}>
													{request.process} - {request.page}
													{request.modified && <sup>*</sup>}
												</span>
											)}
										</td>
									</tr>
								</tbody>
							</table>
						
						</Col>
					</Row>
					<Row className="scrollable-x">
						{Object.entries(processTable).map(([key, value]) => 
							<Col key={`table_${key}`} md={4}>
								<h3>Proceso {key}</h3>

								{processes.map(process => {
									if (process.id == key) {
										let childs: React.ReactNode[] = [];

										for (let i = 0; i < process.frames; i++) {
											childs.push(
												<div className={"frame" + (i == value.pointer ? " selected" : "")}>
													<div className="frame-content">
														{i < value.loadedPages.length ?
															<>
																{value.loadedPages[i]}
																{value.pages[value.loadedPages[i]].data.accessBit &&
																	<sup>A</sup>}
																{value.pages[value.loadedPages[i]].data.modifiedBit &&
																	<sub>M</sub>}
															</>
															:
															"-"
														}
													</div>

													<div className="frame-index">
														{i}
													</div>
												</div>
											);
										}

										return (
											<div className="process-frames">
												{childs}
											</div>
										);
									}
								})}

								<table className="table">
									<thead>
										<tr>
											<th>Página</th>
											<th>Marco</th>
											{selectedAlgorithm == "fifo" && <th>Llegada</th>}
											{selectedAlgorithm == "lru" && <th>Último acceso</th>}
											{["clock", "nru"].indexOf(selectedAlgorithm) >= 0 && <th>A</th>}
											{selectedAlgorithm == "nru" && <th>M</th>}
										</tr>
									</thead>

									<tbody>
										{value.pages.map((entry, index) => 
											<tr key={`entry_${key}_${index	}`}>
												<td>
													{selectedAlgorithm == "clock" && 
														index == value.loadedPages[value.pointer] &&
														"-> "
													}
													{index}
												</td>
												<td>
													{entry.data.frame < 0 ?
														"-"
														:
														entry.data.frame
													}
												</td>
												{selectedAlgorithm == "fifo" &&
													<td>
														{entry.data.frame < 0 ?
															"-"
															:
															entry.arrival
														}
													</td>
												}
												{selectedAlgorithm == "lru" &&
													<td>
														{entry.data.frame < 0 ?
															"-"
															:
															entry.lastUse
														}
													</td>
												}
												{["clock", "nru"].indexOf(selectedAlgorithm) >= 0 &&
													<td>
														{entry.data.accessBit ? "1" : "0"}
													</td>
												}
												{selectedAlgorithm == "nru" &&
													<td>
														{entry.data.modifiedBit ? "1" : "0"}
													</td>
												}
											</tr>
										)}
									</tbody>
								</table>
							</Col>
						)}
					</Row>
				</Col>
			</Row>
			}

			<SimulatorControl 
				hasNext={hasNextStep()}
				next={nextStep}
				hasPrevious={hasPreviousStep()}
				previous={previousStep}
				reset={clear}
				stop={reset}
			/>
		</>
	);
}

export default PaginationPage;
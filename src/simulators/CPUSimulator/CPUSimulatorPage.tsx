import React from "react";
import {
	Row, Col,
	FormCheck, FormGroup, FormControl
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import TopBar from "../../components/TopBar";
import TimeChart from "./TimeChart";
import useCPUSimulator from "./useCPUSimulator";
import { CPUSimulator, Process, ProcessWrap } from "./CPUSimulator";
import SimulatorControl from "./../../components/SimulatorControl";
import CycleDistribution from "./CycleDistribution";

import "./../../common/css/CPUSimulator.scss";
import ProcessQueue from "./ProcessQueue";

/* ICONS */
import { 
	FiDelete,
	FiInfo,
	FiCpu
} from "react-icons/fi";

import { MdTimeline } from "react-icons/md";
import { BsTable } from "react-icons/bs";

/* EXAMPLES */
interface CPUExample {
	processList: Process[];
	quantum: number;
};

const EXAMPLES: CPUExample[] = [
	{
		processList: [
			{
				id: "A",
				arrival: 0,
				cycles: [false, false, false, false],
				estimatedDuration: 0
			},

			{
				id: "B",
				arrival: 2,
				cycles: [false, false, false, false],
				estimatedDuration: 0
			}

		],
		quantum: 1
	},

	{
		processList: [
			{
				id: "A",
				arrival: 0,
				cycles: [false, false, false],
				estimatedDuration: 0
			},
			{
				id: "B",
				arrival: 2,
				cycles: [false, false, false, false, false, false],
				estimatedDuration: 0
			},
			{
				id: "C",
				arrival: 4,
				cycles: [false, false, false, false],
				estimatedDuration: 0
			},
			{
				id: "D",
				arrival: 6,
				cycles: [false, false, false, false, false],
				estimatedDuration: 0
			},
			{
				id: "E",
				arrival: 8,
				cycles: [false, false],
				estimatedDuration: 0
			},
		],
		quantum: 1
	}
];

function CPUSimulatorPage() {
	const { t } = useTranslation();
	const {
		processes, 
		currentProcess, queues, events, getProcessSummary,
		name, arrival, estimatedDuration, duration, cycleDistribution,
		setName, setArrival, setEstimatedDuration, setDuration, selectCycleType,
		loadProcessesFromList, removeProcess,
		onSubmit,
		hasNextStep, hasPreviousStep,
		next, stop, reset, previous,
		selectedAlgorithm, selectAlgorithm,
		quantum, setQuantum,
		feedbackSettings, setFeedbackSettings,
		simulationLength
	} = useCPUSimulator();

	return (
		<>
			<TopBar />

			{/* Simulator configuration and process list */}
			<Row className="mb-3">
				<Col md={6}>
					<div className="simulator-group">
						<div className="simulator-group-content">
							<div className="title">{t("common.simulator_settings")}</div>

							<Row>
								<Col md={7}>
									<FormGroup>
										{CPUSimulator.getAvailableAlgorithms().map(algorithm =>
											<FormCheck
												type="radio"
												name="selectedAlgorithm"
												onChange={() => selectAlgorithm(algorithm.id)}
												checked={selectedAlgorithm == algorithm.id}
												label={algorithm.name}
											/>
										)}
									</FormGroup>
								</Col>

								<Col md={5}>
									{selectedAlgorithm == "rr" && 
										<FormGroup>
											<label>Quantum</label>
											<FormControl
												type="number"
												value={quantum}
												onChange={(e) => setQuantum(parseInt(e.target.value))}
												min={0}
												step={1}
											/>
										</FormGroup>
									}

									{selectedAlgorithm == "feedback" &&
										<>
											<FormGroup>
												<label>Quantum</label>
												<FormCheck 
													name="quantum_feedback"
													type="radio"
													checked={!feedbackSettings.mode}
													onChange={() => setFeedbackSettings({ ...feedbackSettings, mode: false})}
													label={
														<div style={{ display: "flex" }}>
															<span className="mr-2">Fijo:</span> 
															<FormControl 
																className="inline-input" 
																size="sm" 
																type="number"
																min={1}
																value={feedbackSettings.quantum}
																onChange={(e) => setFeedbackSettings({ ...feedbackSettings, quantum: parseInt(e.target.value)})} /> 
														</div>
													} />

												<FormCheck 
													name="quantum_feedback"
													checked={feedbackSettings.mode}
													onChange={() => setFeedbackSettings({ ...feedbackSettings, mode: true})}
													label={<i>2<sup>i</sup></i>}
													type="radio" />
													
											</FormGroup>

											<FormGroup>
												<label>Máximo de colas</label>
												<FormControl 
													min={0}
													value={feedbackSettings.maxQueues}
													onChange={(e) => setFeedbackSettings({ ...feedbackSettings, maxQueues: parseInt(e.target.value)})}
													type="number" />
												<small>El valor 0 indica ilimitado</small>
											</FormGroup>
										</>
									}
								</Col>
							</Row>
						</div>
					</div>
				</Col>

				<Col md={6}>
					<div className="simulator-group">
						<div className="simulator-group-content">
							<div className="title">Procesos</div>

							<form onSubmit={onSubmit}>
								<Row>
									<Col md={6}>
										<Row>
											<Col md={6}>
												<FormGroup>
													<label>Nombre</label>
													<FormControl
														required
														onChange={(e) => setName(e.target.value)}
														value={name} />
												</FormGroup>
											</Col>

											<Col md={6}>
												<FormGroup>
													<label>Llegada</label>
													<FormControl
														required
														type="number"
														onChange={(e) => setArrival(e.target.value)}
														value={arrival} />
												</FormGroup>
											</Col>
										</Row>

										<Row>
											<Col md={6}>
												<FormGroup>
													<label>Estimación</label>

													<FormControl
														required
														type="number"
														onChange={(e) => setEstimatedDuration(e.target.value)}
														value={estimatedDuration} />
												</FormGroup>
											</Col>

											<Col md={6}>
												<FormGroup>
													<label>Ciclos</label>
													<FormControl
														required
														type="number"
														onChange={(e) => setDuration(e.target.value)}
														value={duration} />
												</FormGroup>
											</Col>
										</Row>
									</Col>

									<Col md={6}>
										<FormGroup className="cpu-cycle-distribution">
											<label>Distribución de los ciclos</label>

											<CycleDistribution 
												cycles={cycleDistribution}
												editable
												onSelectCycle={(index, value) => selectCycleType(index, value)} />
										</FormGroup>

										<button className="btn mt-1 btn-primary">
											Añadir proceso
										</button>
									</Col>
								</Row>
							</form>
						</div>

						<div className="simulator-group-footer">
							<div className="title">{t("common.examples")}</div>
							
							{EXAMPLES.map((example: CPUExample, index: number) =>
								<button 
									key={"example_" + index}
									onClick={() => {
										loadProcessesFromList(example.processList);
									}}
									className="btn btn-link">
									{t("common.example_number", { number: (index + 1) })}
								</button>
							)}
						</div>
					</div>
				</Col>
			</Row>

			<Row className="mb-3">
				<Col md={12}>
					<div className="simulator-group">
						<div className="simulator-group-content">
							<div className="title">Procesos introducidos</div>
							<div className="process-list scrollable-x">
								{processes.length == 0 ?
									"No has introducido ninguna petición"
									:
									processes.map((process, index) => 
										<div className="mr-2"> 
											<table className="table">
												<tbody>
													<tr>
														<th>Nombre</th>
														<td>
															{process.id}

															<button 
																className="btn float-right btn-sm btn-link py-0"
																onClick={() => removeProcess(index)}>
																<FiDelete />
															</button>
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
																currentCycle={Number.MAX_VALUE}
																/>
															</FormGroup>
														</td>
													</tr>
												</tbody>
											</table>
										</div>	
									)
								}
							</div>
						</div>
					</div>
				</Col>
			</Row>

			{/* Simulation results */}
			<Row>
				<h2>Resultados</h2>
				<Row>
					<Col md={8}>
						<h3>
							<MdTimeline className="mr-1" />
							Línia temporal
						</h3>

						<TimeChart
							processes={processes.map(a => a.id)}
							maxTicks={Math.max(simulationLength, 20)}
							events={events}
						/>
					</Col>

					<Col md={4}>
						<h3>
							<FiCpu className="mr-1" />
							Procesador
						</h3>

						{currentProcess == null ?
							"Actualmente no hay ningún proceso en ejecución."
							:
							<>
								<table 
									style={{ tableLayout:"fixed" }} 
									className="table">
									<tbody>
										<tr>
											<th>Nombre</th>
											<td>{currentProcess.process.id}</td>
										</tr>

										<tr>
											<th>Próximo cambio</th>
											<td>0 ciclos</td>
										</tr>

										<tr>
											<th>Distribución</th>
											<td>
												<FormGroup className="cpu-cycle-distribution">
												<CycleDistribution 
													cycles={currentProcess.process.cycles}
													currentCycle={currentProcess.currentCycle + 1}
													editable={false} />
												</FormGroup>
											</td>
										</tr>
									</tbody>
								</table>
							</>
						}
					</Col>
				</Row>

				<Row className="mt-2 mb-2 scrollable-x">
					<Col md={3}>
						<ProcessQueue 
							title="Llegada de procesos"
							columnTitle="Ciclos restantes"
							columnValue={(p: ProcessWrap) => (p.process.arrival - 0).toString()}
							list={queues.incoming || []} />
					</Col>

					{/* only show the blocked queue IF there can be blocked processes */}
					{processes.flatMap((process) => process.cycles).reduce((a, b) => a || b, false) &&
						<Col md={3}>
							<ProcessQueue 
								title="Bloqueados"
								columnTitle="Ciclos restantes"
								columnValue={(p: ProcessWrap) => {
									let next: number = p.currentCycle;
									while (next < p.process.cycles.length && !p.process.cycles[next]) {
										next++;
									}
									return next.toString();
								}}
								list={queues.blocked || []} />
						</Col>
					}

					{Object.entries(queues).map(([key, list]) => {
						// ignore incoming and blocked queues
						if (key == "incoming" || key == "blocked") return;

						let subtitle: JSX.Element | undefined = undefined;
						if (selectedAlgorithm == "feedback") {
							let matches = key.match(/ready\_(?<id>[0-9]+)/);
							if (matches && matches.groups && "id" in matches.groups) {
								let priority: number = parseInt(matches.groups.id);

								if (feedbackSettings.mode) {
									subtitle = <i>q=2<sup>{priority}</sup></i>;
								} else {
									subtitle = <>{"Prioridad " + priority}</>;
								}
							}
						}

						return (
							<Col md={3}>
								<ProcessQueue 
									title="Listos"
									subtitle={subtitle}
									columnTitle="Ciclos esperando"
									columnValue={(p: ProcessWrap) => "0"}
									list={list} />
							</Col>
						);
					})}
				</Row>

				<Row className="mb-2">
					<Col md={12}>
						<h3>
							<BsTable className="mr-1" />
							Resumen planificación
						</h3>

						<table className="table">
							<thead>
								<tr>
									<th>Proceso</th>
									<th>Tiempo de servicio</th>
									<th>Tiempo de retorno</th>
									<th>Tiempo de respuesta</th>
									<th>Tiempo de respuesta normalizado</th>
								</tr>
							</thead>

							<tbody>
								{processes.length == 0 ?
									<tr>
										<td colSpan={5}>No se han introducido procesos</td>
									</tr>
									:
									processes.map(process => 
										<tr>
											<td>{process.id}</td>
											<td>{process.cycles.length}</td>
											<td>{getProcessSummary(process.id).turnaround}</td>
											<td>{getProcessSummary(process.id).response}</td>
											<td>{getProcessSummary(process.id).normalizedResponse}</td>
										</tr>
									)
								}
							</tbody>

						</table>
					</Col>
				</Row>
			</Row>

			<SimulatorControl
				hasNext={hasNextStep()}
				next={next}
				hasPrevious={hasPreviousStep()}
				previous={previous}
				stop={stop}
				reset={reset}
				/>
		</>
	);
}

export default CPUSimulatorPage;
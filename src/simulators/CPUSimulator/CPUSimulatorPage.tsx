import React from "react";
import {
	Row, Col,
	FormCheck, FormGroup, FormControl
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import TopBar from "../../components/TopBar";
import TimeChart from "./TimeChart";
import useCPUSimulator from "./useCPUSimulator";
import { CPUSimulator, Process, ProcessSnapshot, ProcessWrap } from "./CPUSimulator";
import SimulatorControl from "./../../components/SimulatorControl";
import CycleDistribution from "./CycleDistribution";

import "./../../common/css/CPUSimulator.scss";
import ProcessQueue from "./ProcessQueue";
import AlgorithmSettings from "./components/AlgorithmSettings";
import SummaryTable from "./components/SummaryTable";

/* ICONS */
import { 
	FiDelete,
	FiInfo,
	FiCpu
} from "react-icons/fi";

import { MdTimeline } from "react-icons/md";
import { BsTable } from "react-icons/bs";
import { IoMdAddCircleOutline } from "react-icons/io";

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
	},

	{
		processList: [
			{
				id: "A",
				arrival: 0,
				cycles: [false, false, true, false],
				estimatedDuration: 0
			},

			{
				id: "B",
				arrival: 2,
				cycles: [false, false, false, false],
				estimatedDuration: 0
			},

			{
				id: "C",
				arrival: 0,
				cycles: [false, true, true, false, false],
				estimatedDuration: 0
			}

		],
		quantum: 1
	},
];

function CPUSimulatorPage() {
	const { t } = useTranslation();
	const {
		processes, 
		//currentProcess,
		//queues,
		//  events, 
		getProcessSummary,
		name, arrival, estimatedDuration, duration, cycleDistribution,
		setName, setArrival, setEstimatedDuration, setDuration, selectCycleType,
		loadProcessesFromList, removeProcess,
		onSubmit,
		hasNextStep, hasPreviousStep,
		next, stop, reset, previous,
		selectedAlgorithm, selectedAlgorithms, selectAlgorithm,
		quantum, setQuantum,
		feedbackSettings, setFeedbackSettings,
		simulationLength,
		isSimpleView, setSimpleView,
		isAlgorithmSelected,
		algorithmVariants, addAlgorithmVariant, removeAlgorithmVariant, startVariantCreation,
		currentVariant,
		changeAlgorithmSettings,
		results
	} = useCPUSimulator();


	// simple view results variables
	let currentProcess: ProcessWrap | null = null;
	let queues: {[key: string]: ProcessWrap[]} = {};
	let events: ProcessSnapshot[][] = [];
	if (isSimpleView && (selectedAlgorithm in results) && (results[selectedAlgorithm].length > 0)) {
		console.log(results)
		currentProcess = results[selectedAlgorithm][0].currentProcess;
		queues = results[selectedAlgorithm][0].queues;
		events = results[selectedAlgorithm][0].events;
	}

	return (
		<>
			<TopBar 
				simpleView={isSimpleView} 
				onChangeView={setSimpleView} />

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
												key={`algorithm_${algorithm.id}`}
												type={isSimpleView ? "radio" : "checkbox"}
												name="selectedAlgorithm"
												onChange={() => selectAlgorithm(algorithm.id)}
												checked={isAlgorithmSelected(algorithm.id)}
												label={["rr", "feedback"].indexOf(algorithm.id) >= 0 ? 
													<div>
														<div>{algorithm.name}</div>
														{!isSimpleView && isAlgorithmSelected(algorithm.id) && 
															<div>
																{algorithmVariants[algorithm.id].map((variant, i) => 
																	<div className="badge bg-success mr-1">
																		{algorithm.id == "rr" ?
																			`q=${variant.quantum}`
																			:
																			<>
																				{variant.quantumMode ?
																					<span>q=2<sup>i</sup></span>
																					:
																					`q=${variant.quantum}`
																				}, 
																				{variant.maxQueues == 0 ?
																					"ilimitadas" 
																					:
																					`${variant.maxQueues} colas`
																				}
																			</>
																		}
																		<FiDelete
																			onClick={() => removeAlgorithmVariant(algorithm.id, i)}
																			className="pointer ml-sm-1" />
																	</div>
																)}
																
																<div 
																	className="badge bg-secondary pointer"
																	onClick={() => startVariantCreation(algorithm.id)}>
																	<IoMdAddCircleOutline 
																		className="mr-1" />
																	Añadir
																</div>
															</div>
														}
													</div>
													:
													algorithm.name
												}
											/>
										)}
									</FormGroup>
								</Col>

								<Col md={5}>
									<AlgorithmSettings 
										algorithm={isSimpleView ? selectedAlgorithm : currentVariant}
										quantum={selectedAlgorithm == "rr" ? quantum : feedbackSettings.quantum}
										quantumMode={feedbackSettings.quantumMode}
										maxQueues={feedbackSettings.maxQueues}
										onChangeConfiguration={changeAlgorithmSettings}
										onFinishConfiguration={!isSimpleView && currentVariant.length > 0 ? addAlgorithmVariant : undefined}
										/>
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
										<div className="mr-2" key={`process_${process.id}`}> 
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
																key={`process_${process.id}_dist`}
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
			{isSimpleView && (selectedAlgorithm in results) && (results[selectedAlgorithm].length > 0) &&
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
									while (next < p.process.cycles.length && p.process.cycles[next]) {
										next++;
									}
									next = next - p.currentCycle;
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

								if (feedbackSettings.quantumMode) {
									subtitle = <i>q=2<sup>{priority}</sup></i>;
								} else {
									subtitle = <>{"Prioridad " + priority}</>;
								}
							}
						}

						return (
							<Col md={3} key={`queue_${key}`}>
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

						<SummaryTable 
							processes={processes}
							processData={results[selectedAlgorithm][0].summary} 
							extendedHeader />
					</Col>
				</Row>
			</Row>
			}

			{!isSimpleView &&
			<Row className="mb-3">
				<h2>Resultados</h2>
				<Row className="scrollable-x">
					{selectedAlgorithms.map(id => 
						(id in results) && results[id].map((result, i) => 
							<Col md={4} key={`results_${id}_${i}`}>
								<h3>{t(`cpu.algorithms.${id}`)}</h3>

								{id == "rr" && 
									<span className="badge bg-success">
										q={algorithmVariants[id][i].quantum}
									</span>
								}

								{id == "feedback" &&
									<span className="badge bg-success">
										q={algorithmVariants[id][i].quantumMode ?
											<i>2<sup>i</sup></i>
											:
											algorithmVariants[id][i].quantum
										}, 
										{algorithmVariants[id][i].maxQueues == 0 ?
											"ilimitadas"
											:
											`${algorithmVariants[id][i].maxQueues} colas`
										}
									</span>
								}

								<TimeChart 
									processes={processes.map(a => a.id)}
									events={result.events}
									maxTicks={Math.max(simulationLength, 15)} />

								<SummaryTable
									processes={processes}
									processData={result.summary} />
							</Col>	
						)
					)}
				</Row>
			</Row>
			}

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
import React from "react";
import {
	Row, Col,
	FormCheck, FormGroup, FormControl
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FiCpu } from "react-icons/fi";
import { MdTimeline } from "react-icons/md";
import { BsTable } from "react-icons/bs";

import TopBar from "../../components/TopBar";
import TimeChart from "./TimeChart";
import useCPUSimulator from "./useCPUSimulator";
import { CPUSimulator, Process } from "./CPUSimulator";
import SimulatorControl from "./../../components/SimulatorControl";
import CycleDistribution from "./CycleDistribution";

import "./../../common/css/CPUSimulator.scss";

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
		loadProcessesFromList,
		onSubmit,
		hasNextStep,
		next,
		selectedAlgorithm, selectAlgorithm,
		quantum, setQuantum,
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
								<Col md={8}>
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

								<Col md={4}>
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

			<Row>
				<Col md={12}>
					<div className="simulator-group">
						<div className="simulator-group-content">
							<div className="title">Procesos introducidos</div>
							<div className="process-list">
								{processes.length == 0 ?
									"No has introducido ninguna petición"
									:
									processes.map(process => 
										<div> 
											<table>
												<tbody>
													<tr>
														<th>Nombre</th>
														<td>{process.id}</td>
													</tr>

													<tr>
														<th>Llegada</th>
														<td>{process.arrival}</td>
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

				<Row className="mt-2 mb-2">
					<Col md={4}>
					A
					</Col>

					<Col md={4}>
						<h3>Ready</h3>
						<table className="table">
							<thead>
								<tr>
									<th>Proceso</th>
									<th></th>
								</tr>
							</thead>

							<tbody>
								{queues.ready.map(process => 
									<tr>
										<td>{process.process.id}</td>
										<td>-</td>
									</tr>
								)}	
							</tbody>
						</table>
					</Col>

					<Col md={4}>
						<h3>Incoming</h3>
						<table className="table">
							<thead>
								<tr>
									<th>Proceso</th>
									<th></th>
								</tr>
							</thead>

							<tbody>
								{queues.incoming.map(process => 
									<tr>
										<td>{process.process.id}</td>
										<td>-</td>
									</tr>
								)}	
							</tbody>
						</table>
					</Col>
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
				/>
		</>
	);
}

export default CPUSimulatorPage;
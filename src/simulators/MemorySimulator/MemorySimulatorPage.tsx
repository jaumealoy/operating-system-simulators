import React, { useState } from "react";
import TopBar from "../../components/TopBar";
import MemoryChart from "./components/MemoryChart";
import {
	Row, Col, FormControl, FormGroup, FormCheck,
	OverlayTrigger, Tooltip
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FiInfo, FiAlertTriangle } from "react-icons/fi";
import useMemorySimulator from "./useMemorySimulator";
import SimulatorControl from "../../components/SimulatorControl";

import { Algorithm } from "./../Simulator";
import { MemorySimulator, Process } from "./MemorySimulator";
import AlgorithmSettings from "../CPUSimulator/components/AlgorithmSettings";
import AddProcessForm from "./components/AddProcessForm";
import ProcessList from "./components/ProcessList";

const EXAMPLES: Process[][] = [
	[
		{ id: "A", size: 3, arrival: 0, duration: 0 },
		{ id: "B", size: 4, arrival: 0, duration: 4 },
		{ id: "C", size: 6, arrival: 2, duration: 3 },
		{ id: "D", size: 3, arrival: 4, duration: 0 },
		{ id: "E", size: 1, arrival: 5, duration: 1 },
	]
];

function MemorySimulatorPage() {
	const { t } = useTranslation();

	const {
		selectedAlgorithm, setSelectedAlgorithm,
		memoryCapacity, setMemoryCapacity,
		processes, addProcess, removeProcess, loadProcessesFromList,
		memoryData, nextPointer, memoryGroups, processQueues, allocationHistory, currentCycle,
		hasNextStep, nextStep
	} = useMemorySimulator();

	return (
		<>
			<TopBar />

			{/* Simulator settings and process form */}
			<Row className="mb-3">
				<Col md={5}>
					<div className="simulator-group">
						<div className="simulator-group-content">
							<div className="title">{t("common.simulator_settings")}</div>

							<Row>
								<Col md={8}>
									<FormGroup>
										<label>Algoritmo</label>
										{MemorySimulator.getAvailableAlgorithms().map((algorithm: Algorithm) => 
											<FormCheck
												key={algorithm.id}
												name="selectedAlgorithm"
												type="radio"
												checked={selectedAlgorithm == algorithm.id}
												onChange={() => setSelectedAlgorithm(algorithm.id)}
												label={
													<>
														{algorithm.name}
														<button
															onClick={() => {}}
															className="btn btn-icon btn-sm">
															<FiInfo />
														</button>
													</>
												}
												/>
										)}
									</FormGroup>
								</Col>

								<Col md={4}>
									<FormGroup>
										<label>Capacidad</label>
										<FormControl 
											type="number"
											min={1}
											value={memoryCapacity}
											onChange={(e) => setMemoryCapacity(parseInt(e.target.value))} />
									</FormGroup>
								</Col>
							</Row>
						</div>
					</div>
				</Col>

				<Col md={7}>
					<div className="simulator-group mt-3 mt-sm-0">
						<div className="simulator-group-content">
							<div className="title">{t("io.requests")}</div>

							<Row>
								<Col md={5}>
									<AddProcessForm
									 	onAddProcess={addProcess}/>
								</Col>

								<Col md={7}>
									<ProcessList 
										processes={processes}
										onRemoveProcess={removeProcess} />
								</Col>
							</Row>
						</div>

						<div 
							data-tut="demo_requests"
							className="simulator-group-footer">
							<div className="title">{t("common.examples")}</div>

							{EXAMPLES.map((example: Process[], index: number) =>
								<button 
									key={"example_" + index}
									//disabled={!(!isStarted || isFinished)}
									onClick={() => {
										loadProcessesFromList(example)
									}}
									className="btn btn-link">
									{t("common.example_number", { number: (index + 1) })}
								</button>
							)}
						</div>
					</div>
				</Col>
			</Row>

			{/* Simulation results */}
			<Row>
				<h2>Resultados</h2>
				
				<Col md={4}>
					<div className="x-centered">
						<MemoryChart
							capacity={memoryCapacity}
							processes={processes.map(process => process.id)}
							data={memoryData}
							pointer={selectedAlgorithm == "next_fit" ? nextPointer : undefined}
							blocks={selectedAlgorithm == "buddy" ? memoryGroups : undefined}
							showBlockSize />
					</div>
				</Col>

				<Col md={8}>
					Ciclo actual: <span className="badge bg-success">{currentCycle}</span>
					<br />
					<br />
					Próximas peticiones:
					<table className="table">
						<thead>
							<tr>
								<th>Proceso</th>
								<th>Duración</th>
								<th>Llegada</th>
								<th>Memoria solicitada</th>
								<th>Ciclos restantes</th>
							</tr>
						</thead>

						<tbody>
							{("incoming" in processQueues && processQueues.incoming.length > 0) ?
								processQueues.incoming.map((process) => 
									<tr key={process.process.id}>
										<td>{process.process.id}</td>
										<td>
											{process.process.duration == 0 ?
												"permanente"
												:
												process.process.duration
											}
										</td>
										<td>{process.process.arrival}</td>
										<td>{process.process.size}</td>
										<td>
											{(process.process.arrival - currentCycle) >= 0 ?
												(process.process.arrival - currentCycle)
												:
												<>
													0
													<OverlayTrigger
    													placement="right"
														overlay={
															<Tooltip id={`memory_error_${process.process.id}`}>
																No hay memoria suficiente
															</Tooltip>
														}
														>
														<FiAlertTriangle className="ml-2" />
													</OverlayTrigger>
												</>
											}
											
										</td>
									</tr>
								)
								:
								<tr>
									<td colSpan={5}>No hay más peticiones de memoria</td>
								</tr>
							}
						</tbody>
					</table>

					Peticiones de memoria atendidas:
					<table className="table">
						<thead>
							<tr>
								<th>Ciclo</th>
								<th>Proceso</th>
								<th>Memoria solicitada</th>
								<th>Bloque asignado</th>
							</tr>
						</thead>

						<tbody>
							{allocationHistory.length == 0 ?
								<tr>
									<td colSpan={4}>No se ha atendido ninguna petición de memoria.</td>
								</tr>
								:
								allocationHistory.map((allocation) => 
									<tr key={allocation.process.id}>
										<td>{allocation.start}</td>
										<td>{allocation.process.id}</td>
										<td>{allocation.process.size}</td>
										<td>{allocation.blockBegin} - {allocation.blockEnd}</td>
									</tr>
								)
							}
							
						</tbody>
					</table>
				</Col>
				
			</Row>

			

			<SimulatorControl 
				hasNext={hasNextStep()}
				next={nextStep}
			/>
		</>
	);
}

export default MemorySimulatorPage;
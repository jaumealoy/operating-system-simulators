import React from "react";
import {
	Row, Col,
	FormCheck, FormGroup, FormControl
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FiCpu } from "react-icons/fi";
import { MdTimeline } from "react-icons/md";

import TopBar from "../../components/TopBar";
import TimeChart from "./TimeChart";
import useCPUSimulator from "./useCPUSimulator";
import { CPUSimulator, Process } from "./CPUSimulator";
import SimulatorControl from "./../../components/SimulatorControl";

/* EXAMPLES */
interface CPUExample {
	processList: Process[];
	quantum: number;
};

const EXAMPLES: CPUExample[] = [
	{
		processList: [
			{
				arrival: 0,
				cycles: [],
				estimatedDuration: 0
			}
		],
		quantum: 1
	}
];

function CPUSimulatorPage() {
	const { t } = useTranslation();
	const {
		processes,
		name, arrival, estimatedDuration, duration, cycleDistribution,
		setName, setArrival, setEstimatedDuration, setDuration, selectCycleType,
		onSubmit
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

											<div className="my-input-group mt-1">
												<div className="my-input-group-col">
													<div className="my-input-group-cell fake-cell header">
														&nbsp;
													</div>

													<div className="my-input-group-cell header">
														CPU
													</div>

													<div className="my-input-group-cell header">
														IO
													</div>
												</div>

												{cycleDistribution.map((value, index) =>
													<div className="my-input-group-col">
														<div className="my-input-group-cell">
															{index + 1}
														</div>

														<div className="my-input-group-cell">
															<FormCheck
																onChange={() => selectCycleType(index, false)}
																checked={!value}
																name={`cycle[${index}]`}
																type="radio" />
														</div>

														<div className="my-input-group-cell">
															<FormCheck
																onChange={() => selectCycleType(index, true)}
																checked={value}
																name={`cycle[${index}]`}
																type="radio" />
														</div>
													</div>
												)}
											</div>
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

						</div>
					</div>
				</Col>
			</Row>

			<Row>
				<Col md={12}>
					<div className="simulator-group">
						<div className="simulator-group-content">
							<div className="title">Procesos introducidos</div>
							{processes.length == 0 ?
								"No has introducido ninguna petición"
								:
								processes.map(process => 
									<div> 
										A
									</div>	
								)
							}
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
							processes={["A", "B", "E", "C", "D"]}
							maxTicks={20}
							events={[
								[{ id: "B", status: "running" }],
								[{ id: "B", status: "running" }],
								[{ id: "B", status: "running" }, { id: "E", status: "blocked" }],
								[{ id: "A", status: "running" }, { id: "E", status: "blocked" }],
								[{ id: "A", status: "running" }, { id: "E", status: "blocked" }],
								[{ id: "C", status: "running" }],
								[{ id: "D", status: "running" }],
								[{ id: "C", status: "running" }],
								[{ id: "c", status: "running" }]
							]}
						/>
					</Col>

					<Col md={4}>
						<h3>
							<FiCpu className="mr-1" />
							Procesador
						</h3>
					</Col>
				</Row>

				<Row className="mt-2 mb-2">
					<Col md={4}>
					A
					</Col>

					<Col md={4}>
					B
					</Col>

					<Col md={4}>
					C
					</Col>
				</Row>
			</Row>

			<SimulatorControl
			/>
		</>
	);
}

export default CPUSimulatorPage;
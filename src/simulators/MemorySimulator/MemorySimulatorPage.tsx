import React, { useState } from "react";
import TopBar from "../../components/TopBar";
import MemoryChart from "./components/MemoryChart";
import {
	Row, Col, FormControl, FormGroup, FormCheck
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FiInfo } from "react-icons/fi";
import useMemorySimulator from "./useMemorySimulator";
import SimulatorControl from "../../components/SimulatorControl";

import { Algorithm } from "./../Simulator";
import { MemorySimulator, Process } from "./MemorySimulator";
import AlgorithmSettings from "../CPUSimulator/components/AlgorithmSettings";

const EXAMPLES: Process[][] = [
	[
		{ id: "A", size: 3, arrival: 0, duration: 0 },
	]
];

function MemorySimulatorPage() {
	const { t } = useTranslation();

	const {
		memoryCapacity, setMemoryCapacity
	} = useMemorySimulator();

	return (
		<>
			<TopBar />

			{/* Simulator settings and process form */}
			<Row className="mb-3">
				<Col md={4}>
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

				<Col md={4}>
				<div className="simulator-group mt-3 mt-sm-0">
						<div className="simulator-group-content">
							<div className="title">{t("io.requests")}</div>

							<Row>
								
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
										
									}}
									className="btn btn-link">
									{t("common.example_number", { number: (index + 1) })}
								</button>
							)}
						</div>
					</div>
				</Col>
			</Row>


			<MemoryChart
				capacity={memoryCapacity}
				processes={["A", "B", "C", "D", "E", "F", "G", "H"]}
				data={[0, 0, 0, -1, 1, 1, 2, 2, 0, -1, 3, 4, 5, 6, 7, 8]} />

			<SimulatorControl />
		</>
	);
}

export default MemorySimulatorPage;
import React, { useState, useEffect } from "react";
import RequestChart from "./RequestChart";
import SimulatorControl from "./../../components/SimulatorControl";

import { 
	Row, 
	Col,
	FormGroup,
	FormControl,
	FormCheck
} from "react-bootstrap";

import { FiDelete } from "react-icons/fi";

import useIOSimulator from "./useIOSimulator";
import { IOSimulator, ProcessedRequest } from "./IOSimulator";
import useInterval from "../../helpers/useInterval";

function IOSimulatorPage() {
	const {
		requests,
		initialPosition, setInitialPosition,
		requestTrack, setRequestTrack,
		maxTracks, setMaxTracks,
		direction, setDirection,
		removeRequest,
		onSubmitForm,
		selectedAlgorithm, setSelectedAlgorithm,
		processedRequests,
		isRunning, 
		step, reset, stop,
		hasNext, hasPrevious
	} = useIOSimulator();

	const [chartRequests, setChartRequests] = useState<number[]>([]);
	useEffect(() => {
		let tmp: number[] = [initialPosition];
		for(let i = 0; i < processedRequests.length; i++){
			tmp.push(processedRequests[i].finalTrack);
		}

		setChartRequests(tmp);
	}, [initialPosition, processedRequests]);

	// calculate sum of displacement
	let sum = 0;
	processedRequests.map(request => {
		sum += Math.abs(request.finalTrack - request.initialTrack);
	});

	return (
		<>
			<Row>
				<Col md={6}>

				</Col>

				<Col md={6}>
					<div className="simulator-group">
						<div className="title">Configuración del simulador</div>

						<Row>
							<Col md={7} className="mb-sm-3">
								<FormGroup>
									<label>Algoritmo simulación</label>
									
									{IOSimulator.getAvailableAlgorithms().map(algorithm =>
										<FormCheck 
											name="selectedAlgorithm"
											type="radio"
											disabled={isRunning}
											onChange={() => setSelectedAlgorithm(algorithm.id)}
											checked={algorithm.id === selectedAlgorithm}
											value={algorithm.id}
											label={algorithm.name} />
									)}
								</FormGroup>
							</Col>
						
							<Col md={5}>
								<FormGroup>
									<label>Posición inicial</label>
									<FormControl 
										value={initialPosition}
										min={0}
										disabled={isRunning}
										onChange={(e) => setInitialPosition(parseInt(e.target.value))}
										type="number" />
								</FormGroup>

								<FormGroup>
									<label>Número de pistas</label>
									<FormControl 
										value={maxTracks}
										disabled={isRunning}
										min={1} 
										onChange={(e) => setMaxTracks(parseInt(e.target.value))}
										type="number" />
								</FormGroup>

								{["look", "clook", "scan", "cscan"].indexOf(selectedAlgorithm) >= 0 &&
									<FormGroup>
										<label>Sentido</label>
										<FormCheck 
											type="radio"
											label="Ascendente"
											onChange={() => setDirection(true)}
											checked={direction}
											disabled={isRunning}
											name="direction" />

										<FormCheck 
											type="radio"
											label="Descendente"
											onChange={() => setDirection(false)}
											checked={!direction}
											disabled={isRunning}
											name="direction" />
									</FormGroup>
								}
							</Col>
						</Row>
					</div>

					<div className="simulator-group mt-sm-3">
						<div className="title">Peticiones</div>
						<Row>
							<Col md={6}>
								<form onSubmit={onSubmitForm}>
									<FormGroup>
										<label>Pista</label>

										<FormControl
											required
											min={0}
											disabled={isRunning}
											value={requestTrack}
											onChange={(e) => setRequestTrack(parseInt(e.target.value))}
											type="number" />
									</FormGroup>

									<button className="btn btn-primary mt-sm-2 float-right">
										Añadir petición
									</button>
								</form>
							</Col>
							
							<Col md={6}>
								{requests.length == 0 ?
									<p>No se ha introducido ninguna petición.</p>
									:
									requests.map((value: number, index: number) => 
										<span className="badge rounded-pill pill-md bg-secondary px-2 mr-1">
											{value}

											{!isRunning &&	
												<FiDelete
													onClick={() => removeRequest(index)}
													className="pointer ml-sm-1" />
											}
										</span>
									)
								}
							</Col>
						</Row>
					</div>
					
				</Col>
			</Row>

			<Row>
				<RequestChart 
					tracks={3}
					maxTrack={Math.max(...requests, initialPosition, maxTracks)}
					requests={chartRequests} />
			</Row>

			<Row>
				<Col md={6}>
					<h2>Resultados</h2>

					<table className="table">
						<thead>
							<tr>
								<th># petición</th>
								<th>Posición inicial</th>
								<th>Posición final</th>
								<th>Desplazamiento</th>
							</tr>
						</thead>

						<tbody>
							{processedRequests.map((request, index) => 
								<tr>
									<td>{index + 1}</td>
									<td>{request.initialTrack}</td>
									<td>{request.finalTrack}</td>
									<td>{Math.abs(request.finalTrack - request.initialTrack)}</td>
								</tr>
							)}

							{processedRequests.length == 0 ?
								<tr>
									<td colSpan={4}>No se ha completado ningua petición</td>
								</tr>
								:
								<tr>
									<td></td>
									<td></td>
									<td>Total</td>
									<td>
										{sum}
									</td>
								</tr>
							}
							
						</tbody>
					</table>
				</Col>
			</Row>

			<SimulatorControl 
				reset={reset}
				stop={stop}
				hasNext={hasNext}
				hasPrevious={hasPrevious}
				next={step} />
		</>
	)
}

export default IOSimulatorPage;
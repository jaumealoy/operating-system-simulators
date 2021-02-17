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
import { IOSimulator, ProcessedRequest, Request } from "./IOSimulator";

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
		isRunning, isStarted,
		step, reset, stop, previous, play, pause, timerCallback,
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
		if (!request.fast) {
			sum += Math.abs(request.finalTrack - request.initialTrack);
		}
	});

	
	let aux = (request: Request) => request.track;

	return (
		<>
			<Row>
				<Col md={6}>
					<RequestChart 
						tracks={3}
						maxTrack={Math.max(...(requests.map(aux)), initialPosition, maxTracks)}
						requests={chartRequests} />
				</Col>

				<Col md={6}>
					<div className="simulator-group">
						<div className="title">Configuración del simulador</div>

						<Row>
							<Col md={7} className="mb-3">
								<FormGroup>
									<label>Algoritmo simulación</label>
									
									{IOSimulator.getAvailableAlgorithms().map(algorithm =>
										<FormCheck 
											name="selectedAlgorithm"
											type="radio"
											disabled={isStarted}
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
										min={IOSimulator.MIN}
										max={maxTracks + IOSimulator.MIN - 1}
										disabled={isStarted}
										onChange={(e) => setInitialPosition(parseInt(e.target.value))}
										type="number" />
								</FormGroup>

								<FormGroup>
									<label>Número de pistas</label>
									<FormControl 
										value={maxTracks}
										disabled={isStarted}
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
											disabled={isStarted}
											name="direction" />

										<FormCheck 
											type="radio"
											label="Descendente"
											onChange={() => setDirection(false)}
											checked={!direction}
											disabled={isStarted}
											name="direction" />
									</FormGroup>
								}
							</Col>
						</Row>
					</div>

					<div className="simulator-group mt-3">
						<div className="title">Peticiones</div>
						<Row>
							<Col md={6}>
								<form onSubmit={onSubmitForm}>
									<FormGroup>
										<label>Pista</label>

										<FormControl
											required
											min={0}
											disabled={isStarted}
											value={requestTrack}
											onChange={(e) => setRequestTrack(parseInt(e.target.value))}
											type="number" />
									</FormGroup>

									<button className="btn btn-primary mt-2 float-right">
										Añadir petición
									</button>
								</form>
							</Col>
							
							<Col md={6}>
								{requests.length == 0 ?
									<p>No se ha introducido ninguna petición.</p>
									:
									requests.map((value: Request, index: number) => 
										<span className="badge rounded-pill pill-md bg-secondary px-2 mr-1">
											{value.track}

											{!isStarted &&	
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
									<td>
										{Math.abs(request.finalTrack - request.initialTrack)}
										{request.fast && <sup>*</sup>}
									</td>
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
				running={isRunning}
				hasNext={hasNext}
				hasPrevious={hasPrevious}
				reset={reset}
				stop={stop}
				previous={previous}
				start={play}
				pause={pause}
				timerCallback={timerCallback}
				next={step} />
		</>
	)
}

export default IOSimulatorPage;
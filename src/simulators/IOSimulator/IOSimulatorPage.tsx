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
					<Row>
						<Col md={12} className="mb-sm-3">
							<FormGroup>
								<label>Algoritmo simulación</label>
								
								{IOSimulator.getAvailableAlgorithms().map(algorithm =>
									<FormCheck 
										name="selectedAlgorithm"
										type="radio"
										onChange={() => setSelectedAlgorithm(algorithm.id)}
										checked={algorithm.id === selectedAlgorithm}
										value={algorithm.id}
										label={algorithm.name} />
								)}
							</FormGroup>
						</Col>

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
							<FormGroup>
								<label>Posición inicial cabezal</label>
								<FormControl 
									value={initialPosition}
									min={0}
									disabled={isRunning}
									onChange={(e) => setInitialPosition(parseInt(e.target.value))}
									type="number" />
							</FormGroup>
						</Col>

						<Col md={12}>
							{requests.map((value: number, index: number) => 
								<span className="badge rounded-pill pill-md bg-secondary px-2 mr-1">
									{value}

									{!isRunning &&	
										<FiDelete
											onClick={() => removeRequest(index)}
											className="pointer ml-sm-1" />
									}
								</span>
							)}
						</Col>
					</Row>
					
				</Col>
			</Row>

			<Row>
				<RequestChart 
					tracks={3}
					maxTrack={Math.max(...requests, initialPosition)}
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
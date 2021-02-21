import React, { useState, useEffect } from "react";

import RequestChart from "./RequestChart";
import SimulatorControl from "./../../components/SimulatorControl";
import { IOSimulator, ProcessedRequest, Request } from "./IOSimulator";
import useIOSimulator from "./useIOSimulator";
import useAlgorithmHelp from "../../components/AlgorithmModalHelp/useAlgorithmHelp";
import useTutorial from "../../helpers/useTutorial";

import Tour from 'reactour'
import { useTranslation } from "react-i18next";

import "./../../common/css/App.scss";

/* ICONS */
import { 
	Row, 
	Col,
	FormGroup,
	FormControl,
	FormCheck,
	Modal
} from "react-bootstrap";

import { 
	FiDelete,
	FiInfo
} from "react-icons/fi";

import {
	BsFillGridFill,
	BsFillSquareFill
} from "react-icons/bs";

import { IoIosHelpBuoy } from "react-icons/io";


/* EXAMPLES */
interface IOExample {
	initialTrack: number;
	tracks: number;
	requests: number[];

	// a true value will represent an upward direction, downwards otherwise
	direction: boolean;	
}

const EXAMPLES: IOExample[] = [
	{
		initialTrack: 100,
		tracks: 200,
		requests: [55, 58, 39, 18, 90, 160, 150, 38, 184],
		direction: true
	},

	{
		initialTrack: 53,
		tracks: 200,
		requests: [98, 183, 37, 122, 14, 124, 65, 67],
		direction: true
	}
];

function IOSimulatorPage() {
	// translation texts
	const { t } = useTranslation();

	const {
		requests, loadRequestsFromList,
		initialPosition, setInitialPosition,
		requestTrack, setRequestTrack,
		maxTracks, setMaxTracks,
		direction, setDirection,
		removeRequest,
		onSubmitForm,
		selectedAlgorithm, setSelectedAlgorithm, selectAlgorithm, selectedAlgorithms,
		processedRequests,
		isRunning, isStarted,
		step, reset, stop, previous, play, pause, timerCallback,
		hasNext, hasPrevious,
		isSimpleView, setSimpleView
	} = useIOSimulator();

	// modal help texts
	const {
		showAlgorithmModal,
		AlgorithmModal
	} = useAlgorithmHelp("io");

	// tutorial
	const Tutorial = useTutorial("io");

	const chartRequests = (algorithm: string) : number[] => {
		let requests: number[] = [initialPosition];

		if(processedRequests[algorithm] != undefined){
		for (let i = 0; i < processedRequests[algorithm].length; i++) {
			requests.push(processedRequests[algorithm][i].finalTrack);
		}
	}

		return requests;
	};

	// calculate sum of displacement
	const calculateSumDisplacement = (algorithm: string) : number => {
		let sum = 0;
		processedRequests[algorithm].map(request => {
			sum += Math.abs(request.finalTrack - request.initialTrack);
		});
		return sum;
	};

	
	let aux = (request: Request) => request.track;

	return (
		<>
			{/* Tutorial and view select bar */}
			<Row className="mb-3">
				<Col>
					<button
						onClick={Tutorial.show}
						className="btn btn-sm btn-outline-secondary">
						<IoIosHelpBuoy className="mr-1" />
						{t("common.buttons.tutorial")}
					</button>

					<div className="btn-group float-right">
						<input 
							type="radio"
							name="view-select"
							id="comparaison-view-button"
							checked={!isSimpleView}
							onChange={() => setSimpleView(false)}
							className="btn-check" />

						<label 
							htmlFor="comparaison-view-button"
							className="btn btn-sm btn-outline-secondary">
							<BsFillGridFill className="mr-1" />
							{t("common.buttons.comparaisonview")}
						</label>

						<input 
							type="radio"
							name="view-select"
							id="simple-view-button"
							checked={isSimpleView}
							onChange={() => setSimpleView(true)}
							className="btn-check" />

						<label
							htmlFor="simple-view-button"
							className="btn btn-sm btn-outline-secondary">
							<BsFillSquareFill className="mr-1" />
							{t("common.buttons.simpleview")}
						</label>
					</div>
				</Col>
			</Row>

			{/* Simulator settings and requests */}
			<Row>
				<Col md={6}>
					<div className="simulator-group">
						<div className="simulator-group-content">
							<div className="title">{t("common.simulator_settings")}</div>

							<Row>
								<Col md={8} className="mb-3">
									<FormGroup>
										<label>{t("common.simulation_algorithm")}</label>
										
										{IOSimulator.getAvailableAlgorithms().map(algorithm =>
											<FormCheck 
												name="selectedAlgorithm"
												type={isSimpleView ? "radio" : "checkbox"}
												disabled={isStarted}
												onChange={() => selectAlgorithm(algorithm.id)}
												checked={(isSimpleView && (selectedAlgorithm == algorithm.id)) 
													|| (!isSimpleView && (selectedAlgorithms.indexOf(algorithm.id) >= 0))}
												value={algorithm.id}
												label={
													<>
														{algorithm.name}
														<button 
															onClick={() => showAlgorithmModal(algorithm.id)}
															className="btn btn-icon btn-sm">
															<FiInfo />
														</button>
													</>
												} />
										)}
									</FormGroup>
								</Col>
							
								<Col md={4}>
									<FormGroup>
										<label>{t("io.initial_position")}</label>
										<FormControl 
											value={initialPosition}
											min={IOSimulator.MIN}
											max={maxTracks + IOSimulator.MIN - 1}
											disabled={isStarted}
											onChange={(e) => setInitialPosition(parseInt(e.target.value))}
											type="number" />
									</FormGroup>

									<FormGroup>
										<label>{t("io.track_number")}</label>
										<FormControl 
											value={maxTracks}
											disabled={isStarted}
											min={1} 
											onChange={(e) => setMaxTracks(parseInt(e.target.value))}
											type="number" />
									</FormGroup>

									{selectedAlgorithms.filter((id) => ["look", "clook", "scan", "cscan"].includes(id)).length > 0 &&
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
					</div>
				</Col>

				<Col md={6}>
					<div className="simulator-group">
						<div className="simulator-group-content">
							<div className="title">{t("io.requests")}</div>

							<Row>
								<Col md={6}>
									<form onSubmit={onSubmitForm}>
										<FormGroup>
											<label>{t("io.track")}</label>

											<FormControl
												required
												min={0}
												disabled={isStarted}
												value={requestTrack}
												onChange={(e) => setRequestTrack(parseInt(e.target.value))}
												type="number" />
										</FormGroup>

										<button 
											disabled={isStarted}
											id="add_request_btn"
											className="btn btn-primary mt-2 float-right">
											{t("io.add_request")}
										</button>
									</form>
								</Col>
								
								<Col md={6}>
									{requests.length == 0 ?
										<p>{t("io.no_requests_added")}</p>
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

						<div className="simulator-group-footer">
							<div className="title">{t("common.examples")}</div>

							{EXAMPLES.map((example: IOExample, index: number) =>
								<button 
									key={"example_" + index}
									disabled={isStarted}
									onClick={() => {
										setInitialPosition(example.initialTrack);
										setDirection(example.direction);
										setMaxTracks(example.tracks);
										loadRequestsFromList(example.requests)
									}}
									className="btn btn-link">
									{t("common.example_number", { number: (index + 1) })}
								</button>
							)}
						</div>
					</div>
				</Col>
			</Row>

			{/* Results */}
			{isSimpleView &&
			<Row className="mt-2">
				<h2>{t("io.results")}</h2>

				<Col md={6}>
					<RequestChart 
						tracks={3}
						id="simple_chart"
						maxTrack={Math.max(...(requests.map(aux)), initialPosition, maxTracks)}
						requests={chartRequests(selectedAlgorithm)} />
				</Col>

				<Col md={6}>
					<table className="table">
						<thead>
							<tr>
								<th>{t("io.request_number")}</th>
								<th>{t("io.initial_position")}</th>
								<th>{t("io.final_position")}</th>
								<th>{t("io.displacement")}</th>
							</tr>
						</thead>

						<tbody>
							{processedRequests[selectedAlgorithm].map((request, index) => 
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

							{processedRequests[selectedAlgorithm].length == 0 ?
								<tr>
									<td colSpan={4}>{t("io.no_requests_completed")}</td>
								</tr>
								:
								<tr>
									<td></td>
									<td></td>
									<td>{t("io.total")}</td>
									<td>
										{calculateSumDisplacement(selectedAlgorithm)}
									</td>
								</tr>
							}
							
						</tbody>
					</table>
				</Col>
			</Row>
			}

			{!isSimpleView &&
			<Row className="mt-2">
				<h2>{t("io.results")}</h2>
				
				<div className="row scrollable-x">
					{selectedAlgorithms.map((algorithm: string, index: number) => 
						<Col md={4}>
							<h4>{t("io.algorithms." + algorithm)}</h4>

							<Row>
								<Col md={12}>
									{/* Request chart */}
									<RequestChart 
										tracks={3}
										id={"chart_" + algorithm}
										maxTrack={Math.max(...(requests.map(aux)), initialPosition, maxTracks)}
										requests={chartRequests(algorithm)} />
								</Col>

								<Col md={0}>
									{/* HDD chart */}
								</Col>
							</Row>

							<Row>
								<Col md={6}>
									<table className="table">
										<thead>
											<tr>
												<th>{t("io.request_number")}</th>
												<th>{t("io.initial_position")}</th>
												<th>{t("io.final_position")}</th>
												<th>{t("io.displacement")}</th>
											</tr>
										</thead>

										<tbody>
											{processedRequests[algorithm].map((request, index) => 
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

											{processedRequests[algorithm].length == 0 ?
												<tr>
													<td colSpan={4}>{t("io.no_requests_completed")}</td>
												</tr>
												:
												<tr>
													<td></td>
													<td></td>
													<td>{t("io.total")}</td>
													<td>
														{calculateSumDisplacement(algorithm)}
													</td>
												</tr>
											}
											
										</tbody>
									</table>
								</Col>
							</Row>
						</Col>
					)}
				</div>
			</Row>
			}

			<Row>
				<Col md={6}>

					
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

			<AlgorithmModal />


		<Tour
        	steps={[
				{
					selector: "#add_request_btn",
					content: "Testing"
				},

				{
					selector: "#add_request_btn",
					content: "Testing"
				}
			]}
			
			onRequestClose={Tutorial.close}
        	isOpen={Tutorial.visible}
        	 />
		</>
	)
}

export default IOSimulatorPage;
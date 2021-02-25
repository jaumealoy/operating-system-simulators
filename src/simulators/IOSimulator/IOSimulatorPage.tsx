import React, { useState, useEffect } from "react";

import RequestChart from "./RequestChart";
import Disk from "./Disk";
import SimulatorControl from "./../../components/SimulatorControl";
import { IOSimulator, ProcessedRequest, Request } from "./IOSimulator";
import useIOSimulator from "./useIOSimulator";
import useAlgorithmHelp from "../../components/AlgorithmModalHelp/useAlgorithmHelp";
import useTutorial, { StepAction } from "../../helpers/useTutorial";

import Tour, { ReactourStep } from 'reactour'
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
	},

	{
		initialTrack: 10,
		tracks: 20,
		requests: [7, 15, 19, 13, 3, 14, 17, 4, 18, 2],
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
		isSimpleView, setSimpleView,
		saveSimulation, loadSimulation,
		speed, setSpeed,
		isFieldInvalid
	} = useIOSimulator();

	// modal help texts
	const {
		showAlgorithmModal,
		AlgorithmModal
	} = useAlgorithmHelp("io");

	// tutorial
	const STEPS: ReactourStep[] = [
		{
			selector: '[data-tut="view_bar"]',
			content: t("common.tutorial.view_bar")
		},

		{
			selector: '[data-tut="algorithm_select"]',
			content: t("io.tutorial.algorithm_select")
		},

		{
			selector: '[data-tut="simulator_settings"]',
			content: t("io.tutorial.simulator_settings")
		},

		{
			selector: '[data-tut="request_list"]',
			content: t("io.tutorial.request_list")
		},

		{
			selector: '[data-tut="request_list_add"]',
			content: t("io.tutorial.request_list_add", { min: IOSimulator.MIN, max: (IOSimulator.MIN + maxTracks - 1) })
		},

		{
			selector: '[data-tut="request_list_remove"]',
			content: t("io.tutorial.request_list_remove")
		},

		{
			selector: '[data-tut="demo_requests"]',
			content: t("io.tutorial.demo_requests")
		},

		{
			selector: '[data-tut="control_bar_overview"]',
			content: t("common.tutorial.control_bar_overview")
		},

		{
			selector: '[data-tut="control_bar_reset"]',
			content: t("common.tutorial.control_bar_reset")
		},

		{
			selector: '[data-tut="control_bar_stop"]',
			content: t("common.tutorial.control_bar_stop")
		},

		{
			selector: '[data-tut="control_bar_previous_step"]',
			content: t("common.tutorial.control_bar_previous_step")
		},

		{
			selector: '[data-tut="control_bar_next_step"]',
			content: t("common.tutorial.control_bar_next_step")
		},

		{
			selector: '[data-tut="control_bar_play"]',
			content: t("common.tutorial.control_bar_play")
		},

		{
			selector: '[data-tut="control_bar_speed"]',
			content: t("common.tutorial.control_bar_speed")
		},

		{
			selector: '[data-tut="storage"]',
			content: t("common.tutorial.storage")
		},

		{
			selector: '[data-tut="repeat_tutorial"]',
			content: t("common.tutorial.repeat_tutorial")
		}
	];

	const STEP_ACTIONS: {[key: number]: StepAction} = {
		5: {
			onReach: () => {
				loadRequestsFromList(EXAMPLES[0].requests);
			},

			onFinish: () => {
				loadRequestsFromList([]);
			}
		}
	};

	const Tutorial = useTutorial("io", STEP_ACTIONS);

	const chartRequests = (algorithm: string) : number[] => {
		let requests: number[] = [initialPosition];

		for (let i = 0; i < processedRequests[algorithm].length; i++) {
			requests.push(processedRequests[algorithm][i].finalTrack);
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

	// get last processed requests of selected algorithm
	const getLastProcessedRequest = () => {
		if (processedRequests[selectedAlgorithm].length > 0) {
			return processedRequests[selectedAlgorithm][processedRequests[selectedAlgorithm].length - 1];
		}

		return null;
	}

	let lastProcessedRequest = getLastProcessedRequest();

	return (
		<>
			{/* Tutorial and view select bar */}
			<Row className="mb-3">
				<Col>
					<button
						data-tut="repeat_tutorial"
						onClick={Tutorial.show}
						className="btn btn-sm btn-outline-secondary">
						<IoIosHelpBuoy className="mr-1" />
						{t("common.buttons.tutorial")}
					</button>

					<div
						data-tut="view_bar"
						className="btn-group float-right">
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
								<Col 
									data-tut="algorithm_select"
									md={8} 
									className="mb-3">
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
							
								<Col md={4}
									data-tut="simulator_settings">
									<FormGroup>
										<label>{t("io.initial_position")}</label>
										<FormControl 
											value={initialPosition}
											min={IOSimulator.MIN}
											max={maxTracks + IOSimulator.MIN - 1}
											disabled={isStarted}
											onChange={(e) => setInitialPosition(parseInt(e.target.value))}
											isInvalid={isFieldInvalid("initialPosition")}
											type="number" />
									</FormGroup>

									<FormGroup>
										<label>{t("io.track_number")}</label>
										<FormControl 
											value={maxTracks}
											disabled={isStarted}
											min={1} 
											onChange={(e) => setMaxTracks(parseInt(e.target.value))}
											isInvalid={isFieldInvalid("maxTracks")}
											type="number" />
									</FormGroup>

									{(["look", "clook", "scan", "cscan"].indexOf(selectedAlgorithm) >= 0
										|| selectedAlgorithms.filter((id) => ["look", "clook", "scan", "cscan"].includes(id)).length > 0) 
										&&
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
						<div 
							data-tut="request_list"
							className="simulator-group-content">
							<div className="title">{t("io.requests")}</div>

							<Row>
								<Col 
									data-tut="request_list_add"
									md={6}>
									<form onSubmit={onSubmitForm}>
										<FormGroup>
											<label>{t("io.track")}</label>

											<FormControl
												required
												min={IOSimulator.MIN}
												max={IOSimulator.MIN + maxTracks - 1}
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
								
								<Col 
									data-tut="request_list_remove"
									md={6}>
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

						<div 
							data-tut="demo_requests"
							className="simulator-group-footer">
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
					<Row>
						<Col md={8}>
							<RequestChart 
								tracks={3}
								id="simple_chart"
								maxTrack={Math.max(...(requests.map(aux)), initialPosition, maxTracks)}
								requests={chartRequests(selectedAlgorithm)} />
						</Col>
					
						<Col md={4}>
							<Disk 
								tracks={maxTracks}
								nextTrack={lastProcessedRequest ? lastProcessedRequest.finalTrack : undefined}
								currentTrack={lastProcessedRequest ? lastProcessedRequest.initialTrack : initialPosition}
								duration={speed}
								/>
						</Col>
					</Row>
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
			<Row className="mt-2 mb-2">
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
				next={step}
				onSaveFile={saveSimulation}
				onOpenFile={loadSimulation}
				onSpeedChange={setSpeed} />

			<AlgorithmModal />

			<Tour
				steps={STEPS}
				onAfterOpen={Tutorial.onOpen}
				goToStep={Tutorial.step}
				nextStep={Tutorial.nextStep}
				prevStep={Tutorial.prevStep}
				onRequestClose={Tutorial.close}
				isOpen={Tutorial.visible} />
		</>
	)
}

export default IOSimulatorPage;
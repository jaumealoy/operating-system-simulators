import React from "react";

import TopBar from "../../components/TopBar";
import TimeChart from "./components/TimeChart";
import useCPUSimulator from "./useCPUSimulator";
import { CPUSimulator, Process, ProcessSnapshot, ProcessWrap } from "./CPUSimulator";
import SimulatorControl from "./../../components/SimulatorControl";
import CycleDistribution from "./components/CycleDistribution";
import ProcessQueue from "./components/ProcessQueue";
import AlgorithmSettings from "./components/AlgorithmSettings";
import SummaryTable from "./components/SummaryTable";
import ProcessList from "./components/ProcessList";
import VariantTag from "./components/VariantTag";
import AddProcessForm from "./components/AddProcessForm";
import useAlgorithmHelp from "./../../components/AlgorithmModalHelp/useAlgorithmHelp";
import useTutorial, { StepAction } from "./../../helpers/useTutorial";
import "./../../common/css/CPUSimulator.scss";

import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import Tour, { ReactourStep } from "reactour";
import {
	Row, Col,
	FormCheck, FormGroup, FormControl
} from "react-bootstrap";

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
				cycles: [false, false, false]
			},
			{
				id: "B",
				arrival: 2,
				cycles: [false, false, false, false, false, false]
			},
			{
				id: "C",
				arrival: 4,
				cycles: [false, false, false, false]
			},
			{
				id: "D",
				arrival: 6,
				cycles: [false, false, false, false, false]
			},
			{
				id: "E",
				arrival: 8,
				cycles: [false, false],
			},
		],
		quantum: 1
	},

	{
		processList: [
			{
				id: "A",
				arrival: 0,
				cycles: [false, false, true, false]
			},

			{
				id: "B",
				arrival: 2,
				cycles: [false, false, false, false]
			},

			{
				id: "C",
				arrival: 0,
				cycles: [false, true, true, false, false]
			}

		],
		quantum: 1
	},
];

function CPUSimulatorPage() {
	const { t } = useTranslation();
	const {
		processes, 
		addProcess, removeProcess, loadProcessesFromList,
		hasNextStep, hasPreviousStep,
		next, stop, reset, previous, play, pause, timerCallback,
		speed, setSpeed,
		selectedAlgorithm, selectedAlgorithms, selectAlgorithm,
		quantum, feedbackSettings, changeAlgorithmSettings,
		simulationLength,
		isSimpleView, setSimpleView,
		isAlgorithmSelected,
		algorithmVariants, addAlgorithmVariant, removeAlgorithmVariant, startVariantCreation,
		currentVariant,
		results,
		isStarted, isRunning,
		saveFile, loadFile,
		runAction
	} = useCPUSimulator();
	const history = useHistory();

	const { AlgorithmModal, showAlgorithmModal } = useAlgorithmHelp("cpu");

	// simple view results variables
	let currentProcess: ProcessWrap | null = null;
	let queues: {[key: string]: ProcessWrap[]} = {};
	let events: ProcessSnapshot[][] = [];
	if (isSimpleView && (selectedAlgorithm in results) && (results[selectedAlgorithm].length > 0)) {
		currentProcess = results[selectedAlgorithm][0].currentProcess;
		queues = results[selectedAlgorithm][0].queues;
		events = results[selectedAlgorithm][0].events;
	}

	let showAlgorithmHelp = (algorithm: string) => {
		pause();
		showAlgorithmModal(algorithm);
	};

	// tutorial
	const ACTIONS: {[key: number]: StepAction} = {
		1: {
			onBeforeReach: () => loadProcessesFromList(EXAMPLES[1].processList)
		},

		2: {
			onBeforeReach: () => runAction("switchToComparaisonAndAddVariant")
		},

		3: {
			onBeforeReach: () => runAction("showSummaryTable"),
		},

		4: {
			onBeforeReach: () => {
				reset();
				loadProcessesFromList([...EXAMPLES[1].processList]);
				runAction("runSomeSteps");
			}
		}
	};

	const STEPS: ReactourStep[] = [
		{
			selector: '[data-tut="view_bar"]',
			content: t("common.tutorial.view_bar")
		},

		{
			selector: '[data-tut="process_list"]',
			content: t("cpu.tutorial.process_list")
		},

		{
			selector: '[data-tut="form-check"]',
			content: t("cpu.tutorial.process_list")
		},

		{
			selector: '[data-tut="summary_table"]',
			content: t("cpu.tutorial.summary_table")
		},

		{
			selector: '[data-tut="process_queues"]',
			content: t("cpu.tutorial.process_queues")
		},

		{
			selector: '[data-tut="time_chart"]',
			content: t("cpu.tutorial.time_chart")
		},

		{
			selector: '[data-tut="current_process"]',
			content: t("cpu.tutorial.current_process")
		},

		{
			selector: '[data-tut="repeat_tutorial"]',
			content: t("common.tutorial.repeat_tutorial")
		}
	];

	const { 
		visible, onOpen, close, step, nextStep,
		prevStep, show, onStepChange
	} = useTutorial("cpu", STEPS.length, true, ACTIONS);


	return (
		<>
			<TopBar 
				simpleView={isSimpleView} 
				onChangeView={setSimpleView}
				onClickTutorial={show} />

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
											<div data-tut={algorithm.id == "rr" && !isSimpleView ? "form-check" : undefined}>
											<FormCheck
												key={`algorithm_${algorithm.id}`}
												type={isSimpleView ? "radio" : "checkbox"}
												name="selectedAlgorithm"
												disabled={isStarted}
												onChange={() => selectAlgorithm(algorithm.id)}
												checked={isAlgorithmSelected(algorithm.id)}
												label={["rr", "feedback"].indexOf(algorithm.id) >= 0 ? 
													<div>
														<div>
															{t(`cpu.algorithms.${algorithm.id}`)}
															<a 
																onClick={() => showAlgorithmHelp(algorithm.id)}
																className="btn btn-icon btn-sm">
																<FiInfo />
															</a>
														</div>
														{!isSimpleView && isAlgorithmSelected(algorithm.id) && 
															<div>
																{algorithmVariants[algorithm.id].map((variant, i) => 
																	<VariantTag 
																		key={`variant_${i}`}
																		algorithm={algorithm.id}
																		deletable={!isStarted}
																		settings={variant}
																		onDelete={() => removeAlgorithmVariant(algorithm.id, i)} />
																
																)}
																
																{!isStarted && 
																	<div 
																		className="badge bg-secondary pointer"
																		onClick={() => startVariantCreation(algorithm.id)}>
																		<IoMdAddCircleOutline 
																			className="mr-1" />
																		{t("common.buttons.add")}
																	</div>
																}
															</div>
														}
													</div>
													:
													<>
														{t(`cpu.algorithms.${algorithm.id}`)}
														<a 
															onClick={() => showAlgorithmHelp(algorithm.id)}
															className="btn btn-icon btn-sm">
															<FiInfo />
														</a>
													</>
												}
											/>
											</div>
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

				<Col className="mt-sm-3 mt-md-0" md={6}>
					<div className="simulator-group">
						<div className="simulator-group-content">
							<div className="title">{t("cpu.processes")}</div>

							<AddProcessForm 
								processes={processes}
								disabled={isStarted}
								onAddProcess={addProcess} />
						</div>

						<div className="simulator-group-footer">
							<div className="title">{t("common.examples")}</div>
							
							{EXAMPLES.map((example: CPUExample, index: number) =>
								<button 
									key={"example_" + index}
									disabled={isStarted}
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
					<div 
						data-tut="process_list"
						className="simulator-group">
						<div className="simulator-group-content">
							<div className="title">{t("cpu.introduced_processes")}</div>
							<div className="process-list scrollable-x">
								<ProcessList 
									processes={processes}
									deletionEnabled={!isStarted}
									onDeleteProcess={removeProcess} />
							</div>
						</div>
					</div>
				</Col>
			</Row>

			{/* Simulation results */}
			{isSimpleView && (selectedAlgorithm in results) && (results[selectedAlgorithm].length > 0) &&
			<Row>
				<h2>{t("cpu.results")}</h2>
				<Row>
					<Col data-tut="time_chart" md={8}>
						<h3>
							<MdTimeline className="mr-1" />
							{t("cpu.timeline")}
						</h3>

						<TimeChart
							processes={processes.map(a => a.id)}
							maxTicks={Math.max(simulationLength, 20)}
							events={events}
						/>
					</Col>

					<Col data-tut="current_process" md={4}>
						<h3>
							<FiCpu className="mr-1" />
							{t("cpu.cpu")}
						</h3>

						{currentProcess == null ?
							t("cpu.no_process_running")
							:
							<>
								<table 
									style={{ tableLayout:"fixed" }} 
									className="table">
									<tbody>
										<tr>
											<th>{t("cpu.name")}</th>
											<td>{currentProcess.process.id}</td>
										</tr>

										<tr>
											<th>{t("cpu.cycle_distribution")}</th>
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

				<Row data-tut="process_queues" className="mt-2 mb-2 scrollable-x">
					<Col md={3}>
						<ProcessQueue 
							title={t("cpu.incoming_processes")}
							columnTitle={t("cpu.remaining_cycles")}
							columnValue={(p: ProcessWrap) => (p.process.arrival - p.waiting).toString()}
							list={queues.incoming || []} />
					</Col>

					{/* only show the blocked queue IF there can be blocked processes */}
					{processes.flatMap((process) => process.cycles).reduce((a, b) => a || b, false) &&
						<Col md={3}>
							<ProcessQueue 
								title={t("cpu.blocked")}
								columnTitle={t("cpu.remaining_cycles")}
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
									subtitle = <>{t("cpu.priority_number", { value: priority })}</>;
								}
							}
						}

						return (
							<Col md={3} key={`queue_${key}`}>
								<ProcessQueue 
									title={t("cpu.ready")}
									subtitle={subtitle}
									columnTitle={t("cpu.waiting_cycles")}
									columnValue={(p: ProcessWrap) => p.waiting.toString()}
									list={list} />
							</Col>
						);
					})}
				</Row>

				<Row data-tut="summary_table" className="mb-2">
					<Col md={12}>
						<h3>
							<BsTable className="mr-1" />
							{t("cpu.schedule_summary")}
							
							<button 
								className="btn btn-xs btn-icon"
								onClick={() => history.push("/help?scrollTo=cpu_summary")}>
								<FiInfo />
							</button>
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
				<h2>{t("cpu.results")}</h2>
				<Row className="scrollable-x">
					{selectedAlgorithms.map(id => 
						(id in results) && results[id].map((result, i) => 
							<Col md={5} key={`results_${id}_${i}`}>
								<h3>{t(`cpu.algorithms.${id}`)}</h3>

								{id in algorithmVariants && i < algorithmVariants[id].length &&
									<VariantTag 
										algorithm={id}
										settings={algorithmVariants[id][i]} />
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
				onSpeedChange={setSpeed}
				running={isRunning}
				start={play}
				pause={pause}
				timerCallback={timerCallback}
				onSaveFile={saveFile}
				onOpenFile={loadFile} />

			<AlgorithmModal />

			<Tour 
				steps={STEPS}
				onAfterOpen={onOpen}
				isOpen={visible}
				getCurrentStep={onStepChange}
				onRequestClose={close}
				goToStep={step}
				nextStep={nextStep}
				prevStep={prevStep} />
		</>
	);
}

export default CPUSimulatorPage;
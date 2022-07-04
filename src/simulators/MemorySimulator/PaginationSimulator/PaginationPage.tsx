import React, { forwardRef, Ref, useImperativeHandle, useMemo } from "react";
import SimulatorControl from "../../../components/SimulatorControl";
import { Row, Col, FormCheck, FormGroup, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { PaginationSimulator, Request, Process } from "./PaginationSimulator";
import ProcessForm from "./components/ProcessForm";
import usePaginationSimulator from "./usePaginationSimulator";
import RequestsForm from "./components/RequestsForm";
import MemoryChart from "../components/MemoryChart";
import ProcessFrameTable from "./components/ProcessFrameTable";
import { FiInfo } from "react-icons/fi";
import useAlgorithmHelp from "./../../../components/AlgorithmModalHelp/useAlgorithmHelp";

interface PaginationExample {
	frames: number;
	processes: Process[];
	requests: Request[];
	title?: string;
}

const EXAMPLES: PaginationExample[] = [
	{
		frames: 0,
		processes: [
			{ id: "A", frames: 3 }
		],
		requests: [
			{ process: "A", page: 2, modified: false },
			{ process: "A", page: 3, modified: false },
			{ process: "A", page: 2, modified: true },
			{ process: "A", page: 1, modified: false },
			{ process: "A", page: 5, modified: true },
			{ process: "A", page: 2, modified: false },
			{ process: "A", page: 4, modified: true },
			{ process: "A", page: 5, modified: true },
			{ process: "A", page: 3, modified: false },
			{ process: "A", page: 2, modified: true },
			{ process: "A", page: 5, modified: false },
			{ process: "A", page: 2, modified: true },
		]
	},

	{
		frames: 3,
		processes: [
			{ id: "A", frames: 3 }
		],
		requests: [
			{ process: "A", page: 0, modified: false },
			{ process: "A", page: 1, modified: false },
			{ process: "A", page: 2, modified: false },
			{ process: "A", page: 3, modified: false },
			{ process: "A", page: 0, modified: false },
			{ process: "A", page: 1, modified: false },
			{ process: "A", page: 4, modified: false },
			{ process: "A", page: 0, modified: false },
			{ process: "A", page: 1, modified: false },
			{ process: "A", page: 2, modified: false },
			{ process: "A", page: 3, modified: false },
			{ process: "A", page: 4, modified: false }
		]
	},

	{
		frames: 3,
		processes: [
			{ id: "A", frames: 3 },
			{ id: "B", frames: 4 },
			{ id: "C", frames: 2 },
		],
		requests: [
			{ process: "A", page: 1, modified: false },
			{ process: "A", page: 2, modified: false },
			{ process: "A", page: 3, modified: false },
			{ process: "A", page: 4, modified: false },
			{ process: "A", page: 1, modified: false },
			{ process: "A", page: 2, modified: false },
			{ process: "A", page: 5, modified: false },
			{ process: "A", page: 1, modified: false },
			{ process: "A", page: 2, modified: false },
			{ process: "A", page: 3, modified: false },
			{ process: "A", page: 4, modified: false },
			{ process: "A", page: 5, modified: false },

			{ process: "B", page: 1, modified: false },
			{ process: "B", page: 2, modified: false },
			{ process: "B", page: 3, modified: false },
			{ process: "B", page: 4, modified: false },
			{ process: "B", page: 1, modified: false },
			{ process: "B", page: 2, modified: false },
			{ process: "B", page: 5, modified: false },
			{ process: "B", page: 1, modified: false },
			{ process: "B", page: 2, modified: false },
			{ process: "B", page: 3, modified: false },
			{ process: "B", page: 4, modified: false },
			{ process: "B", page: 5, modified: false },

			{ process: "C", page: 1, modified: false },
			{ process: "C", page: 2, modified: false },
			{ process: "C", page: 3, modified: false },
			{ process: "C", page: 4, modified: false },
			{ process: "C", page: 1, modified: false },
			{ process: "C", page: 2, modified: false },
			{ process: "C", page: 5, modified: false },
			{ process: "C", page: 1, modified: false },
			{ process: "C", page: 2, modified: false },
			{ process: "C", page: 3, modified: false },
			{ process: "C", page: 4, modified: false },
			{ process: "C", page: 5, modified: false },
		]
	},

	{
		frames: 0,
		processes: [
			{ id: "A", frames: 3 },
			{ id: "B", frames: 3 },
			{ id: "C", frames: 2 }
		],
		requests: [
			//  C2, C0, A4, C0, A1, A0.
			{ process: "A", page: 1, modified: false },
			{ process: "A", page: 1, modified: false },
			{ process: "B", page: 0, modified: false },
			{ process: "C", page: 3, modified: false },
			{ process: "A", page: 0, modified: false },
			{ process: "A", page: 1, modified: false },
			{ process: "B", page: 0, modified: false },
			{ process: "B", page: 1, modified: false },
			{ process: "A", page: 3, modified: false },
			{ process: "B", page: 3, modified: false },
			{ process: "C", page: 0, modified: false },
			{ process: "C", page: 1, modified: false },
			{ process: "C", page: 1, modified: false },
			{ process: "A", page: 1, modified: false },
			{ process: "C", page: 0, modified: false },
			{ process: "A", page: 0, modified: false },
			{ process: "B", page: 0, modified: false },
			{ process: "A", page: 2, modified: false },
			{ process: "A", page: 2, modified: false },
			{ process: "A", page: 1, modified: false },
			{ process: "C", page: 0, modified: false },
			{ process: "C", page: 1, modified: false },
			{ process: "B", page: 1, modified: false },
			{ process: "C", page: 2, modified: false },
			{ process: "A", page: 3, modified: false },
			{ process: "C", page: 3, modified: false },
			{ process: "A", page: 4, modified: false },
			{ process: "C", page: 3, modified: false },
			{ process: "A", page: 2, modified: false },
			{ process: "B", page: 0, modified: false },
			{ process: "B", page: 0, modified: false },
			{ process: "C", page: 2, modified: false },
			{ process: "C", page: 3, modified: false },
			{ process: "A", page: 0, modified: false },
			{ process: "C", page: 2, modified: false },
			{ process: "C", page: 0, modified: false },
			{ process: "A", page: 4, modified: false },
			{ process: "C", page: 0, modified: false },
			{ process: "A", page: 1, modified: false },
			{ process: "A", page: 0, modified: false }
		]
	}
];

interface PaginationPageProps {
	simpleView: boolean;
}

interface PaginationPageFunctions {
	tutorialStep: (step: number) => void;
}

const PaginationPage = forwardRef((props: PaginationPageProps, ref: Ref<PaginationPageFunctions>) => {
	const { t } = useTranslation();

	const {
		selectedAlgorithm, selectedAlgorithms, selectAlgorithm,
		processes, addProcess, removeProcess,
		requests, addRequest, removeRequest,
		loadProcessesFromList, loadRequestsFromList,
		results,
		hasNextStep, nextStep, hasPreviousStep, previousStep, clear, reset, play, pause,
		isRunning, isStarted,
		loadFile, saveFile
	} = usePaginationSimulator(props.simpleView);

	const { AlgorithmModal, showAlgorithmModal } = useAlgorithmHelp("pagination");

	let showAlgorithmHelp = (algorithm: string) => {
		pause();
		showAlgorithmModal(algorithm);
	};

	useImperativeHandle(ref, () => ({
		tutorialStep: (step: number) => {
			if (step == 1) {
				loadProcessesFromList(EXAMPLES[2].processes);
				loadRequestsFromList(EXAMPLES[2].requests);
				selectAlgorithm("nru");

				for (let i = 0; i < 5; i++) {
					nextStep();
				}
			}
		}
	}));

	const incrementPageFailures = useMemo(
		() => 
			props.simpleView && selectedAlgorithm in results && results[selectedAlgorithm].processTable && requests[results[selectedAlgorithm].currentCycle] && results[selectedAlgorithm].processTable[requests[results[selectedAlgorithm].currentCycle].process] &&
				results[selectedAlgorithm].processTable[requests[results[selectedAlgorithm].currentCycle].process].loadedPages.indexOf(requests[results[selectedAlgorithm].currentCycle].page) <= 0,
		[selectedAlgorithm, results, processes]
	);

	return (
		<>
			{/* Simulator settings */}
			<Row>
				<Col md={6}>
					<div className="simulator-group" data-tut="pagination_settings">
						<div className="simulator-group-content">
							<div className="title">{t("common.simulator_settings")}</div>
							
							<Row>
								<Col md={7}>
									<label>{t("common.simulation_algorithm")}</label>
									{PaginationSimulator.getAvailableAlgorithms().map(algorithm =>
										<FormCheck 
											type={props.simpleView ? "radio" : "checkbox"}
											disabled={isStarted}
											checked={props.simpleView ? algorithm.id == selectedAlgorithm : selectedAlgorithms.indexOf(algorithm.id) >= 0}
											onChange={() => selectAlgorithm(algorithm.id)}
											label={
												<>
													{t(`memory.pagination.algorithms.${algorithm.id}`)}
													<button
														onClick={() => showAlgorithmHelp(algorithm.id)}
														className="btn btn-icon btn-sm">
														<FiInfo />
													</button>
												</>
											}/>
									)}
								</Col>

								<Col md={5}>
									<FormGroup>
										<label>{t("memory.pagination.frames")}</label>
										<input 
											className="form-control" 
											type="number" 
											min={1}
											value={processes.map(p => p.frames).reduceRight((a, b) => a + b, 0)}
											disabled />
									</FormGroup>
								</Col>
							</Row>
						</div>
					</div>
				</Col>

				<Col md={6} className="mt-3 mt-md-0">
					<div className="simulator-group">
						<div className="simulator-group-content">
							<div className="title">{t("memory.pagination.processes_pages")}</div>

							<div data-tut="pagination_processes">
								<ProcessForm 
									processes={processes}
									onAddProcess={addProcess}
									onRemoveProcess={removeProcess}
									enabled={!isStarted} />
							</div>

							<div data-tut="pagination_requests">
								<RequestsForm 
									processes={processes}
									requests={requests}
									onAddRequest={addRequest}
									onRemoveRequest={removeRequest}
									enabled={!isStarted} />
							</div>
						</div>

						<div 
							data-tut="demo_requests"
							className="simulator-group-footer">
							<div className="title">{t("common.examples")}</div>

							{EXAMPLES.map((example: PaginationExample, index: number) =>
								<button 
									key={"example_" + index}
									disabled={isStarted}
									onClick={() => {
										loadProcessesFromList(example.processes);
										loadRequestsFromList(example.requests);
									}}
									className="btn btn-link">
									{example.title == undefined ?
										t("common.example_number", { number: (index + 1) })
										:
										t("common.example_number", { number: (index + 1) }) + " " + example.title
									}
								</button>
							)}
						</div>
					</div>
				</Col>
			</Row>

			{/* Simulator results */}
			{props.simpleView && (selectedAlgorithm in results) && processes.length > 0 && 
			<Row data-tut="pagination_results_1">
				<h2>{t("common.simulator_results")}</h2>
				<Col md={4}>
					<h3>{t("memory.allocation.memory")}</h3>
					<MemoryChart
						processes={processes.map(p => p.id)}
						capacity={processes.map(p => p.frames).reduceRight((a, b) => a + b, 0)}
						data={results[selectedAlgorithm].memory}
						groupBlocks={false}
						customBlockText={(slot) => {
							if (results[selectedAlgorithm].memory[slot] != undefined) {
								return processes[results[selectedAlgorithm].memory[slot] - 1].id + " - " + results[selectedAlgorithm].pages[slot];
							}

							return "";
						}} />
				</Col>

				<Col md={8}>
					<Row className="mb-2">
						<Col md={12}>
							<table className="table">
								<tbody>
									<tr>
										<th>{t("memory.pagination.page_failures")}</th>
										<td>{results[selectedAlgorithm].pageFailures + (incrementPageFailures ? 1 : 0)}</td>
									</tr>

									<tr>
										<th>{t("io.requests")}</th>
										<td>
											{requests.map((request, index) => {
												let background: string;

												if (index < results[selectedAlgorithm].currentCycle) {
													background = "bg-success";
												} else if (index == results[selectedAlgorithm].currentCycle) {
													background = "bg-warning";
												} else {
													background = "bg-secondary";
												}

												return (
													<span
														key={index}
														className={`badge mr-1 ${background}`}>
														{request.process} - {request.page}
														{request.modified && <sup>*</sup>}
													</span>
												);
											})}
										</td>
									</tr>
								</tbody>
							</table>
						
						</Col>
					</Row>
					<Row>
						{Object.entries(results[selectedAlgorithm].processTable).map(([key, value]) => 
							<Row data-tut="pagination_results_2">
								<Col md={4}>
									<table className="table">
										<thead>
											<tr>
												<th className="text-end border-bottom-0">{t("memory.pagination.page")}</th>
												<th>{t("memory.pagination.frame")}</th>
												{selectedAlgorithm == "fifo" && <th>{t("cpu.arrival")}</th>}
												{selectedAlgorithm == "lru" && <th>{t("memory.pagination.last_access")}</th>}
												{["clock", "nru"].indexOf(selectedAlgorithm) >= 0 && 
													<OverlayTrigger
														overlay={<Tooltip id="previous_step_btn_tooltip">{t("memory.pagination.access_bit")}</Tooltip>}>
														<th>A</th>
													</OverlayTrigger>
												}
												{selectedAlgorithm == "nru" && 
													<OverlayTrigger
														overlay={<Tooltip id="previous_step_btn_tooltip">{t("memory.pagination.modified_bit")}</Tooltip>}>
														<th>M</th>
													</OverlayTrigger>
												}
											</tr>
										</thead>

										<tbody>
											{value.pages.map((entry, index) => 
												<tr key={`entry_${key}_${index	}`}>
													<td className="cell-border-right text-end border-bottom-0">
														{index}
													</td>
													<td>
														{entry.data.frame < 0 ?
															"-"
															:
															entry.data.frame
														}
													</td>
													{selectedAlgorithm == "fifo" &&
														<td>
															{entry.data.frame < 0 ?
																"-"
																:
																entry.arrival
															}
														</td>
													}
													{selectedAlgorithm == "lru" &&
														<td>
															{entry.data.frame < 0 ?
																"-"
																:
																entry.lastUse
															}
														</td>
													}
													{["clock", "nru"].indexOf(selectedAlgorithm) >= 0 &&
														<td>
															{entry.data.accessBit ? "1" : "0"}
														</td>
													}
													{selectedAlgorithm == "nru" &&
														<td>
															{entry.data.modifiedBit ? "1" : "0"}
														</td>
													}
												</tr>
											)}
										</tbody>
									</table>
								</Col>

								<Col key={`table_${key}`} md={8}>
									<h3>{t("memory.pagination.process_name", { name: key })}</h3>
									{t("memory.pagination.page_failures")}: {value.failures + ((incrementPageFailures &&  requests[results[selectedAlgorithm].currentCycle].process === key) ? 1 : 0)}
									
									<Row className="scrollable-x auto-scroll-end">
										{processes.map(process => {
											if (process.id == key) {
												// only show the next request process frame table if the
												// the next request is from this process
												let moreRequestsFromThisProcess: boolean = false;
												let pageFailure: number = 0;
												if (requests.length > results[selectedAlgorithm].currentCycle) {
													let currentRequest: Request = requests[results[selectedAlgorithm].currentCycle];
													moreRequestsFromThisProcess = currentRequest.process == key;
												
													if (value.loadedPages.indexOf(currentRequest.page) < 0) {
														// page is not loaded
														pageFailure = value.loadedPages.length == process.frames ? 0b101 : 0b100;
													}
												}

												return (
													<>
														{(key in results[selectedAlgorithm].snapshots) &&
															results[selectedAlgorithm].snapshots[key].map(snapshot =>
																<ProcessFrameTable 
																	process={process}
																	entry={snapshot.table}
																	request={snapshot.request}
																	pageFailure={snapshot.pageFailure}
																	showPointer={["nru", "clock"].indexOf(selectedAlgorithm) >= 0}
																	accessBit={["nru", "clock"].indexOf(selectedAlgorithm) >= 0}
																	modifiedBit={selectedAlgorithm == "nru"} />
															)
														}

														{moreRequestsFromThisProcess &&
															<ProcessFrameTable 
																process={process}
																entry={value}
																request={requests[results[selectedAlgorithm].currentCycle]}
																showPointer={["nru", "clock"].indexOf(selectedAlgorithm) >= 0}
																accessBit={["nru", "clock"].indexOf(selectedAlgorithm) >= 0}
																pageFailure={pageFailure}
																modifiedBit={selectedAlgorithm == "nru"} />
														}
													</>
												);
											}
										})}
									</Row>
								</Col>
							</Row>
						)}
					</Row>
				</Col>
			</Row>
			}

			{!props.simpleView &&
			<Row>
				<h2>{t("common.simulator_results")}</h2>
				{selectedAlgorithms.length == 0 && t("memory.pagination.select_algorithm")}
				<Row className="scrollable-x">
				{selectedAlgorithms.map((algorithm) => 
					(algorithm in results) &&
					<Col md={6}>
						<h3>{t(`memory.pagination.algorithms.${algorithm}`)}</h3>

						<table className="table">
							<tbody>
								<tr>
									<th>{t("memory.pagination.page_failures")}</th>
									<td>
										{results[algorithm].pageFailures + (
											requests[results[algorithm].currentCycle] &&
											results[algorithm].processTable[requests[results[algorithm].currentCycle].process].loadedPages.indexOf(requests[results[algorithm].currentCycle].page) < 0 
										? 1 : 0)}
									</td>
								</tr>

								<tr>
									<th>{t("io.requests")}</th>
									<td>
										{requests.map((request, index) => 
										{
											let background: string;

											if (index < results[algorithm].currentCycle) {
												background = "bg-success";
											} else if (index == results[algorithm].currentCycle) {
												background = "bg-warning";
											} else {
												background = "bg-secondary";
											}

											return (
												<span
													key={index}
													className={`badge mr-1 ${background}`}>
													{request.process} - {request.page}
													{request.modified && <sup>*</sup>}
												</span>
											);
										})}
									</td>
								</tr>
							</tbody>
						</table>

						{processes.map(process => 
							<>
								
								{Object.entries(results[algorithm].processTable).map(([key, value]) => {
									if (key == process.id) {
										// only show the next request process frame table if the
										// the next request is from this process
										let moreRequestsFromThisProcess: boolean = false;
										let pageFailure: number = 0;
										if (requests.length > results[algorithm].currentCycle) {
											let currentRequest: Request = requests[results[algorithm].currentCycle];
											moreRequestsFromThisProcess = currentRequest.process == key;
												
											if (value.loadedPages.indexOf(currentRequest.page) < 0) {
												// page is not loaded
												pageFailure = value.loadedPages.length == process.frames ? 0b101 : 0b100;
											}
										}

										return (
											<>
												<p>
													{key} <br/>
													{t("memory.pagination.page_failures")}: {value.failures}
												</p>
												<Row className="scrollable-x auto-scroll-end">
												{(key in results[algorithm].snapshots) &&
													results[algorithm].snapshots[key].map(snapshot =>
														<ProcessFrameTable 
															process={process}
															entry={snapshot.table}
															request={snapshot.request}
															pageFailure={snapshot.pageFailure}
															showPointer={["nru", "clock"].indexOf(algorithm) >= 0}
															accessBit={["nru", "clock"].indexOf(algorithm) >= 0}
															modifiedBit={algorithm == "nru"} />
													)
												}

												{moreRequestsFromThisProcess &&
													<ProcessFrameTable 
														process={process}
														entry={value}
														request={requests[results[algorithm].currentCycle]}
														showPointer={["nru", "clock"].indexOf(algorithm) >= 0}
														accessBit={["nru", "clock"].indexOf(algorithm) >= 0}
														pageFailure={pageFailure}
														modifiedBit={algorithm == "nru"} />
												}
												</Row>
											</>
										);
									}
								})}
							</>
						)}						
					</Col>
				)}
				</Row>
			</Row>
			}

			<AlgorithmModal />

			<SimulatorControl 
				hasNext={hasNextStep()}
				next={nextStep}
				hasPrevious={hasPreviousStep()}
				previous={previousStep}
				reset={clear}
				stop={reset}
				start={play}
				pause={pause}
				running={isRunning}
				timerCallback={nextStep}
				onSaveFile={saveFile}
				onOpenFile={loadFile} />
		</>
	);
});

export { PaginationPage };
export type { PaginationPageFunctions };
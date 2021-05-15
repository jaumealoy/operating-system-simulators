import React, { useState, useRef } from "react";
import TopBar from "../../components/TopBar";
import { useTranslation } from "react-i18next";
import useMemorySimulator from "./useMemorySimulator";
import { AllocationPage, AllocationPageFunctions} from "./AllocationSimulator/AllocationPage";
import { PaginationPage, PaginationPageFunctions } from "./PaginationSimulator/PaginationPage";
import Tour, { ReactourStep } from 'reactour'
import useTutorial, { StepAction } from "../../helpers/useTutorial";

function MemorySimulatorPage() {
	const { t } = useTranslation();

	const {
		selectedView, setSelectedView,
		isSimpleView, setSimpleView
	} = useMemorySimulator();

	const allocationPage = useRef<AllocationPageFunctions>(null);
	const paginationPage = useRef<PaginationPageFunctions>(null);

	const STEPS: ReactourStep[] = [
		{
			selector: '[data-tut="memory_simulators"]',
			content: t("memory.tutorial.text_1")
		},

		{
			selector: '[data-tut="allocation_settings"]',
			content: t("memory.tutorial.text_2")
		},

		{
			selector: '[data-tut="allocation_requests"]',
			content: t("memory.tutorial.text_3")
		},

		{
			selector: '[data-tut="allocation_results"]',
			content: t("memory.tutorial.text_4")
		},

		{
			selector: '[data-tut="pagination_settings"]',
			content: t("memory.tutorial.text_5")
		},

		{
			selector: '[data-tut="pagination_processes"]',
			content: t("memory.tutorial.text_6")
		},

		{
			selector: '[data-tut="pagination_requests"]',
			content: t("memory.tutorial.text_7")
		},

		{
			selector: '[data-tut="pagination_results_1"]',
			content: t("memory.tutorial.text_8")
		},

		{
			selector: '[data-tut="pagination_results_2"]',
			content: t("memory.tutorial.text_9")
		}
	];

	const STEP_ACTIONS: {[key: number]: StepAction} = {
		1: {
			onBeforeReach: () => {
				setSelectedView("allocation");
				setSimpleView(true);
			}
		},

		2: {
			onFinish: () => {
				if (allocationPage.current != null) {
					allocationPage.current.tutorialStep(1);
				}
			}
		},

		4: {
			onBeforeReach: () => {
				setSelectedView("pagination");
				setSimpleView(true);
			}
		},

		7: {
			onBeforeReach: () => {
				if (paginationPage.current != null) {
					paginationPage.current.tutorialStep(1);
				}
			}
		}
	};

	const Tutorial = useTutorial("memory", STEPS.length, true, STEP_ACTIONS);

	return (
		<>
			<TopBar
				onClickTutorial={Tutorial.show}
				simpleView={isSimpleView}
				onChangeView={setSimpleView}>
				<div 
					data-tut="memory_simulators"
					className="float-right mt-2 mt-md-0 mr-md-2">
					<div className="btn-group">
						<input 
							type="radio"
							name="simulator-select"
							id="allocation-view"
							checked={selectedView == "allocation"}
							onChange={() => setSelectedView("allocation")}
							className="btn-check" />

						<label 
							htmlFor="allocation-view"
							className="btn btn-sm btn-outline-secondary">
							{t("memory.allocation_menu")}
						</label>

						<input 
							type="radio"
							name="simulator-select"
							id="pagination-view"
							checked={selectedView == "pagination"}
							onChange={() => setSelectedView("pagination")}
							className="btn-check" />

						<label 
							htmlFor="pagination-view"
							className="btn btn-sm btn-outline-secondary">
							{t("memory.pagination_menu")}
						</label>
					</div>
				</div>
			</TopBar>

			{selectedView == "allocation" && <AllocationPage simpleView={isSimpleView} ref={allocationPage} />}
			{selectedView == "pagination" && <PaginationPage simpleView={isSimpleView} ref={paginationPage} />}

			<Tour
				steps={STEPS}
				onAfterOpen={Tutorial.onOpen}
				goToStep={Tutorial.step}
				getCurrentStep={Tutorial.onStepChange}
				nextStep={Tutorial.nextStep}
				prevStep={Tutorial.prevStep}
				onRequestClose={Tutorial.close}
				isOpen={Tutorial.visible} />
		</>
	);
}

export default MemorySimulatorPage;
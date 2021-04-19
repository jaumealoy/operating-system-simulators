import React, { useState } from "react";
import TopBar from "../../components/TopBar";
import { useTranslation } from "react-i18next";
import useMemorySimulator from "./useMemorySimulator";
import AllocationPage from "./AllocationSimulator/AllocationPage";
import PaginationPage from "./PaginationSimulator/PaginationPage";

function MemorySimulatorPage() {
	const { t } = useTranslation();

	const {
		selectedView, setSelectedView,
		isSimpleView, setSimpleView
	} = useMemorySimulator();

	return (
		<>
			<TopBar
				simpleView={isSimpleView}
				onChangeView={setSimpleView}>
				<div className="float-right mr-2">
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

			{selectedView == "allocation" && <AllocationPage simpleView={isSimpleView} />}
			{selectedView == "pagination" && <PaginationPage simpleView={isSimpleView} />}
		</>
	);
}

export default MemorySimulatorPage;
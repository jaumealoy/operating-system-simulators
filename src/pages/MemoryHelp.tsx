import React from "react";
import { useTranslation } from "react-i18next";

import PaginationAddRequestEs from "./../assets/images/help/pagination_add_request_es.png";
import PaginationAddRequestCa from "./../assets/images/help/pagination_add_request_ca.png";
import PaginationAddProcessEs from "./../assets/images/help/pagination_add_process_es.png";
import PaginationAddProcessCa from "./../assets/images/help/pagination_add_process_ca.png";
import LocaleImage from "../components/LocaleImage";

function AllocationHelp() {
	const { t } = useTranslation();

	return (
		<>
			<h3>{t("memory.allocation_menu")}</h3>
			<p>{t("help.memory.allocation.text_1")}</p>
			<p>{t("help.memory.allocation.text_2")}</p>
			
			<h4>{t("help.algorithms")}</h4>
			<h5>{t("memory.allocation.algorithms.first_fit")}</h5>
			<p>{t("help.modals.memory.allocation.first_fit.text_1")}</p>
			<p>{t("help.modals.memory.allocation.first_fit.text_2")}</p>

			<h5>{t("memory.allocation.algorithms.next_fit")}</h5>
			<p>{t("help.modals.memory.allocation.next_fit.text_1")}</p>
			<p>{t("help.modals.memory.allocation.next_fit.text_2")}</p>
			<p>{t("help.modals.memory.allocation.next_fit.text_3")}</p>

			<h5>{t("memory.allocation.algorithms.best_fit")}</h5>
			<p>{t("help.modals.memory.allocation.best_fit.text_1")}</p>
			<p>{t("help.modals.memory.allocation.best_fit.text_2")}</p>

			<h5>{t("memory.allocation.algorithms.worst_fit")}</h5>
			<p>{t("help.modals.memory.allocation.worst_fit.text_1")}</p>

			<h5>{t("memory.allocation.algorithms.buddy")}</h5>
			<p>{t("help.modals.memory.allocation.buddy.text_1")}</p>
			<p>{t("help.modals.memory.allocation.buddy.text_2")}</p>
			<p>{t("help.modals.memory.allocation.buddy.text_3")}</p>

			<h4>{t("help.working")}</h4>
			<p>{t("help.memory.allocation.text_3")}</p>
			<p>
				{t("help.memory.allocation.text_4")}
				<ul>
					<li>{t("help.memory.allocation.text_4_1")}</li>
					<li>{t("help.memory.allocation.text_4_2")}</li>
					<li>{t("help.memory.allocation.text_4_3")}</li>
					<li>{t("help.memory.allocation.text_4_4")}</li>
				</ul>
			</p>
			<p>{t("help.memory.allocation.text_5")}</p>
			<p>{t("help.memory.allocation.text_6")}</p>
			<p>{t("help.memory.allocation.text_7")}</p>
		</>
	);
}

function PaginationHelp() {
	const { t } = useTranslation();

	return (
		<>
			<h3>{t("memory.pagination_menu")}</h3>
			<p>{t("help.memory.pagination.text_1")}</p>
			<p>{t("help.memory.pagination.text_2")}</p>
			<p>{t("help.memory.pagination.text_3")}</p>

			<h4>{t("help.algorithms")}</h4>
			<h5>{t("memory.pagination.algorithms.optimal")}</h5>
			<p>{t("help.modals.memory.pagination.optimal.text_1")}</p>
			<p>{t("help.modals.memory.pagination.optimal.text_2")}</p>
					
			<h5>{t("memory.pagination.algorithms.fifo")}</h5>
			<p>{t("help.modals.memory.pagination.fifo.text_1")}</p>
			<p>{t("help.modals.memory.pagination.fifo.text_2")}</p>
			<p>{t("help.modals.memory.pagination.fifo.text_3")}</p>

			<h5>{t("memory.pagination.algorithms.lru")}</h5>
			<p>{t("help.modals.memory.pagination.lru.text_1")}</p>
			<p>{t("help.modals.memory.pagination.lru.text_2")}</p>
			
			<h5>{t("memory.pagination.algorithms.clock")}</h5>
			<p>{t("help.modals.memory.pagination.clock.text_1")}</p>
			<p>
				{t("help.modals.memory.pagination.clock.text_2")}
				<ul>
					<li>{t("help.modals.memory.pagination.clock.text_2_1")}</li>
					<li>{t("help.modals.memory.pagination.clock.text_2_2")}</li>
				</ul>
			</p>

			<h5>{t("memory.pagination.algorithms.nru")}</h5>
			<p>{t("help.modals.memory.pagination.nru.text_1")}</p>
			<p>
				{t("help.modals.memory.pagination.nru.text_2")}
				<ul>
					<li>{t("help.modals.memory.pagination.nru.text_2_1")}</li>
					<li>{t("help.modals.memory.pagination.nru.text_2_2")}</li>
				</ul>
			</p>

			<h4>{t("help.working")}</h4>
			<p>{t("help.memory.pagination.text_4")}</p>
			<p>{t("help.memory.pagination.text_5")}</p>
			<p className="text-center">
				<LocaleImage 
					default={PaginationAddProcessEs}
					languages={{
						"es": PaginationAddProcessEs, 
						"ca": PaginationAddProcessCa
					}} />
			</p>

			<p>{t("help.memory.pagination.text_6")}</p>
			<p className="text-center">
				<LocaleImage 
					default={PaginationAddRequestEs}
					languages={{
						"es": PaginationAddRequestEs, 
						"ca": PaginationAddRequestCa
					}} />
			</p>

			<p>{t("help.memory.pagination.text_7")}</p>

		</>
	);
}

function MemoryHelp() {
	const { t } = useTranslation();

	return (
		<>
			<h2>{t("help.memory.management")}</h2>
			<AllocationHelp />
			<PaginationHelp />
		</>
	);
}

export default MemoryHelp;
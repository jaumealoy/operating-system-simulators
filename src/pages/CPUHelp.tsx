import React from "react";
import { useTranslation } from "react-i18next";
import Latex from "./../components/Latex";

import TimeChartImage from "./../assets/images/help/cpu_diagrama_temps.png";

function CPUHelp() {
	const { t } = useTranslation();

	return (
		<>
			<h2>{t("help.cpu.title")}</h2>
			<p>{t("help.cpu.text_1")}</p>

			<h3>{t("help.algorithms")}</h3>

			<h4>{t("cpu.algorithms.fifo")}</h4>
			<p>{t("help.modals.cpu.fifo.text_1")}</p>
			<p>{t("help.modals.cpu.fifo.text_2")}</p>
			<p>{t("help.modals.cpu.fifo.text_3")}</p>
			<p>{t("help.modals.cpu.fifo.text_4")}</p>
			
			<h4>{t("cpu.algorithms.spn")}</h4>
			<p>{t("help.modals.cpu.spn.text_1")}</p>
			<p>{t("help.modals.cpu.spn.text_2")}</p>
			<p>{t("help.modals.cpu.spn.text_3")}</p>
			
			<h4>{t("cpu.algorithms.srtn")}</h4>
			<p>{t("help.modals.cpu.srtn.text_1")}</p>
			<p>{t("help.modals.cpu.srtn.text_2")}</p>
			<p>{t("help.modals.cpu.srtn.text_3")}</p>

			<h4>{t("cpu.algorithms.hrrn")}</h4>
			<p>{t("help.modals.cpu.hrrn.text_1")}</p>
			<p>{t("help.modals.cpu.hrrn.text_2")}</p>
			<Latex display>
				{`\\textrm{${t("cpu.ratio")}} = \\frac{\\textrm{${t("cpu.waiting_time")}} + T_s}{T_s}`}
			</Latex>
			<p>{t("help.modals.cpu.hrrn.text_3")}</p>
			<p>{t("help.modals.cpu.hrrn.text_4")}</p>

			<h4>{t("cpu.algorithms.rr")}</h4>
			<p>{t("help.modals.cpu.rr.text_1")}</p>
			<p>{t("help.modals.cpu.rr.text_2")}</p>
			
			<h4>{t("cpu.algorithms.feedback")}</h4>
			<p>{t("help.modals.cpu.feedback.text_1")}</p>
			<p>{t("help.modals.cpu.feedback.text_2")}</p>

			<p>
				{t("help.modals.cpu.feedback.text_3_1")}
				<Latex display={false}>
					{"2^i"}
				</Latex>
				{t("help.modals.cpu.feedback.text_3_2")}
			</p>
			<p>{t("help.modals.cpu.feedback.text_4")}</p>

			<h3>{t("help.working")}</h3>
			<p>{t("help.cpu.text_2")}</p>

			
			<h4>{t("cpu.processes")}</h4>
			<p>
				{t("help.cpu.working.text_1")}
				<ul>
					<li>{t("help.cpu.working.text_1_1")}</li>
					<li>{t("help.cpu.working.text_1_2")}</li>
					<li>
						{t("help.cpu.working.text_1_3")}
						<br/>
						{t("help.cpu.working.text_1_4")}
					</li>
				</ul>
			</p>

			<p>{t("help.cpu.working.text_2")}</p>
			<p>{t("help.cpu.working.text_3")}</p>

			<h4>{t("help.cpu.working.views_title")}</h4>
			<p>{t("help.cpu.working.text_4")}</p>

			<p>
				{t("help.cpu.working.text_5_1")}
				<br/>
				{t("help.cpu.working.text_5_2")}
			</p>

			<p>{t("help.cpu.working.text_6")}</p>

			<h3>{t("help.cpu.working.results_title")}</h3>
			
			<h4>{t("help.cpu.working.time_chart_title")}</h4>
			<p>
				{t("help.cpu.working.text_7_1")}
				<div className="text-center"><img src={TimeChartImage}/></div>
				{t("help.cpu.working.text_7_2")}
			</p>

			<p>
				{t("help.cpu.working.text_8_1")}
				<ul>
					<li>{t("help.cpu.working.text_8_2")}</li>
					<li>{t("help.cpu.working.text_8_3")}</li>
					<li>{t("help.cpu.working.text_8_4")}</li>
				</ul>
			</p>

			<h4 id="cpu_summary">{t("help.cpu.working.summary_table_title")}</h4>
			<p>
				{t("help.cpu.working.text_9")}

				<ul>
					<li>{t("help.cpu.working.text_9_1")}</li>
					<li>{t("help.cpu.working.text_9_2")}</li>
					<li>{t("help.cpu.working.text_9_3")}</li>
					<li>{t("help.cpu.working.text_9_4")}</li>
					<li>{t("help.cpu.working.text_9_5")} (T<sub>s</sub>).</li>
					<li>{t("help.cpu.working.text_9_6")} (T<sub>r</sub>), {t("help.cpu.working.text_9_7")}</li>
					<li>
						{t("help.cpu.working.text_9_8")}
						<Latex display={false}>
							{"T_r / T_s"}
						</Latex>
					</li>
				</ul>

				{t("help.cpu.working.text_10")}
				
			</p>
		</>
	)
}

export default CPUHelp;
import React, { useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import TableOfContent from "../components/TOC/TableOfContent";
import CPUHelp from "./CPUHelp";
import IOHelp from "./IOHelp";
import MemoryHelp from "./MemoryHelp";

function HelpPage() {
	const { t } = useTranslation();
	return (
		<>
			<Row>
				<Col className="faq" md={8}>
					<h1>{t("menu.FAQ")}</h1>
					<p>{t("help.about.text_1")}</p>

					<IOHelp />

					<CPUHelp />

					<MemoryHelp />

					<h2>{t("help.about.title")}</h2>
					<p>
						{t("help.about.text_2")}
						&nbsp; <a href="https://uib.cat" target="_blank">Universitat de les Illes Balears</a>.
					</p>

					<p>
						{t("help.about.developed_by")}
						<a href="https://github.com/jaumealoy/" target="_blank">Jaume Aloy Vich</a>
						{t("help.about.supervision")}
					</p>
				</Col>

				<TableOfContent root="h2" />
			</Row>
		</>
	);
}

export default HelpPage;
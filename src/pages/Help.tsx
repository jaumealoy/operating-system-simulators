import React from "react";
import { Row, Col } from "react-bootstrap";
import TableOfContent from "../components/TOC/TableOfContent";
import CPUHelp from "./CPUHelp";



function HelpPage() {

	


	return (
		<>
			<Row>
				<Col className="faq" md={8}>
					<h1>Ayuda</h1>
					<p>
						En esta sección puedes encontrar información sobre los propios simuladores y de los conceptos relacionados con ellos.
					</p>

					<CPUHelp />

				</Col>

				<TableOfContent root="h2" />

				<h2>Sobre la aplicación</h2>
			</Row>
		</>
	);
}

export default HelpPage;
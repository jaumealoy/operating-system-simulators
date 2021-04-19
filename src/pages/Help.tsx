import React from "react";
import { Row, Col } from "react-bootstrap";
import TableOfContent from "../components/TOC/TableOfContent";
import CPUHelp from "./CPUHelp";
import IOHelp from "./IOHelp";



function HelpPage() {

	


	return (
		<>
			<Row>
				<Col className="faq" md={8}>
					<h1>Ayuda</h1>
					<p>
						En esta sección puedes encontrar información sobre los propios simuladores y de los conceptos relacionados con ellos.
					</p>

					<IOHelp />

					<CPUHelp />

					<h2>Sobre la aplicación</h2>
					<p>
						Esta aplicación ha sido desarrollada como Trabajo de Fin de Grado del Grado en Ingeniería Informática de la 
						&nbsp; <a href="https://uib.cat" target="_blank">Universitat de les Illes Balears</a>
					</p>

					<p>
						Aplicación desarrollada por <a href="https://github.com/jaumealoy/" target="_blank">Jaume Aloy Vich</a> con la supervisión de Adelaida Delgado Domínguez.
					</p>
				</Col>

				<TableOfContent root="h2" />

			</Row>
		</>
	);
}

export default HelpPage;
import React from "react";
import { useTranslation } from "react-i18next";
import LocaleImage from "../components/LocaleImage";


import HardDrive_es from "./../assets/images/help/hard_drive_es.svg";
import HardDrive_ca from "./../assets/images/help/hard_drive_ca.svg";
import AddRequest_es from "./../assets/images/help/io_add_request_es.png";
import AddRequest_ca from "./../assets/images/help/io_add_request_ca.png";
import RemoveRequest from "./../assets/images/help/io_remove_request.png";

function IOHelp() {
	const { t } = useTranslation();

	return (
		<>
			<h2>Planificación de E/S</h2>
			<p>
				El simulador de Entrada y Salida permite observar el funcionamiento de 
				los algoritmos utilizados para atender a las peticiones de acceso a disco.
			</p>

			<h3>Elementos de un disco duro</h3>
			
			<div className="text-center">
				<LocaleImage 
					width="70%"
					languages={{ ca: HardDrive_ca, es: HardDrive_es }}
					default={HardDrive_es} />
			</div>
			<p>
				El disco duro es un dispositivo de almacenamiento que hace uso de las 
				propiedades magnéticas de sus discos para almacenar información. El dispositivo se puede dividir en distintas partes: 
				<ul>
					<li>
						Los platos son cada uno de los discos donde se guarda la información bit a bit. 
						<br/>
						Estos platos están hechos de un material con unas propiedades magnéticas que permiten cambiar la orientación del campo magnético.
					</li>

					<li>
						Las pistas son cada una de las divisiones radiales en el plato.
					</li>

					<li>
						Las pistas se dividen en sectores, que son la unidad mínima de información. 
						Los sectores situados más a la periferia tendrán una densidad de información inferior a los situados en pistas más interiores.
					</li>

					<li>
						El cilindro es el conjunto de una pista en los distintos platos.
					</li>

					<li>
						El cabezal es una pieza móvil que realiza la lectura o escritura de la información en los sectores. 
						Esta pieza puede cambiar la orientación del campo magnético de los platos, en función de la información que se quiere escribir.
					</li>
				</ul>
			</p>

			<h3>Algoritmos</h3>
			<h4>FCFS</h4>
			<p>{t("help.modals.io.fcfs.text_1")}</p>
			<p>{t("help.modals.io.fcfs.text_2")}</p>

			<h4>SSTF</h4>
			<p>{t("help.modals.io.sstf.text_1")}</p>
			<p>{t("help.modals.io.sstf.text_2")}</p>

			<h4>SCAN</h4>
			<p>{t("help.modals.io.scan.text_1")}</p>
			<p>{t("help.modals.io.scan.text_2")}</p>

			<h4>C-SCAN</h4>
			<p>{t("help.modals.io.cscan.text_1")}</p>
			<p>{t("help.modals.io.cscan.text_2")}</p>

			<h4>LOOK</h4>
			<p>{t("help.modals.io.look.text_1")}</p>
			<p>{t("help.modals.io.look.text_2")}</p>
			
			<h4>C-LOOK</h4>
			<p>{t("help.modals.io.clook.text_1")}</p>
			
			<h3>Funcionamiento</h3>
			<p>
				El simulador permite seleccionar entre los distintos algoritmos, la posición inicial del cabezal y la cantidad de pistas del disco. 
			</p>

			<p>Los algoritmos que requieren una configuración adicional como SCAN y LOOK (y sus variantes) permiten indicar el sentido inicial del recorrido.</p>
			<p>Para añadir una petición al simulador, se debe introducir un valor numérico en el rango [0, número de pistas) y pulsar el botón “Añadir petición”. </p>

			<div className="text-center">
				<LocaleImage 
					languages={{ ca: AddRequest_ca, es: AddRequest_es }}
					default={AddRequest_es} />
			</div>

			<p>
			También se pueden eliminar las peticiones añadidas haciendo click en el icono de eliminar petición situado a la derecha del número de pista.
			</p>

			<div className="text-center">
				<img width="250px" src={RemoveRequest} />
			</div>

			<p>
				Los resultados del simulador son:
				<ul>
					<li>Un gráfico que muestra las distintas peticiones y cómo han sido atendidas. El eje horizontal representa el orden de atención y el vertical el número de pista.</li>
					<li>Una tabla con cada uno de los desplazamientos, indicando la posición inicial y final del desplazamiento.</li>
				</ul>
			</p>
		</>
	)
}

export default IOHelp;
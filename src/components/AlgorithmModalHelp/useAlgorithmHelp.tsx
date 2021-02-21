import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { Trans, useTranslation } from "react-i18next";

interface AlgorithmModal {
	title: string;
	body: JSX.Element;
};

const useAlgorithmHelp = (simulator: string) => {
	// modals data
	const { t } = useTranslation();

	const ALGORITHM_HELP: {[key: string]: {[key: string]: AlgorithmModal}} = {
		"io": {
			"fcfs": {
				title: "First Come First Served (FCFS)",
				body:
					<>
						<p>{t("help.modals.io.fcfs.text_1")}</p>
						<p>{t("help.modals.io.fcfs.text_2")}</p>
					</>,
			},

			"sstf": {
				title: "Shortest Seek Time First (SSTF)",
				body: 
					<>
						<p>
							El algoritmo Shortest Seek Time First atiende primero aquellas peticiones que se encuentran más cerca del cabezal.
						</p>

						<p>
							Este sistema favorece las peticiones que se encuentran cerca del cabezal, desfavoreciendo las peticiones periféricas.
						</p>
					</>
			},
			
			"scan": {
				title: "SCAN",
				body: 
					<>
						<p>
							El algoritmo SCAN intenta simular el comportamiento de un ascensor. El cabezal se mueve desde la primera pista, aunque no haya peticiones, hasta la última procesando las peticiones que se encuentra. Cuando llega a un extremo, realiza el mismo recorrido pero con sentido contrario.
						</p>

						<p>
							El objetivo del algoritmo es reducir los cambios de sentido pero favorece a las peticiones recientes.
						</p>
					</>
			},
			
			"cscan": {
				title: "C-SCAN",
				body: 
					<>
						<p>
							El algoritmo C-SCAN intenta simular el comportamiento de un ascensor como el algoritmo SCAN. El cabezal se mueve en un único sentido (ascendente o descendente) y cuando llega a un extremo se situa rápidamente al contrario sin atender peticiones.
						</p>

						<p>
							El principal objetivo es eliminar la discriminación entre las pistas interiores y las periféricas.
						</p>
					</>
			},
			
			"look": {
				title: "LOOK",
				body: 
					<>
						<p>
							El algoritmo LOOK simula el comportamiento de un ascensor. Este algoritmo procesa todas las peticiones que se encuentra en un sentido hasta llegar a la última pista. Luego realiza el mismo recorrido pero en sentido contrario hasta llegar a la última petición, sin llegar al extremo del disco. 
						</p>

						<p>
							La principal diferencia entre LOOK y SCAN es que el primero no llega hasta los límites del disco, en cambio, SCAN sí.
						</p>
					</>
			},
			
			"clook": {
				title: "C-LOOK",
				body: 
					<>
						<p>
							El algoritmo C-LOOK tiene un comportamiento similar al LOOK. Este algoritmo siempre atiende todas las peticiones que se encuentra en un sentido, y siempre es el mismo. A diferencia del C-SCAN, éste no llega a los extremos del disco, solo hasta la pista con peticiones.
						</p>
					</>
			}
		}
	};


	// indicates whether the modal is shown or not
	const [visible, setVisible] = useState<boolean>(false);
	const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("");

	const show = (algorithm: string) => {
		setSelectedAlgorithm(algorithm);
		setVisible(true);
	};

	const close = () => setVisible(false);

	const modal = () => (
		<Modal
			onHide={close}
			show={visible}>
			{visible &&
				<>
					<Modal.Header closeButton>
						{ALGORITHM_HELP[simulator][selectedAlgorithm].title}
					</Modal.Header>

					<Modal.Body>
						{ALGORITHM_HELP[simulator][selectedAlgorithm].body}
					</Modal.Body>
				</>
			}

			<Modal.Footer>
				<button 
					onClick={close}
					className="btn btn-secondary">
						Cerrar
				</button>
			</Modal.Footer>
		</Modal>
	);

	return {
		showAlgorithmModal: show,
		AlgorithmModal: modal 
	};
};

export default useAlgorithmHelp;
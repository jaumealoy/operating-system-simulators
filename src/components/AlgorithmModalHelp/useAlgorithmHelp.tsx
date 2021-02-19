import React, { useState } from "react";

import { Modal } from "react-bootstrap";

interface AlgorithmModal {
	title: string;
	body: JSX.Element;
};

const ALGORITHM_HELP: {[key: string]: {[key: string]: AlgorithmModal}} = {
	"io": {
		"fcfs": {
			title: "First Come First Served (FCFS)",
			body:
				<>
					<p>
						El algoritmo <i>First Come First Served</i> procesa los accesos a disco secuencialment. 
						La primera petición que se recibe es la primera petición procesada.
					</p>

					<p>
						Al realizarse muchas peticiones, este algoritmo se comporta como una planificación aleatoria, aunque es el
						sistema más justo de todos.
					</p>
				</>,
		},

		"sstf": {
			title: "Shortest Seek Time First (SSTF)",
			body: <></>
		},
		
		"scan": {
			title: "SCAN",
			body: <></>
		},
		
		"cscan": {
			title: "C-SCAN",
			body: <></>
		},
		
		"look": {
			title: "LOOK",
			body: <></>
		},
		
		"clook": {
			title: "C-LOOK",
			body: <></>
		}
	}
};

const useAlgorithmHelp = (simulator: string) => {
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
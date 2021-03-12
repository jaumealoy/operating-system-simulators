import React, { FormEvent, useState, useEffect } from "react";
import { Row, Col, FormGroup, FormControl } from "react-bootstrap";
import CycleDistribution from "./../CycleDistribution";
import { Process } from "./../CPUSimulator";

const DEFAULT_NAMES: string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DEFAULT_ARRIVAL: string = "0";
const DEFAULT_DURATION: string = "4";

interface AddProcessFormProps {
    disabled?: boolean;
    onAddProcess?: (process: Process) => void;
	processes: Process[];
};

function AddProcessForm(props: AddProcessFormProps) {
	const getNextValidName = () : string => {
		let validNames = [...DEFAULT_NAMES];

		for (let i = 0; i < props.processes.length; i++) {
			let index = validNames.indexOf(props.processes[i].id);
			
			if (index >= 0) {
				validNames.splice(index, 1);
			}
		}

		if (validNames.length == 0) {
			return "";
		} else {
			return validNames[0];
		}
	}

    // form data
    const [name, setName] = useState<string>("");
    const [arrival, setArrival] = useState<string>(DEFAULT_ARRIVAL);
    const [duration, setDuration] = useState<string>(DEFAULT_DURATION);
    const [cycles, setCycles] = useState<boolean[]>([]);

    useEffect(() => {
        let distribution = [];
		let p_duration: number = parseInt(duration);
		for (let i = 0; i < p_duration; i++) {
			if (i < cycles.length) {
				distribution.push(cycles[i]);
			} else {
				distribution.push(false);
			}
		}
		setCycles(distribution);
    }, [duration]);

    // form status
    let disabled: boolean = props.disabled || false;
    let callback = props.onAddProcess || (() => {});

    // form event handler
    let onFormSubmit = (e: FormEvent) => {
        e.preventDefault();

        // invoking onAddProcess callback
        callback({
            id: name,
            arrival: parseInt(arrival),
            estimatedDuration: 0,
            cycles: cycles
        });

		// clear form
		/*setName(getNextValidName());
		setArrival(DEFAULT_ARRIVAL);
		setDuration(DEFAULT_DURATION);*/
    };

    let onSelectCycle = (index: number, value: boolean) => {
        cycles[index] = value;
        setCycles([...cycles]);
    };

	useEffect(() => {
		setName("");
	}, [props.processes]);

	let isValidName: boolean = true;
	/*for (let i = 0; i < props.processes.length && isValidName; i++) {
		isValidName = props.processes[i].id != name;
	}*/

    return (												
        <form onSubmit={onFormSubmit}>
			<Row>
				<Col md={6}>
					<Row>
						<Col md={6}>
							<FormGroup>
								<label>Nombre</label>
								<FormControl
									required
                                    disabled={disabled}
									onChange={(e) => setName(e.target.value)}
									value={name}
									 />

								<div className="invalid-feedback">
									Ya existe un proceso con ese nombre
								</div>
							</FormGroup>
						</Col>

						<Col md={6}>
							<FormGroup>
								<label>Llegada</label>
								<FormControl
									required
									min={0}
                                    disabled={disabled}
									type="number"
									onChange={(e) => setArrival(e.target.value)}
									value={arrival} />
							</FormGroup>
						</Col>
					</Row>

					<Row>
						{/**<Col md={6}>
							<FormGroup>
								<label>Estimación</label>

								<FormControl
									required
									type="number"
									onChange={(e) => setEstimatedDuration(e.target.value)}
									value={estimatedDuration} />
							</FormGroup>
                        </Col>*/}

						<Col md={6}>
							<FormGroup>
								<label>Ciclos</label>
								<FormControl
									required
                                    disabled={disabled}
									type="number"
                                    min={1}
									onChange={(e) => setDuration(e.target.value)}
									value={duration}
									isInvalid={parseInt(duration) <= 0} />
								
								<div className="invalid-feedback">
									<small>
										El valor debe ser igual o superior a 1
									</small>
								</div>
							</FormGroup>
						</Col>
					</Row>
				</Col>

				<Col md={6}>
					<FormGroup className="cpu-cycle-distribution">
						<label>Distribución de los ciclos</label>

						<CycleDistribution 
                            editable
                            disabled={disabled}
							cycles={cycles}
							onSelectCycle={onSelectCycle} />
					</FormGroup>

					<button 
                        disabled={disabled || !isValidName || parseInt(duration) <= 0}
                        className="btn mt-1 btn-primary">
						Añadir proceso
					</button>
				</Col>
			</Row>
		</form>
    );
};

export default AddProcessForm;
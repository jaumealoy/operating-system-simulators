import React, { useState } from "react";
import { FormGroup, FormControl, FormCheck } from "react-bootstrap";

interface AlgorithmSettingsProps {
	algorithm: string;
	maxQueues?: number;
	quantum?: number;
	quantumMode?: boolean;
	onChangeConfiguration?: (algorithm: string, settings: AlgorithmSettings) => void;
	onFinishConfiguration?: (algorithm: string, settings: AlgorithmSettings) => void;
};

interface AlgorithmSettings {
	maxQueues: number;
	quantum: number;
	quantumMode: boolean;
};

/**
 * Component for selecting settings for algorithms Round Robin and Feedback
 */
function AlgorithmSettings(props: AlgorithmSettingsProps) {
	// algorithm settings, only used when user is in comparaison view and 
	// creating a simulator setting
	const [settings, setSettings] = useState<AlgorithmSettings>({
		maxQueues: 0,
		quantum: 5,
		quantumMode: false
	});

	let showAddButton: boolean = props.onFinishConfiguration != undefined;
	let enabled = ["rr", "feedback"].indexOf(props.algorithm) >= 0;

	let onChangeConfiguration = props.onChangeConfiguration || (() => {});

	/**
	 * Sets the new quantum value
	 * @param value quantum
	 */
	let onQuantumInputChange = (value: number) => {
		if (showAddButton) {
			setSettings({ ...settings, quantum: value });
		} else {
			onChangeConfiguration(
				props.algorithm, 
				{ 
					quantum: value, 
					maxQueues: props.maxQueues ? props.maxQueues : 0, 
					quantumMode: props.quantumMode ? props.quantumMode : false 
				}
			);
		}
	};
	
	/**
	 * Sets the new quantum mode
	 * @param value true if mode is 2^i; false otherwise
	 */
	let onSelectQuantumMode = (value: boolean) => {
		if (showAddButton) {
			setSettings({ ...settings, quantumMode: value });
		} else {
			onChangeConfiguration(
				props.algorithm, 
				{ 
					quantum: props.quantum ? props.quantum : 0, 
					maxQueues: props.maxQueues ? props.maxQueues : 0, 
					quantumMode: value 
				}
			);
		}
	};

	/**
	 * Sets the new maxium queues
	 * @param value number of queues
	 */
	let onMaxQueuesInputChange = (value: number) => {
		if (showAddButton) {
			setSettings({ ...settings, maxQueues: value });
		} else {
			onChangeConfiguration(
				props.algorithm, 
				{ 
					quantum: props.quantum ? props.quantum: 0, 
					maxQueues: value,
					quantumMode: props.quantumMode ? props.quantumMode : false 
				}
			);
		}
	}

	/**
	 * Callback when the add button is pressed
	 * Add the new algorithm variant to the list
	 */
	let finishConfiguration = () => {
		if (props.onFinishConfiguration) {
			props.onFinishConfiguration(props.algorithm, {...settings});
		}
	};

	if (!enabled) {
		return <></>;
	} else {
		return (
			<>
				{props.algorithm == "rr" &&
					<FormGroup>
						<label>Quantum</label>
						<FormControl
							type="number"
							value={showAddButton ? settings.quantum : props.quantum}
							onChange={(e) => onQuantumInputChange(parseInt(e.target.value))}
							min={0}
							step={1}
						/>
					</FormGroup>
				}

				{props.algorithm == "feedback" &&
					<>
						<FormGroup>
							<label>Quantum</label>
							<FormCheck 
								name="quantum_feedback"
								type="radio"
								checked={showAddButton ? !settings.quantumMode : !props.quantumMode}
								onChange={() => onSelectQuantumMode(false)}
								label={
									<div style={{ display: "flex" }}>
										<span className="mr-2">Fijo:</span> 
										<FormControl 
											className="inline-input" 
											size="sm" 
											type="number"
											min={1}
											value={showAddButton ? settings.quantum : props.quantum}
											onChange={(e) => onQuantumInputChange(parseInt(e.target.value))} /> 
									</div>
								} />

							<FormCheck 
								name="quantum_feedback"
								checked={showAddButton ? settings.quantumMode : props.quantumMode}
								onChange={() => onSelectQuantumMode(true)}
								label={<i>2<sup>i</sup></i>}
								type="radio" />
								
						</FormGroup>

						<FormGroup>
							<label>Máximo de colas</label>
							<FormControl 
								min={0}
								value={showAddButton ? settings.maxQueues : props.maxQueues}
								onChange={(e) => onMaxQueuesInputChange(parseInt(e.target.value))}
								type="number" />
							<small>El valor 0 indica ilimitado</small>
						</FormGroup>
					</>
				}

				{props.onFinishConfiguration &&
					<button 
						className="btn btn-sm btn-primary mt-1"
						onClick={() => finishConfiguration()}>
						Añadir configuración
					</button>
				}
			</>
		);
	}
};

export default AlgorithmSettings
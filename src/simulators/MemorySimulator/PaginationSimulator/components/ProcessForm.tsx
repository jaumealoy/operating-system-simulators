import React, { FormEvent, useEffect, useState, forwardRef, useImperativeHandle, Ref } from "react";
import { Row, Col, FormGroup, FormControl } from "react-bootstrap";
import { FiDelete, FiPlusCircle } from "react-icons/fi";
import uniqueElement from "./../../../../helpers/uniqueElement";
import { Process } from "./../PaginationSimulator";
import { useTranslation } from "react-i18next";

const DEFAULT_NAMES: string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

interface ProcessFormProps {
	processes: Process[];
	onAddProcess: (process: Process) => void;
	onRemoveProcess: (index: number) => void;
	enabled?: boolean;
}

interface ProcessFormFunctions {
	clearProcessForm: () => void;
};

function ProcessForm(props: ProcessFormProps, ref: Ref<ProcessFormFunctions>) {
	const { t } = useTranslation();

	// process name
	const [name, setName] = useState<string>("");
	const [frames, setFrames] = useState<string>("");

	let enabled = props.enabled || false;

	let onAddHandler = (e: FormEvent) => {
		if (name.length == 0 || frames.length == 0) {
			return;
		}

		e.preventDefault();

		let process: Process = {
			id: name,
			frames: parseInt(frames)
		};
		
		props.onAddProcess(process);
	};

	useEffect(() => {
		// suggest a default name if the current name is empty or is already in the 
		// process list 
		let usedNames: string[] = props.processes.map(p => p.id);
		let suggest: boolean = name.length == 0 || (usedNames.indexOf(name) >= 0);
		let suggestion: string | null = uniqueElement<string>(DEFAULT_NAMES, props.processes.map(p => p.id));

		if (suggest || (suggestion != null && DEFAULT_NAMES.indexOf(name) > DEFAULT_NAMES.indexOf(suggestion))) {
			if (suggestion == null) {
				suggestion = "";
			}
			
			setName(suggestion);
		}
	}, [props.processes]);

	let validName: boolean = props.processes.map(p => p.id).indexOf(name) == -1;

	return (
		<Row>
			<Col md={4}>
				<form onSubmit={onAddHandler}>
					<FormGroup>
						<label>{t("memory.pagination.name_frames")}</label>
						<div className="input-group">
							<FormControl 
								disabled={!enabled}
								onChange={(e) => setName(e.target.value)}
								value={name}
								required
								type="text"
								isInvalid={!validName} />

							<FormControl 
								type="number"
								disabled={!enabled}
								onChange={(e) => setFrames(e.target.value)}
								value={frames} 
								min={1}
								required />
							
							<button 
								disabled={!enabled || !validName}
								className="input-group-text">
								<FiPlusCircle />
							</button>
						</div>
					</FormGroup>
				</form>
			</Col>

			<Col md={8}>
				{props.processes.length == 0 ?
					t("memory.pagination.no_processes")
					:
					props.processes.map((process, index) => 
						<span className="badge bg-secondary mr-1">
							{process.id}: {process.frames}

							{enabled &&
								<FiDelete 
									onClick={() => props.onRemoveProcess(index)}
									className="ml-1 pointer" />
							}
						</span>
					)
				}
			</Col>
		</Row>
	);
}

export default ProcessForm;
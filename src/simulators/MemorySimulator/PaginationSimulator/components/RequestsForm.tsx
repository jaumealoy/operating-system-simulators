import React, { FormEvent, useRef } from "react";
import { Row, Col, FormGroup, FormControl, FormCheck } from "react-bootstrap";
import { Request, Process } from "./../PaginationSimulator";
import { FiDelete } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface RequestsFormProps {
	processes: Process[];
	requests: Request[];
	onAddRequest: (request: Request) => void;
	onRemoveRequest: (index: number) => void;
	enabled?: boolean;
}

function RequestsForm(props: RequestsFormProps) {
	const { t } = useTranslation();

	// references to input elements
	const processSelect = useRef<HTMLSelectElement>(null);
	const pageInput = useRef<HTMLInputElement>(null);
	const modifiedCheckbox = useRef<HTMLInputElement>(null);

	let enabled: boolean = props.enabled || false;

	let addRequestHandler = (e: FormEvent) => {
		e.preventDefault();
		
		if (processSelect.current != null && pageInput.current != null && modifiedCheckbox.current != null) {
			let request: Request = {
				process: processSelect.current.value,
				page: parseInt(pageInput.current.value),
				modified: modifiedCheckbox.current.checked
			}

			props.onAddRequest(request);

			// focus the select
			processSelect.current.focus();
		}
	};

	return (
		<Row className="mt-1">
			<Col md={4}>
				<form onSubmit={addRequestHandler}>
					<Row>
						<Col md={6}>
							<FormGroup>
								<label>{t("memory.allocation.process")}</label>
								<select
									ref={processSelect}
									className="form-select"
									disabled={props.processes.length == 0 || !enabled}
									required>
									{props.processes.map((process) => 
										<option key={process.id} value={process.id}>
											{process.id}
										</option>
									)}
								</select>
							</FormGroup>
						</Col>

						<Col md={6}>
							<FormGroup> 
								<label>{t("memory.pagination.page")}</label>
								<FormControl 
									ref={pageInput}
									min={0}
									disabled={props.processes.length == 0 || !enabled}
									required={true}
									type="number" />
							</FormGroup>
						</Col>
					</Row>

					<Row className="mt-1">
						<Col md={12}>
							<FormCheck 
								disabled={!enabled}
								ref={modifiedCheckbox}
								value={1}
								label={t("memory.pagination.write")} />
						</Col>
					</Row>
					
					<button 
						disabled={props.processes.length == 0 || !enabled}
						className="btn btn-primary btn-sm float-right mt-1">
						{t("common.buttons.add")}
					</button>
				</form>
			</Col>

			<Col md={8}>
				{t("memory.pagination.added_requests")} <br/>

				{props.requests.map((request, index) => 
					<span className="badge bg-secondary ml-1">
						{request.process} - {request.page}
						{request.modified && <sup>*</sup>}

						{enabled &&
							<FiDelete 
								onClick={() => props.onRemoveRequest(index)}
								className="ml-1 pointer" />
						}
					</span>
				)}
			</Col>
		</Row>
	);
}

export default RequestsForm;
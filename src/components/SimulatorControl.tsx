import React, { useEffect, useState, useRef, FormEvent, ChangeEvent } from "react";

import { GiNextButton, GiPreviousButton, GiOpenFolder, GiPauseButton } from "react-icons/gi";
import { BsFillStopFill, BsPlayFill, BsArrowCounterclockwise } from "react-icons/bs";
import { MdSave } from "react-icons/md";
import { FaFileUpload } from "react-icons/fa";

import { FormControl, Modal } from "react-bootstrap";

import useInterval from "./../helpers/useInterval";
import { SaveFile } from "../simulators/Simulator";

interface SimulatorControlProps {
	hasPrevious?: boolean;
	hasNext?: boolean;
	running?: boolean;
	reset?: () => void;
	stop?: () => void;
	start?: () => void;
	pause?: () => void;
	next?: () => void;
	previous?: () => void;
	onSpeedChange?: (speed: number) => void;
	timerCallback?: () => void;
	onOpenFile?: (data: string) => void;
	onSaveFile?: (download: ((content: string) => void)) => void
};

const MIN_SPEED: number = 100;
const MAX_SPEED: number = 5000;
const STEP_SPEED: number = 100;

function SimulatorControl(props: SimulatorControlProps) {
	// speed slider control
	const [speed, setSpeed] = useState<number>(1000);
	useInterval(
		(props.timerCallback == undefined) ? (() => {}) : props.timerCallback, 
		speed,
		props.running
	);

	// save simulation modal
	const [isSaveModalVisible, setSaveModalVisible] = useState(true);
	const [filename, setFilename] = useState("");
	const downloadLink = useRef<HTMLAnchorElement>(null);
	const onSaveFileSubmit = (e: FormEvent) => {
		e.preventDefault();

		let downloadFn = (content: string) : void => {
			const file: string = filename;
			if (downloadLink.current != null) {
				downloadLink.current.setAttribute("download", `${file}.json`);
				downloadLink.current.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
				downloadLink.current.click();
			}

			setFilename("");
		};
	
		if (props.onSaveFile != undefined) {
			props.onSaveFile(downloadFn);
		}
	};

	// load simulation
	const openFileInput = useRef<HTMLInputElement>(null);
	const onLoadButtonClick = () => {
		if (openFileInput.current != null) {
			openFileInput.current.click();
		}
	};

	const onSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
		if (openFileInput.current != null) {
			let files = openFileInput.current.files;
			if (files != undefined && files.length > 0) {
				console.log("loading file")
				
				files[0].text().then(content => {
					console.log(content)
					if (props.onOpenFile != undefined) {
						props.onOpenFile(content);
					}
				}).catch(error => {
					console.error(error)
				});

				openFileInput.current.value = "";
			}
		}
	};
	
	return (
		<>
			<div 
				data-tut="control_bar_overview"
				className="control-bar">
				<div className="container">
					<button
						data-tut="control_bar_reset" 
						onClick={() => (props.reset == undefined) ? null : props.reset()}
						className="control-button">
						<BsArrowCounterclockwise />
					</button>

					<button 
						data-tut="control_bar_previous_step"
						onClick={() => (props.previous == undefined) ? null : props.previous()}
						disabled={!props.hasPrevious && true}
						className="control-button">
						<GiPreviousButton />
					</button>

					<button 
						data-tut="control_bar_stop"
						onClick={() => (props.stop == undefined) ? null : props.stop()}
						className="control-button">
						<BsFillStopFill />
					</button>

					{(props.running != undefined && props.running) ?
						<button 
							data-tut="control_bar_play"
							onClick={() => (props.pause == undefined) ? null : props.pause()}
							className="control-button">
							<GiPauseButton />
						</button>
						:
						<button 
							data-tut="control_bar_play"
							disabled={!props.hasNext}
							onClick={() => (props.start == undefined) ? null : props.start()}
							className="control-button">
							<BsPlayFill />
						</button>
					}
					<button 
						data-tut="control_bar_next_step"
						onClick={() => (props.next == undefined) ? null : props.next()}
						disabled={!props.hasNext && true}
						className="control-button">
						<GiNextButton />
					</button>

					<FormControl 
						data-tut="control_bar_speed"
						className="mt-sm-1"
						value={speed}
						step={STEP_SPEED}
						min={MIN_SPEED}
						max={MAX_SPEED}
						onChange={(e) => setSpeed(parseInt(e.target.value))}
						type="range"/>

					<div
						data-tut="storage" 
						className="float-right">
						<button 
							onClick={() => setSaveModalVisible(true)}
							className="control-button">
							<MdSave />
						</button>

						<button 
							onClick={onLoadButtonClick}
							className="control-button">
							<GiOpenFolder />
						</button>

						<input 
							ref={openFileInput}
							onChange={onSelectFile}
							hidden
							accept="*.json"
							type="file" />
					</div>
				</div>
			</div>
			
			<Modal 
				onHide={() => setSaveModalVisible(false)}
				show={isSaveModalVisible}>
				<Modal.Header closeButton>
					Guardar simulación
				</Modal.Header>

				<Modal.Body>
					<form onSubmit={onSaveFileSubmit}>
						<label>Nombre del archivo</label>

						<FormControl 
							value={filename}
							onChange={(e) => setFilename(e.target.value)}
							pattern="[A-Za-z0-9_\-]+"
							required
							type="text" />
						
						<small>El nombre del archivo solo puede contener carácteres alfanuméricos.</small>

						<button 
							className="btn btn-primary float-right mt-2">
							Guardar
						</button>
					</form>

					<a ref={downloadLink}></a>
				</Modal.Body>
			</Modal>
		</>
	);
}

export default SimulatorControl;
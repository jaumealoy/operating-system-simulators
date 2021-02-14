import React from "react";

import { GiNextButton, GiPreviousButton, GiOpenFolder, GiPauseButton } from "react-icons/gi";
import { BsFillStopFill, BsPlayFill, BsArrowCounterclockwise } from "react-icons/bs";
import { MdSave } from "react-icons/md";
import { FaFileUpload } from "react-icons/fa";

import { FormControl } from "react-bootstrap";

interface SimulatorControlProps {
	hasPrevious?: boolean;
	hasNext?: boolean;
	running?: boolean;
	reset?: () => void;
	stop?: () => void;
	start?: () => void;
	next?: () => void;
	previous?: () => void
};

function SimulatorControl(props: SimulatorControlProps) {
	return (
		<div className="control-bar">
			<div className="container">
				<button 
					onClick={() => (props.reset == undefined) ? null : props.reset()}
					className="control-button">
					<BsArrowCounterclockwise />
				</button>

				<button 
					onClick={() => (props.previous == undefined) ? null : props.previous()}
					disabled={!props.hasPrevious && true}
					className="control-button">
					<GiPreviousButton />
				</button>

				<button 
					onClick={() => (props.stop == undefined) ? null : props.stop()}
					className="control-button">
					<BsFillStopFill />
				</button>

				{(props.running != undefined && props.running) ?
					<button 
						onClick={() => (props.start == undefined) ? null : props.start()}
						className="control-button">
						<GiPauseButton />
					</button>
					:
					<button 
						onClick={() => (props.start == undefined) ? null : props.start()}
						className="control-button">
						<BsPlayFill />
					</button>
				}
				<button 
					onClick={() => (props.next == undefined) ? null : props.next()}
					disabled={!props.hasNext && true}
					className="control-button">
					<GiNextButton />
				</button>

				<FormControl 
					className="mt-sm-1"
					type="range"/>

				<div className="float-right">
					<button className="control-button">
						<MdSave />
					</button>

					<button className="control-button">
						<GiOpenFolder />
					</button>
				</div>
			</div>
		</div>
	);
}

export default SimulatorControl;
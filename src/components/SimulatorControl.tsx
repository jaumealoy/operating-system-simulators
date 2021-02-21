import React, { useEffect, useState } from "react";

import { GiNextButton, GiPreviousButton, GiOpenFolder, GiPauseButton } from "react-icons/gi";
import { BsFillStopFill, BsPlayFill, BsArrowCounterclockwise } from "react-icons/bs";
import { MdSave } from "react-icons/md";
import { FaFileUpload } from "react-icons/fa";

import { FormControl } from "react-bootstrap";

import useInterval from "./../helpers/useInterval";

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

	return (
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
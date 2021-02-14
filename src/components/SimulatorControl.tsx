import React from "react";

import { GiNextButton, GiPreviousButton, GiOpenFolder } from "react-icons/gi";
import { BsFillStopFill } from "react-icons/bs";
import { MdSave } from "react-icons/md";
import { FaFileUpload } from "react-icons/fa";

interface SimulatorControlProps {
	next?: Function;
};

function SimulatorControl(props: SimulatorControlProps) {
	return (
		<div className="control-bar">
			<div className="container">
				
				<button 
					disabled
					className="control-button">
					<GiPreviousButton />
				</button>

				<button className="control-button">
					<BsFillStopFill />
				</button>

				<button 
					onClick={() => (props.next == undefined) ? null : props.next()}
					className="control-button">
					<GiNextButton />
				</button>

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
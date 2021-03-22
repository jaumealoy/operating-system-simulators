import React from "react";
import { FormCheck } from "react-bootstrap";

interface CycleDistributionProps {
    cycles: boolean[];
    editable: boolean;
    currentCycle?: number;
    onSelectCycle?: (index: number, value: boolean) => void;
	disabled?: boolean;
};

function CycleDistribution(props: CycleDistributionProps) {
	let fn = props.onSelectCycle || (() => {});
	let current = props.currentCycle || 0;
	let disabled: boolean = props.disabled || false;
	
    return (
        <div className="my-input-group mt-1">
			<div className="my-input-group-col">
				<div className="my-input-group-cell fake-cell header">
					&nbsp;
				</div>

				<div className="my-input-group-cell header">
					CPU
				</div>

				<div className="my-input-group-cell header">
					IO
				</div>
			</div>

			{props.cycles.map((value, index) =>
				<div className="my-input-group-col" key={`cycle_${index}`}>
					<div className="my-input-group-cell">
						{index + 1}
					</div>


					{props.editable ?
						<>
							<div className="my-input-group-cell">
								<FormCheck
									disabled={disabled}
									onChange={() => fn(index, false)}
									checked={!value}
									name={`cycle[${index}]`}
									type="radio" />
							</div>

							<div className="my-input-group-cell">
								<FormCheck
									disabled={disabled}
									onChange={() => fn(index, true)}
									checked={value}
									name={`cycle[${index}]`}
									type="radio" />
							</div>
						</>
						:
						<>
							<div className={"my-input-group-cell" 
								+ (!props.cycles[index] && current > index ? " bg-success" : "") 
								+ (!props.cycles[index] && props.currentCycle == index ? " current" : "")}>
								&nbsp;
							</div>

							<div className={"my-input-group-cell" 
								+ (props.cycles[index] && current > index ? " bg-success" : "") 
								+ (props.cycles[index] && props.currentCycle == index ? " current" : "")}>
								&nbsp;
							</div>
						</>
					}
					
				</div>
			)}
		</div>
    );
}

export default CycleDistribution;
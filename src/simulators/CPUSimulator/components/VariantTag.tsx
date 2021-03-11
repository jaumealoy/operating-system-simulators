import React from "react";
import AlgorithmSettings from "./AlgorithmSettings";
import { FiDelete } from "react-icons/fi";

interface VariantTagProps {
    algorithm: string;
    settings: AlgorithmSettings;
	deletable?: boolean;
	onDelete?: () => void;
};

function VariantTag(props: VariantTagProps) {
	let deletable: boolean = props.deletable || false;
	let deleteCallback = props.onDelete || (() => {});

    return (
        <span className="badge bg-success mr-1">
            {props.algorithm == "rr" && `q=${props.settings.quantum}`}
			{props.algorithm == "feedback" &&
				<>
					q=
					{props.settings.quantumMode ? 
						<>2<sup>i</sup></> : props.settings.quantum}
					, 
					{props.settings.maxQueues == 0 ?
						"ilimitadas"
						:
						`${props.settings.maxQueues} colas`
					}
				</>
			}

			{deletable &&
				<FiDelete
					onClick={deleteCallback}
					className="pointer ml-sm-1" />
			}
        </span>
    );
}

export default VariantTag;
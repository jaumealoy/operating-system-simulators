import React from "react";
import AlgorithmSettings from "./AlgorithmSettings";
import { FiDelete } from "react-icons/fi";
import { useTranslation } from "react-i18next";

interface VariantTagProps {
    algorithm: string;
    settings: AlgorithmSettings;
	deletable?: boolean;
	onDelete?: () => void;
};

function VariantTag(props: VariantTagProps) {
	const { t } = useTranslation();

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
						t("cpu.variant_tag.unlimited_queues")
						:
						t("cpu.variant_tag.value_max_queues", { value: props.settings.maxQueues })
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
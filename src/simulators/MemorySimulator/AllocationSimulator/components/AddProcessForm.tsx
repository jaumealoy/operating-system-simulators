import React, { useState, FormEvent } from "react";
import { FormGroup, FormControl, Row, Col } from "react-bootstrap";
import { Process } from "../MemorySimulator";
import { useTranslation } from "react-i18next";

interface AddProcessFormProps {
    onAddProcess: (process: Process) => void; 
	disabled?: boolean;
};

function AddProcessForm(props: AddProcessFormProps) {
	const { t } = useTranslation();

    const [name, setName] = useState<string>("");
    const [duration, setDuration] = useState<string>("");
    const [memory, setMemory] = useState<string>("");
    const [arrival, setArrival] = useState<string>("");

    const formHandler = (e: FormEvent) => {
        e.preventDefault();

        let process: Process = {
            id: name,
            duration: parseInt(duration),
            arrival: parseInt(arrival),
            size: parseInt(memory)
        };

        props.onAddProcess(process);

        // clear form
        setName("");
        setDuration("");
        setMemory("");
        setArrival("");
    };

	let disabled: boolean = props.disabled || false;

    return (
        <form onSubmit={formHandler}>
            <Row>
		    	<Col md={6}>
		    		<FormGroup>
		    			<label>{t("cpu.name")}</label>
		    			<FormControl
                            value={name}
                            onChange={(e) => setName(e.target.value)}
		    				type="text"
                            required
							disabled={disabled} />
		    		</FormGroup>
		    	</Col>
		    	
		    	<Col md={6}>
		    		<FormGroup>
		    			<label>{t("memory.allocation.duration")}</label>
		    			<FormControl
                            onChange={(e) => setDuration(e.target.value)}
                            value={duration}
		    				type="number"
                            required
							disabled={disabled} />
		    		</FormGroup>
		    	</Col>
		    </Row>

		    <Row>
		    	<Col md={6}>
		    		<FormGroup>
		    			<label>{t("memory.allocation.memory")}</label>
		    			<FormControl 
		    				type="number"
		    				min={1}
		    				value={memory}
		    				onChange={(e) => setMemory(e.target.value)}
                            required
							disabled={disabled} />
		    		</FormGroup>
		    	</Col>
		    
		    	<Col md={6}>
		    		<FormGroup>
		    			<label>{t("cpu.arrival")}</label>
		    			<FormControl 
		    				type="number"
		    				min={0}
		    				value={arrival}
		    				onChange={(e) => setArrival(e.target.value)}
                            required
							disabled={disabled} />
		    		</FormGroup>
		    	</Col>
		    </Row>

		    <button className="btn btn-primary mt-2">
		    	{t("io.add_request")}
		    </button>
        </form>
    );
}

export default AddProcessForm;
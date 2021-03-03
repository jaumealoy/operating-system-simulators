import { useState, FormEvent, useEffect, useRef } from "react";
import { Process } from "./CPUSimulator";

const DEFAULT_NAMES: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const useCPUSimulator = () => {
    // simulator manager
    const manager = useRef(null);

    // process list
    const [processes, setProcesses] = useState<Process[]>([]);
   
    const addProcess = (arrival: number, cycles: boolean[], estimatedDuration: number) : void => {
        let process: Process = {
            arrival,
            cycles,
            estimatedDuration
        };

        setProcesses((processes) => [...processes, process]);
    };

    const removeProcess = (index: number) : void => {
        if (index >= 0 && index < processes.length) {
            let tmp: Process[] = [...processes];
            tmp.splice(index, 1);
            setProcesses(tmp);
        }
    };

    // add process form
    const [name, setName] = useState<string>("");
    const [estimatedDuration, setEstimatedDuration] = useState<string>("");
    const [duration, setDuration] = useState<string>("5");
    const [cycleDistribution, setCycleDistribution] = useState<boolean[]>([]);
    const [arrival, setArrival] = useState<string>("");

    const selectCycleType = (index: number, value: boolean) : void => {
        if (index < cycleDistribution.length) {
            let distribution = [...cycleDistribution];
            distribution[index] = value;
            setCycleDistribution(distribution);
        }
    };

    useEffect(() => {
        let distribution = [];
        let p_duration: number = parseInt(duration);
        for (let i = 0; i < p_duration; i++) {
            if (i < cycleDistribution.length) {
                distribution.push(cycleDistribution[i]);
            } else {
                distribution.push(false);
            }
        }
        setCycleDistribution(distribution);
    }, [duration]);


    const onSubmit = (e: FormEvent) => {
        e.preventDefault();

        // adding the process to the list
        addProcess(
            parseInt(arrival),
            cycleDistribution,
            parseInt(estimatedDuration)
        );
    };

    return {
        name, estimatedDuration, duration, cycleDistribution, arrival,
        setName, setEstimatedDuration, setDuration, setArrival, selectCycleType,
        onSubmit,
        processes
    };
};

export default useCPUSimulator;
import { useState, FormEvent, useEffect, useRef } from "react";
import { CPUSimulator, Process, ProcessSnapshot, ProcessWrap } from "./CPUSimulator";

const DEFAULT_NAMES: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const useCPUSimulator = () => {
    // simulator manager
    const manager = useRef(null);

    const simulator = useRef(new CPUSimulator());

    // process list
    const [processes, setProcesses] = useState<Process[]>([]);
   
    const addProcess = (id: string, arrival: number, cycles: boolean[], estimatedDuration: number) : void => {
        let process: Process = {
            id,
            arrival,
            cycles,
            estimatedDuration
        };

        simulator.current.addProcess(process);

        setProcesses((processes) => [...processes, process]);
    };


    const loadProcessesFromList = (list: Process[]) => {
        list.map(process => addProcess(process.id, process.arrival, process.cycles, process.estimatedDuration));
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
            name,
            parseInt(arrival),
            cycleDistribution,
            parseInt(estimatedDuration)
        );
    };


    // TODO:
    const [events, setEvents] = useState<ProcessSnapshot[][]>([]);
    const [queues, setQueues] = useState<{[key:string]: ProcessWrap[]}>({
        incoming: [], ready: [], blocked: []
    });

    simulator.current.onQueueChange = (q) => {
        setQueues({...q});
    };


    // simulator controls
    const hasNextStep = () : boolean => simulator.current.hasNextStep();
    const next = () => {
        setEvents([...events, simulator.current.processNextRequest()])
    };

    return {
        name, estimatedDuration, duration, cycleDistribution, arrival,
        setName, setEstimatedDuration, setDuration, setArrival, selectCycleType,
        onSubmit,
        loadProcessesFromList,
        processes,
        next,
        hasNextStep,
        queues, events
    };
};

export default useCPUSimulator;
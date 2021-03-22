import { useEffect, useState } from "react";

interface StepAction {
	// action executed when a certain step is reached
	onReach?: ()=> void;
	onBeforeReach?: () => void;

	// action executed once a certain step has been completed
	onFinish?: () => void;
}

const useTutorial = (simulator: string, maxSteps: number, actions?: {[key: number]: StepAction}) => {
	// indicates whether the page tour is visible or not
	const [visible, setVisible] = useState<boolean>(false);

	// current step
	const [step, setStep] = useState<number>(0);

	useEffect(() => {
		// is the first time visiting this simulatior?
		let data = localStorage.getItem("tutorials");
		if (data == null) {
			// we haven't seen any tutorial before
			setVisible(true);
		} else {
			let tutorials: string[] = JSON.parse(data);
			if (tutorials.indexOf(simulator) < 0) {
				// we haven't seen this tutorial before
				setVisible(true);
			}
		}
	}, []);

	const close = () => {
		// mark the tutorial as seen
		let data = localStorage.getItem("tutorials");
		if (data == null) {
			localStorage.setItem("tutorials", JSON.stringify([simulator]));
		} else {
			let tutorials: string[] = JSON.parse(data);
			tutorials.push(simulator);
			localStorage.setItem("tutorials", JSON.stringify(tutorials));
		}

		// next time the tutorial is opened it will start from the beginning
		setStep(1);

		// and hide it
		setVisible(false);
	};

	const show = () => {
		// show the tutorial
		setVisible(true);
	};

	const nextStep = () => {
		if (step == (maxSteps - 1)) {
			return;
		}

		// fire callback functions
		let previousStep: number = step;
		if (actions && (previousStep in actions)) {
			let fn = actions[previousStep].onFinish;
			if (fn != undefined) {
				fn();
			}
		}

		let nextStep: number = step + 1;
		if (actions && (nextStep in actions)) {
			let fn = actions[nextStep].onBeforeReach;
			if (fn != undefined) {
				fn();
			}
		}

		setStep(nextStep);
	};

	const prevStep = () => {
		if (step <= 0) return;

		// fire callback functions
		let previousStep: number = step + 1;
		if (actions && (previousStep in actions)) {
			let fn = actions[previousStep].onFinish;
			if (fn != undefined) {
				fn();
			}
		}

		let nextStep: number = step - 1;
		if (actions && (nextStep in actions)) {
			let fn = actions[nextStep].onBeforeReach;
			if (fn != undefined) {
				fn();
			}
		}

		setStep(nextStep);
	};

	const onOpen = () => {
		setStep(0);
	};

	useEffect(() => {
		if (actions && (step in actions)) {
			let fn = actions[step].onReach;
			if (fn != undefined) {
				fn();
			}
		}
	}, [step])

	return {
		visible, step, prevStep, nextStep, onOpen,
		close, show
	};
};

export default useTutorial;
export type { StepAction };
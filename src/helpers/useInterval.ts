import { useEffect } from "react";

const useInterval = (callback: Function, delta: number) => {
	useEffect(() => {
		// setting up new interval on delta or callback change
		const interval = setInterval(callback, delta);

		// clean-up function, we must remove the previous interval
		return () => {
			clearInterval(interval)
		};
	}, [callback, delta]);
};

export default useInterval;
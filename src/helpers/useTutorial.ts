import { useEffect, useState } from "react";

const useTutorial = (simulator: string) => {
    // indicates whether the page tour is visible or not
    const [visible, setVisible] = useState<boolean>(false);

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

        // and hide it
        setVisible(false);
    };

    const show = () => {
        // show the tutorial
        setVisible(true);
    };

    return {
        visible,
        close, show
    };
};

export default useTutorial;
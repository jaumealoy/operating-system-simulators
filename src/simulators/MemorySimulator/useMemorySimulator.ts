import { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router";

const useMemorySimulator = () => {
    const location = useLocation();
    const history = useHistory();

    // selected views
    const [selectedView, setSelectedView] = useState("allocation");
    const [isSimpleView, setSimpleView] = useState<boolean>(true);

    useEffect(() => {
        if (location.hash.match("allocation")) {
            setSelectedView("allocation");
        } else if (location.hash.match("pagination")) {
            setSelectedView("pagination");
        }
    }, []);

    useEffect(() => {
        if (selectedView == "allocation") {
            history.push({ hash: "allocation" });
        } else if (selectedView == "pagination") {
            history.push({ hash: "pagination" });
        }
    }, [selectedView]);

    return {
        selectedView, setSelectedView,
        isSimpleView, setSimpleView
    };
};

export default useMemorySimulator;
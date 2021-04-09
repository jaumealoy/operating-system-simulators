import React from "react";
import SimulatorControl from "../../../components/SimulatorControl";

interface PaginationPageProps {
    simpleView: boolean;
}

function PaginationPage(props: PaginationPageProps) {
    return (
        <>
            <SimulatorControl />
        </>
    );
}

export default PaginationPage;
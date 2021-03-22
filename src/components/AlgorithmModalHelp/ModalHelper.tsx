import React, { forwardRef, RefAttributes, Ref, useImperativeHandle, useState, RefForwardingComponent, ForwardedRef } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import useModalHelper from "./useModalHelper";

interface Props {

}

interface Handles {
    show: (simulator: string, algorithm: string) => void;
    close: () => void;
}

const component = (props: Props, ref: ForwardedRef<Handles>) => {
    return (
        <Modal show={true}>

        </Modal>
    );
};

const ModelHelper = forwardRef<Handles, Props>(component);

/*const ModelHelper = forwardRef<ModelHelperComponent, ModalHelperProps>((props, ref) => {
    const [isVisible, setVisible] = useState<boolean>(false);
    const [simulator, setSimulator] = useState<string>("");
    const [algorithm, setAlgorithm] = useState<string>("");
    
    useImperativeHandle(ref, () => ({
        show: (simulator: string, algorithm: string) => {
            setVisible(true);
            setSimulator(simulator);
            setAlgorithm(algorithm);
        },

        close: () => {
            setVisible(false);
        }
    }));

    return (
        
    );
});*/

export default ModelHelper;
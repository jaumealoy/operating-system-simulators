import { useState } from "react";

const useModalHelper = () => {
    const [isVisible, setModalVisible] = useState<boolean>(false);
    return { isVisible, setModalVisible };
};

export default useModalHelper;
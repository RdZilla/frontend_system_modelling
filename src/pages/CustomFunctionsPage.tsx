import React, {useEffect} from 'react';
import Navbar from '../components/common/Navbar.tsx';
import CustomFunctions from "../components/user_functions/CustomFunctions.tsx";

const CustomFunctionsPage: React.FC = () => {
    useEffect(() => {
        document.title = 'Функции';
    }, []);
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <CustomFunctions />
        </div>
    );
};

export default CustomFunctionsPage;

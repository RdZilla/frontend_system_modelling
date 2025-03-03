import React, {useEffect} from 'react';
import Navbar from '../components/common/Navbar.tsx';
import CreateExperimentPage from "../components/experiments/CreateExperimentPage.tsx";

const CreateExperiment: React.FC = () => {
    useEffect(() => {
        document.title = 'Создание эксперимента';
    }, []);
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <CreateExperimentPage />
        </div>
    );
};

export default CreateExperiment;

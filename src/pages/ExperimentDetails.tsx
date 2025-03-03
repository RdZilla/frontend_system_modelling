import React, {useEffect} from 'react';
import Navbar from '../components/common/Navbar.tsx';
import ExperimentDetailsPage from "../components/experiments/ExperimentDetailsPage.tsx";

const ExperimentDetails: React.FC = () => {
    useEffect(() => {
        document.title = 'Эксперимент';
    }, []);
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <ExperimentDetailsPage />
        </div>
    );
};

export default ExperimentDetails;

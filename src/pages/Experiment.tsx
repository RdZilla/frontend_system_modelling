import React, {useEffect} from 'react';
import Navbar from '../components/common/Navbar.tsx';
import ExperimentsList from "../components/experiments/ExperimentsList.tsx";

const Experiment: React.FC = () => {
    useEffect(() => {
        document.title = 'Эксперименты';
    }, []);
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <ExperimentsList />
        </div>
    );
};

export default Experiment;

import React, {useEffect} from 'react';
import Navbar from '../components/common/Navbar.tsx';
import Dashboard from '../components/home/Dashboard.tsx';

const Home: React.FC = () => {
    useEffect(() => {
        document.title = 'Дашборд';
    }, []);



    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Dashboard />
        </div>
    );
};

export default Home;

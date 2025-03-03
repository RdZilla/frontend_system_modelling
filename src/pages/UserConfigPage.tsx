import React, { useEffect } from 'react';
import Navbar from '../components/common/Navbar.tsx';
import UserConfigs from "../components/user_configs/UserConfigs.tsx";

const UserConfigPage: React.FC = () => {
    useEffect(() => {
        document.title = 'Конфигурации';
    }, []);
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <UserConfigs />
            </div>
    );
};

export default UserConfigPage;

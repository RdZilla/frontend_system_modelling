import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.tsx'; // Импортируем Navbar

const Layout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />  {/* Добавляем Navbar */}
            <main className="flex-1">
        <Outlet /> {/* Здесь будет рендериться контент страниц */}
        </main>
        </div>
);
};

export default Layout;

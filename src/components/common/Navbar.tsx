import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import DropdownMenu from './DropdownMenu.tsx';
import { getFullName, getAvatarUrl } from '../../utils/tokenStorage.ts';

const Navbar: React.FC = () => {
    const avatarUrl = getAvatarUrl();
    const fullName = getFullName(); // Получаем имя и фамилию из хранилища

    return (
        <nav className="bg-white shadow-md p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-500">
                    <Home className="w-6 h-6" /> {/* Иконка домика */}
                </Link>

                <Link to="/experiment" className="text-gray-700 hover:text-blue-500">
                    Эксперименты
                </Link>
                <Link to="/configuration" className="text-gray-700 hover:text-blue-500">
                    Пользовательские конфигурации
                </Link>
                <Link to="/function" className="text-gray-700 hover:text-blue-500">
                    Пользовательские функции
                </Link>
                <Link to="/" className="text-gray-700 hover:text-blue-500">
                    Справка
                </Link>
            </div>
            <div className="flex items-center space-x-4">
                <span className="text-gray-700">{fullName}</span>
                <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-10 h-10 rounded-full cursor-pointer"
                />
                <DropdownMenu />
            </div>
        </nav>
    );
};

export default Navbar;

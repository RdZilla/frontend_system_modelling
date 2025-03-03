import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { clearTokens } from '../../utils/tokenStorage.ts';
import 'font-awesome/css/font-awesome.min.css'

const DropdownMenu: React.FC = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleToggle = () => {
        setOpen((prev) => !prev);
    };

    const handleLogout = () => {
        clearTokens();
        navigate('/login');
    };

    return (
        <div className="relative">
            <button onClick={handleToggle} className="flex items-center">
                <span className="mr-2">Действия</span>
                <i className={`fa ${open ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
                    <ul>
                        <li
                            onClick={handleLogout}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                        >Выйти
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DropdownMenu;

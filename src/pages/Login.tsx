import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { saveTokens } from '../utils/tokenStorage';

const API_URL = import.meta.env.VITE_API_URL;

const Login: React.FC = () => {
    useEffect(() => {
        document.title = 'Авторизация';
    }, []);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                username,
                password,
            });
            const { access, refresh, first_name, last_name, avatar_url } = response.data;
            saveTokens(access, refresh, first_name, last_name, avatar_url);
            navigate('/dashboard');
        } catch (err) {
            setError('Неверные данные для входа');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
                <h2 className="text-2xl mb-4">Вход</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <input
                    type="text"
                    placeholder="Логин"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="border w-full mb-4 p-2 rounded"
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border w-full mb-4 p-2 rounded"
                />
                <button type="submit" className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600">
                    Войти
                </button>

                <div className="mt-4 text-center">
                    <p>
                        Нет аккаунта?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="text-blue-500 hover:text-blue-700"
                        >
                            Регистрация
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Login;

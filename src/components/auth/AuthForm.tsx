import React, { useState } from 'react';
import { login } from '../../api/authApi.ts';
import { saveTokens } from '../../utils/tokenStorage.ts';
import { useNavigate } from 'react-router-dom';

const AuthForm: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { access, refresh } = await login(username, password);
            saveTokens(access, refresh);
            navigate('/dashboard');  // Перенаправление после успешного входа
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto p-4 bg-white rounded shadow-md space-y-4">
            <h2 className="text-2xl font-bold text-center">Вход</h2>
            {error && <p className="text-red-500">{error}</p>}
            <input
                type="text"
                placeholder="Логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border rounded"
                required
            />
            <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                required
            />
            <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Войти
            </button>
        </form>
    );
};

export default AuthForm;

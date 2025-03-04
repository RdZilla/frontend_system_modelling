import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (username: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { username, password });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.detail || 'Ошибка авторизации');
    }
};

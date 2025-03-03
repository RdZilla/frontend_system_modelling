import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export const login = async (username: string, password: string) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, { username, password });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.detail || 'Ошибка авторизации');
    }
};

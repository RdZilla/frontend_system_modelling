import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Создаём экземпляр axios
const axiosInstance = axios.create({
    baseURL: `${API_URL}`, // Базовый URL API
    timeout: 10000, // Таймаут для запросов (по желанию)
});

// Функция для обновления access токена с использованием refresh токена
const refreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh: refreshToken,
        });

        // Сохраняем новый access токен
        const newAccessToken = response.data.access;
        localStorage.setItem('accessToken', newAccessToken);
        return newAccessToken;
    } catch (error) {
        throw error;
    }
};

// Перехватчик запроса для добавления токена
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Перехватчик ответа для обновления токена в случае его истечения
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Если ошибка авторизации (401) и запрос ещё не был повторён
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Обновляем токен
                const newAccessToken = await refreshToken();

                // Повторяем исходный запрос с новым токеном
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
                // Если не удалось обновить токен, перенаправляем на страницу входа
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;

import axiosInstance from "../components/auth/axiosInstance.ts";

const API_URL = import.meta.env.VITE_API_URL;


export const fetchModelTranslations = async (): Promise<Record<string, string>> => {
    try {
        const response = await axiosInstance.get(`${API_URL}/task_module/translations`);
        const data: Record<string, string> = response.data;

        // Преобразование полученных данных в нужный формат
        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, String(value)])
        );
    } catch (error: any) {
        const errorMessage = `Ошибка при загрузке переводов: ${error.response?.data?.detail}` || 'Ошибка при загрузке переводов.';
        throw new Error(errorMessage);
    }
};

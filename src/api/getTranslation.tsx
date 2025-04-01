const API_URL = import.meta.env.VITE_API_URL;


export const fetchModelTranslations = async (): Promise<Record<string, string>> => {
    try {
        const response = await fetch(`${API_URL}/task_module/translations`);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.status}`);
        }
        const data: Record<string, string> = await response.json();

        // Преобразование полученных данных в нужный формат
        return Object.fromEntries(
            Object.entries(data).map(([key, value]) => [key, String(value)])
        );
    } catch (error) {
        throw error;
    }
};

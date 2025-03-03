import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from "../auth/axiosInstance.ts";

interface TaskConfig {
    algorithm: string;
    generations: number;
    mutation_rate: number;
    crossover_rate: number;
    population_size: number;
    fitness_function: string;
}

interface Task {
    id: number;
    status: string;
    created_at: string;
    updated_at: string;
    config: {
        id: number;
        name: string;
        config: TaskConfig;
        created_at: string;
        updated_at: string;
        user: number;
    };
}

interface Experiment {
    id: number;
    name: string;
    status: string;
    created_at: string;
    updated_at: string;
    tasks: Task[];
}

const ExperimentDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [experiment, setExperiment] = useState<Experiment | null>(null);
    const [newName, setNewName] = useState<string>('');  // Для редактирования имени эксперимента
    const [isEditing, setIsEditing] = useState<boolean>(false);  // Для контроля режима редактирования
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExperimentDetails = async () => {
            try {
                const response = await axiosInstance.get<Experiment>(
                    `http://localhost:8000/api/v1/task_module/experiment/${id}`
                );
                setExperiment(response.data);
                setNewName(response.data.name);  // Изначально имя будет из данных
            } catch (error) {
                console.error('Error fetching experiment details:', error);
            }
        };

        fetchExperimentDetails();
    }, [id]);

    const startTask = async (taskId: number) => {
        try {
            await axiosInstance.get(
                `http://localhost:8000/api/v1/task_module/task/${taskId}/start`
            );
            setNotification({ message: 'Задача успешно запущена!', type: 'success' });
            setExperiment(prev => prev ? {
                ...prev,
                tasks: prev.tasks.map(task =>
                    task.id === taskId ? { ...task, status: 'started' } : task
                )
            } : prev);  // Обновляем статус задачи
        } catch (error: any) {
            console.error('Error starting task:', error);
            const errorMessage = `Не удалось запустить задачу: ${error.response?.data?.detail}` || 'Не удалось запустить задачу.';
            setNotification({ message: errorMessage, type: 'error' });
        }
    };

    const stopTask = async (taskId: number) => {
        try {
            await axiosInstance.get(
                `http://localhost:8000/api/v1/task_module/task/${taskId}/stop`
            );
            setNotification({ message: 'Задача успешно остановлена!', type: 'success' });
            setExperiment(prev => prev ? {
                ...prev,
                tasks: prev.tasks.map(task =>
                    task.id === taskId ? { ...task, status: 'stopped' } : task
                )
            } : prev);  // Обновляем статус задачи
        } catch (error: any) {
            console.error('Error stopping task:', error);
            const errorMessage = `Не удалось остановить задачу: ${error.response?.data?.detail}` || 'Не удалось остановить задачу.';
            setNotification({ message: errorMessage, type: 'error' });
        }
    };

    const updateExperimentName = async () => {
        if (!newName) {
            setNotification({ message: 'Имя не может быть пустым.', type: 'error' });
            return;
        }
        try {
            await axiosInstance.patch(
                `http://localhost:8000/api/v1/task_module/experiment/${id}`,
                { name: newName }
            );
            setExperiment(prev => prev ? { ...prev, name: newName } : prev);  // Обновляем имя в текущем состоянии
            setIsEditing(false);  // Выход из режима редактирования
            setNotification({ message: 'Имя эксперимента успешно обновлено!', type: 'success' });
        } catch (error: any) {
            console.error('Error updating experiment name:', error);
            const errorMessage = `Не удалось обновить имя эксперимента: ${error.response?.data?.detail}` || 'Не удалось обновить имя эксперимента.';
            setNotification({ message: errorMessage, type: 'error' });
        }
    };

    const deleteExperiment = async () => {
        try {
            await axiosInstance.delete(
                `http://localhost:8000/api/v1/task_module/experiment/${id}`
            );
            setNotification({ message: 'Эксперимент успешно удален!', type: 'success' });
            navigate('/experiment');  // Перенаправляем на страницу со списком экспериментов
        } catch (error: any) {
            console.error('Error deleting experiment:', error);
            const errorMessage = `Не удалось удалить эксперимент: ${error.response?.data?.detail}` || 'Не удалось удалить эксперимент.';
            setNotification({ message: errorMessage, type: 'error' });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'created':
                return 'bg-gray-300';
            case 'started':
                return 'bg-green-500';
            case 'finished':
                return 'bg-blue-500';
            case 'stopped':
                return 'bg-red-500';
            case 'error':
                return 'bg-orange-500';
            default:
                return 'bg-gray-300';
        }
    };

    if (!experiment) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{experiment.name}</h1>
            <p className="text-lg mb-2">Статус: {experiment.status}</p>
            <p className="text-gray-500">Создан: {new Date(experiment.created_at).toLocaleString()}</p>
            <p className="text-gray-400">Обновлен: {new Date(experiment.updated_at).toLocaleString()}</p>

            {/* Уведомление */}
            {notification && (
                <div
                    className={`fixed top-4 right-4 p-4 rounded-lg text-white ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                    role="alert"
                >
                    {notification.message}
                </div>
            )}

            {/* Кнопки управления экспериментом */}
            <div className="mt-4">
                <button
                    onClick={startTask}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-4"
                >
                    Запустить эксперимент
                </button>

                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 mr-4"
                >
                    {isEditing ? 'Отменить' : 'Изменить имя эксперимента'}
                </button>

                <button
                    onClick={deleteExperiment}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                >
                    Удалить эксперимент
                </button>
            </div>

            {/* Режим редактирования имени */}
            {isEditing && (
                <div className="mt-4">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border p-2 rounded mr-2"
                    />
                    <button
                        onClick={updateExperimentName}
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Сохранить
                    </button>
                </div>
            )}

            <div className="mt-4">
                <h3 className="text-xl font-semibold">Задачи</h3>
                <ul className="space-y-2">
                    {experiment.tasks.map((task) => (
                        <li key={task.id} className="border p-2 rounded-lg">
                            <h4 className="font-semibold">Задача ID: {task.id}</h4>
                            <p className={`text-white ${getStatusColor(task.status)} p-2 inline-block rounded`}>
                                {task.status}
                            </p>
                            <pre className="bg-gray-100 p-2 rounded">
                                {JSON.stringify(task.config.config, null, 2)}
                            </pre>

                            {/* Кнопки для задач */}
                            {task.status === 'created' || task.status === 'stopped' || task.status === 'error' ? (
                                <button
                                    onClick={() => startTask(task.id)}
                                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                                >
                                    Запустить задачу
                                </button>
                            ) : null}

                            {task.status === 'started' ? (
                                <button
                                    onClick={() => stopTask(task.id)}
                                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                                >
                                    Остановить задачу
                                </button>
                            ) : null}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ExperimentDetailsPage;

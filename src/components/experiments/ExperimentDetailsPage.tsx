import React, {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import axiosInstance from "../auth/axiosInstance.ts";

const API_URL = import.meta.env.VITE_API_URL;

interface TaskConfig {
    algorithm: string;
    num_workers: number;
    chrom_length: number;
    mutation_rate: number;
    crossover_rate: number;
    selection_rate: number;
    max_generations: number;
    population_size: number;
    fitness_function: string;
    mutation_function: string;
    crossover_function: string;
    selection_function: string;
    termination_function: string;
    initialize_population_function: string;
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
    const {id} = useParams<{ id: string }>();
    const [experiment, setExperiment] = useState<Experiment | null>(null);
    const [newName, setNewName] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });

        // Автоматическое скрытие уведомления через 5 секунд
        setTimeout(() => {
            setNotification(null);
        }, 5000);
    };

    const navigate = useNavigate();

    useEffect(() => {
        const fetchExperimentDetails = async () => {
            try {
                const response = await axiosInstance.get<Experiment>(
                    `${API_URL}/task_module/experiment/${id}`
                );
                setExperiment(response.data);
                setNewName(response.data.name);
            } catch (error) {
                console.error('Error fetching experiment details:', error);
            }
        };

        fetchExperimentDetails();
    }, [id]);

    const startTask = async (taskId: number) => {
        try {
            await axiosInstance.get(
                `${API_URL}/task_module/task/${taskId}/start`
            );
            showNotification('Задача успешно запущена!', 'success');
            setExperiment(prev => prev ? {
                ...prev,
                tasks: prev.tasks.map(task =>
                    task.id === taskId ? {...task, status: 'started'} : task
                )
            } : prev);
        } catch (error: any) {
            console.error('Error starting task:', error);
            const errorMessage = `Не удалось запустить задачу: ${error.response?.data?.detail}` || 'Не удалось запустить задачу.';
            showNotification(errorMessage, "error")
        }
    };

    const stopTask = async (taskId: number) => {
        try {
            await axiosInstance.get(
                `${API_URL}/task_module/task/${taskId}/stop`
            );
            showNotification('Задача успешно остановлена!', 'success');
            setExperiment(prev => prev ? {
                ...prev,
                tasks: prev.tasks.map(task =>
                    task.id === taskId ? {...task, status: 'stopped'} : task
                )
            } : prev);
        } catch (error: any) {
            console.error('Error stopping task:', error);
            const errorMessage = `Не удалось остановить задачу: ${error.response?.data?.detail}` || 'Не удалось остановить задачу.';
            showNotification(errorMessage, "error")
        }
    };

    const updateExperimentName = async () => {
        if (!newName) {
            showNotification("Имя не может быть пустым", "error")
            return;
        }
        try {
            await axiosInstance.patch(
                `${API_URL}/task_module/experiment/${id}`,
                {name: newName}
            );
            setExperiment(prev => prev ? {...prev, name: newName} : prev);
            setIsEditing(false);
            showNotification('Имя эксперимента успешно обновлено!', 'success');
        } catch (error: any) {
            console.error('Error updating experiment name:', error);
            const errorMessage = `Не удалось обновить имя эксперимента: ${error.response?.data?.detail}` || 'Не удалось обновить имя эксперимента.';
            showNotification(errorMessage, "error")
        }
    };

    const deleteExperiment = async () => {
        try {
            await axiosInstance.delete(
                `${API_URL}/task_module/experiment/${id}`
            );
            showNotification('Эксперимент успешно удален!', 'success');
            navigate('/experiment');
        } catch (error: any) {
            console.error('Error deleting experiment:', error);
            const errorMessage = `Не удалось удалить эксперимент: ${error.response?.data?.detail}` || 'Не удалось удалить эксперимент.';
            showNotification(errorMessage, "error")
        }
    };

    const goBack = async () => {
        navigate('/experiment')
    }

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
            <p className={`text-white ${getStatusColor(experiment.status)} p-2 inline-block rounded`}>Статус: {experiment.status}</p>
            <p className="text-gray-500">Создан: {new Date(experiment.created_at).toLocaleString()}</p>
            <p className="text-gray-400">Обновлен: {new Date(experiment.updated_at).toLocaleString()}</p>

            {notification && (
                <div
                    className={`fixed top-4 right-4 p-4 rounded-lg text-white flex items-center justify-between shadow-lg transition-opacity duration-300 ${
                        notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    role="alert"
                >
                    <span>{notification.message}</span>
                    <button
                        className="ml-4 text-white hover:text-black"
                        onClick={() => setNotification(null)}  // Закрыть уведомление по клику
                    >
                        ✖
                    </button>
                </div>
            )}

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
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600 mr-4"
                >
                    Удалить эксперимент
                </button>

                <button
                    onClick={goBack}
                    className="p-2 rounded bg-gray-500 hover:bg-gray-600 text-white"
                >
                    Назад
                </button>
            </div>

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
                <div className="grid grid-cols-2 gap-4">
                    {experiment.tasks.map((task) => (
                        <div key={task.id} className="border p-4 rounded-lg shadow-lg">
                            <h4 className="font-semibold">Задача ID: {task.id}</h4>
                            <p className={`text-white ${getStatusColor(task.status)} p-2 inline-block rounded`}>{task.status}</p>

                            <div className="mt-5">
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(task.config.config).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="font-semibold">{key.replace('_', ' ').toUpperCase()}</span>
                                            <span>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-5">
                                {task.status === 'created' || task.status === 'stopped' || task.status === 'error' ? (
                                    <button
                                        onClick={() => startTask(task.id)}
                                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-4"
                                    >
                                        Запустить задачу
                                    </button>
                                ) : null}
                            </div>

                            <div className="mt-5">
                                {task.status === 'started' ? (
                                    <button
                                        onClick={() => stopTask(task.id)}
                                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                                    >
                                        Остановить задачу
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExperimentDetailsPage;

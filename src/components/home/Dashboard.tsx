import React, {useEffect, useState} from 'react';
import axiosInstance from "../auth/axiosInstance.ts";
import {Link} from "react-router-dom";
import {fetchModelTranslations} from "../../api/getTranslation.tsx";

const API_URL = import.meta.env.VITE_API_URL;

interface TaskConfig {
    algorithm: string;
    num_workers: number;
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

    [key: string]: any;
}

interface Task {
    id: number;
    experiment_id: number;
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

interface PaginatedResponseExperiment {
    links: {
        next: string | null;
        previous: string | null;
    };
    total: number;
    page: number;
    page_size: number;
    results: Experiment[];
}

interface PaginatedResponseTask {
    links: {
        next: string | null;
        previous: string | null;
    };
    total: number;
    page: number;
    page_size: number;
    results: Task[];
}

interface PaginatedResponseConfig {
    links: {
        next: string | null;
        previous: string | null;
    };
    total: number;
    page: number;
    page_size: number;
    results: TaskConfig[];
}


const Dashboard: React.FC = () => {
    const [modelTranslations, setModelTranslations] = useState<Record<string, string>>({});
    useEffect(() => {
        fetchModelTranslations()
            .then(translations => setModelTranslations(translations));
    }, []);
    const translate = (key: string) => modelTranslations[key] || key.replace(/_/g, ' ').toUpperCase();

    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({message, type});

        // Автоматическое скрытие уведомления через 5 секунд
        setTimeout(() => {
            setNotification(null);
        }, 5000);
    };

    // const [pagination, setPagination] = useState({
    //     page: 1,
    //     page_size: 10,
    //     total: 0,
    //     next: null,
    //     previous: null,
    // });

    const [experiments, setExperiments] = useState<Experiment[]>([]);
    const [startedTasks, setStartedTasks] = useState<Task[]>([]);
    const [configs, setConfigs] = useState<TaskConfig[]>([]);

    const fetchExperiments = async (page: number, page_size: number) => {
        try {
            const params: { [key: string]: any } = {
                page,
                page_size,
            };

            const response = await axiosInstance.get<PaginatedResponseExperiment>(
                `${API_URL}/task_module/experiment`,
                {params}
            );

            setExperiments(response.data.results);
            // setPagination({
            //     page: response.data.page,
            //     page_size: response.data.page_size,
            //     total: response.data.total,
            //     // @ts-ignore
            //     next: response.data.links.next,
            //     // @ts-ignore
            //     previous: response.data.links.previous,
            // });
        } catch (error: any) {
            console.error('Error fetching experiments:', error);
            const errorMessage = `Ошибка при загрузке: ${error.response?.data?.detail}` || 'Ошибка при загрузке.';
            showNotification(errorMessage, "error")
        }
    };

    const fetchStartedTask = async (page: number, page_size: number) => {
        try {
            const params: { [key: string]: any } = {
                page,
                page_size
            };

            const response = await axiosInstance.get<PaginatedResponseTask>(
                `${API_URL}/task_module/started_task`,
                {params}
            );

            setStartedTasks(response.data.results);
            // setPagination({
            //     page: response.data.page,
            //     page_size: response.data.page_size,
            //     total: response.data.total,
            //     // @ts-ignore
            //     next: response.data.links.next,
            //     // @ts-ignore
            //     previous: response.data.links.previous,
            // });
        } catch (error: any) {
            console.error('Error fetching started tasks:', error);
            const errorMessage = `Ошибка при загрузке: ${error.response?.data?.detail}` || 'Ошибка при загрузке.';
            showNotification(errorMessage, "error")
        }
    };

    const fetchTaskConfig = async (page: number, page_size: number) => {
        try {
            const params: { [key: string]: any } = {
                page,
                page_size
            };

            const response = await axiosInstance.get<PaginatedResponseConfig>(
                `${API_URL}/task_module/task_config`,
                {params}
            );

            setConfigs(response.data.results);
            // setPagination({
            //     page: response.data.page,
            //     page_size: response.data.page_size,
            //     total: response.data.total,
            //     // @ts-ignore
            //     next: response.data.links.next,
            //     // @ts-ignore
            //     previous: response.data.links.previous,
            // });
        } catch (error: any) {
            console.error('Error fetching started task cofigs:', error);
            const errorMessage = `Ошибка при загрузке: ${error.response?.data?.detail}` || 'Ошибка при загрузке.';
            showNotification(errorMessage, "error")
        }
    };

    useEffect(() => {
        fetchExperiments(1, 4);
        fetchStartedTask(1, 9);
        fetchTaskConfig(1, 4);
    }, []);

    return (
        <div className="p-4 grid grid-cols-3 gap-4">
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
            <div className="col-span-2 space-y-4 ">
                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-xl font-bold mb-2">Эксперименты</h2>
                    <div className="space-y-4">
                        {experiments.map((experiment) => (
                            <div key={experiment.id} className="border p-4 rounded-lg shadow-md">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <h2 className="text-xl font-semibold">{experiment.id} / {experiment.name}</h2>
                                    </div>
                                    <div className="flex space-x-4">
                                        <Link
                                            to={`/experiment/${experiment.id}`}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Перейти к карточке
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end mt-5 pr-4">
                        <Link
                            to={"/experiment"}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Перейти в реестр экспериментов
                        </Link>
                    </div>
                </div>
                <div className="bg-white shadow rounded p-4">
                    <h2 className="text-xl font-bold mb-2">Пользовательские конфигурации</h2>
                    <div className="space-y-4">
                        {configs.map((config) => (
                            <div key={config.id} className="border p-4 rounded-lg shadow-md">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <h2 className="text-xl font-semibold">{config.id} / {config.name}</h2>
                                    </div>
                                    <div className="flex space-x-4">
                                        <Link
                                            to={`/configuration/${config.id}`}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Перейти к карточке
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end mt-5 pr-4">
                        <Link
                            to={"/configuration"}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Перейти в реестр конфигураций
                        </Link>
                    </div>
                </div>
            </div>
            <div className="bg-white shadow rounded p-4">
                <h2 className="text-xl font-bold mb-2">Запущенные задачи</h2>
                <div className="space-y-4">
                    {startedTasks.map((task) => (
                        <div key={task.id} className="border p-4 rounded-lg shadow-md">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    <h2 className="text-xl font-semibold">{task.id} / {translate(task.status)}</h2>
                                </div>
                                <div className="flex space-x-4">
                                    <Link
                                        to={`/experiment/${task.experiment_id}`}
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Перейти к карточке эксперимента
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-5 pr-4">
                    <Link
                        to={"/experiment"}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Перейти в реестр экспериментов
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

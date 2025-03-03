import React, { useState, useEffect } from 'react';
import axiosInstance from "../auth/axiosInstance.ts";
import { Link } from "react-router-dom";

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

interface PaginatedResponse {
    links: {
        next: string | null;
        previous: string | null;
    };
    total: number;
    page: number;
    page_size: number;
    results: Experiment[];
}

const ExperimentsList: React.FC = () => {
    const [experiments, setExperiments] = useState<Experiment[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 10,
        total: 0,
        next: null,
        previous: null,
    });

    const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
    const [expandedExperiments, setExpandedExperiments] = useState<Set<number>>(new Set()); // Set для отслеживания развернутых экспериментов

    const fetchExperiments = async (page: number, page_size: number) => {
        try {
            const params: { [key: string]: any } = {};

            if (page_size > 0) {
                params.page = page;
                params.page_size = page_size;
            }

            const response = await axiosInstance.get<PaginatedResponse>(
                `http://localhost:8000/api/v1/task_module/experiment`,
                { params }
            );

            setExperiments(response.data.results);
            setPagination({
                page: response.data.page,
                page_size: response.data.page_size,
                total: response.data.total,
                next: response.data.links.next,
                previous: response.data.links.previous,
            });
        } catch (error) {
            console.error('Error fetching experiments:', error);
        }
    };

    useEffect(() => {
        fetchExperiments(pagination.page, pagination.page_size);
    }, [pagination.page, pagination.page_size]);

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPageSize = parseInt(event.target.value, 10);
        setPagination((prev) => ({
            ...prev,
            page_size: newPageSize,
            page: 1,  // Сбрасываем на первую страницу при изменении размера страницы
        }));
    };

    const handlePageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const page = parseInt(event.target.value, 10);
        if (page >= 1 && page <= Math.ceil(pagination.total / pagination.page_size)) {
            setPagination((prev) => ({ ...prev, page }));
        }
    };

    const toggleTaskExpansion = (taskId: number) => {
        setExpandedTasks((prev) => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(taskId)) {
                newExpanded.delete(taskId);
            } else {
                newExpanded.add(taskId);
            }
            return newExpanded;
        });
    };

    const toggleExperimentExpansion = (experimentId: number) => {
        setExpandedExperiments((prev) => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(experimentId)) {
                newExpanded.delete(experimentId);
            } else {
                newExpanded.add(experimentId);
            }
            return newExpanded;
        });
    };

    const totalPages = Math.ceil(pagination.total / pagination.page_size);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Список Экспериментов</h1>
            <div className="mb-4">
                <Link
                    to="/create-experiment"
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Создать новый эксперимент
                </Link>
            </div>
            <div className="space-y-4">
                {experiments.map((experiment) => (
                    <div key={experiment.id} className="border p-4 rounded-lg shadow-md">
                        {/* Заголовок эксперимента с кнопкой развертывания */}
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold">{experiment.name}</h2>
                            {/* Кнопка перехода в карточку эксперимента */}
                            <Link
                                to={`/experiment/${experiment.id}`}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Перейти к карточке
                            </Link>
                            <button
                                onClick={() => toggleExperimentExpansion(experiment.id)}
                                className="text-blue-500"
                            >
                                {expandedExperiments.has(experiment.id) ? '▲' : '▼'}
                            </button>
                        </div>

                        {/* Развернутый эксперимент с основной информацией */}
                        {expandedExperiments.has(experiment.id) && (
                            <div className="mt-2">
                                <p className="text-gray-500">Статус: {experiment.status}</p>
                                <p className="text-gray-400">Создан: {new Date(experiment.created_at).toLocaleString()}</p>
                            </div>
                        )}

                        {/* Задачи с кнопкой развертывания */}
                        {expandedExperiments.has(experiment.id) && (
                            <div className="mt-2">
                                <h3 className="text-lg font-semibold">Задачи:</h3>
                                <ul className="space-y-2">
                                    {experiment.tasks.map((task) => (
                                        <li key={task.id} className="border p-2 rounded-lg">
                                            <div className="flex justify-between">
                                                <span>Задача ID: {task.id}</span>
                                                <span className="text-gray-500">{task.status}</span>
                                                <button
                                                    onClick={() => toggleTaskExpansion(task.id)}
                                                    className="text-blue-500"
                                                >
                                                    {expandedTasks.has(task.id) ? '▲' : '▼'}
                                                </button>
                                            </div>

                                            {/* Если задача развернута, показываем конфигурацию */}
                                            {expandedTasks.has(task.id) && (
                                                <div className="mt-2">
                                                    <h4 className="text-lg font-semibold">Конфигурация задачи:</h4>
                                                    <pre className="bg-gray-100 p-2 rounded">
                                                        {JSON.stringify(task.config.config, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                    <label htmlFor="page-size" className="mr-2">Количество элементов на странице:</label>
                    <select
                        id="page-size"
                        value={pagination.page_size}
                        onChange={handlePageSizeChange}
                        className="border p-2 rounded"
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>

                    <span className="ml-4 text-gray-600">Всего записей: {pagination.total}</span>
                </div>

                <div className="flex items-center space-x-4">
                    <span>Страница:</span>
                    <input
                        type="number"
                        value={pagination.page}
                        onChange={handlePageChange}
                        min={1}
                        max={totalPages}
                        className="border p-2 rounded w-20"
                    />
                    <span>из {totalPages}</span>

                    <button
                        onClick={() => setPagination((prev) => ({...prev, page: prev.page - 1}))}
                        disabled={pagination.page <= 1}
                        className="btn btn-primary"
                    >
                        Назад
                    </button>
                    <button
                        onClick={() => setPagination((prev) => ({...prev, page: prev.page + 1}))}
                        disabled={pagination.page >= totalPages}
                        className="btn btn-primary"
                    >
                        Далее
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExperimentsList;

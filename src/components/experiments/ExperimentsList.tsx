import React, {useState, useEffect} from 'react';
import axiosInstance from "../auth/axiosInstance.ts";
import {Link} from "react-router-dom";

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
    const statusTranslations: Record<string, string> = {
        created: 'Создан',
        updated: 'Обновлён',
        started: 'Запущен',
        finished: 'Завершён',
        stopped: 'Остановлен',
        error: 'Ошибка'
    };

    const [experiments, setExperiments] = useState<Experiment[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        page_size: 10,
        total: 0,
        next: null,
        previous: null,
    });

    const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set());
    const [expandedExperiments, setExpandedExperiments] = useState<Set<number>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilters, setStatusFilters] = useState({
        experimentStatus: new Set<string>(),
        taskStatus: new Set<string>(),
    });
    const [dateFilters, setDateFilters] = useState({
        createdFrom: '',
        createdTo: '',
        updatedFrom: '',
        updatedTo: '',
    });
    const [configIds, setConfigIds] = useState<string>('');

    const [selectedExperiments, setSelectedExperiments] = useState<Set<number>>(new Set());
    const [isExpandedAll, setIsExpandedAll] = useState(false); // Флаг для отслеживания состояния (все ли развернуты)


    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({message, type});

        // Автоматическое скрытие уведомления через 5 секунд
        setTimeout(() => {
            setNotification(null);
        }, 5000);
    };

    const fetchExperiments = async (page: number, page_size: number, filters: any) => {
        try {
            const params: { [key: string]: any } = {
                page,
                page_size,
                ...filters,
            };

            const response = await axiosInstance.get<PaginatedResponse>(
                `${API_URL}/task_module/experiment`,
                {params}
            );

            setExperiments(response.data.results);
            setPagination({
                page: response.data.page,
                page_size: response.data.page_size,
                total: response.data.total,
                // @ts-ignore
                next: response.data.links.next,
                // @ts-ignore
                previous: response.data.links.previous,
            });
        } catch (error: any) {
            console.error('Error fetching experiments:', error);
            const errorMessage = `Ошибка при загрузке: ${error.response?.data?.detail}` || 'Ошибка при загрузке.';
            showNotification(errorMessage, "error")
        }
    };

    const filters = {
        search: searchQuery,
        experimentStatus: Array.from(statusFilters.experimentStatus),
        taskStatus: Array.from(statusFilters.taskStatus),
        createdFrom: dateFilters.createdFrom,
        createdTo: dateFilters.createdTo,
        updatedFrom: dateFilters.updatedFrom,
        updatedTo: dateFilters.updatedTo,
        configIds: configIds.split(',').map(id => id.trim()),
    };

    useEffect(() => {
        fetchExperiments(pagination.page, pagination.page_size, filters);
    }, [pagination.page, pagination.page_size, searchQuery]);

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
            setPagination((prev) => ({...prev, page}));
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

    const toggleSelectAllExperiments = () => {
        setSelectAll((prevSelectAll) => {
            const newSelectAll = !prevSelectAll;
            setSelectedExperiments(newSelectAll ? new Set(experiments.map(experiment => experiment.id)) : new Set());
            return newSelectAll;
        });
    };

    const toggleExperimentSelection = (experimentId: number) => {
        setSelectedExperiments((prev) => {
            const newSelected = new Set(prev);
            if (newSelected.has(experimentId)) {
                newSelected.delete(experimentId);
            } else {
                newSelected.add(experimentId);
            }
            return newSelected;
        });
    };

    const handleStatusChange = (filterType: 'experimentStatus' | 'taskStatus', status: string) => {
        setStatusFilters((prev) => {
            const updatedFilter = new Set(prev[filterType]);
            if (updatedFilter.has(status)) {
                updatedFilter.delete(status); // Удаляем статус, если он уже выбран
            } else {
                updatedFilter.add(status); // Добавляем статус, если его еще нет
            }
            return {...prev, [filterType]: updatedFilter};
        });
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleMultipleLaunch = async () => {
        try {
            const selectedIds = Array.from(selectedExperiments);
            const response = await axiosInstance.post(
                `${API_URL}/task_module/multiple_launch`,
                {experiment_ids: selectedIds}
            );
            console.log(response.data);
        } catch (error: any) {
            console.error('Error during multiple launch:', error);
            const errorMessage = `Ошибка при групповом запуске: ${error.response?.data?.detail}` || 'Ошибка при групповом запуске.';
            showNotification(errorMessage, 'error');
        }
    };

    const totalPages = Math.ceil(pagination.total / pagination.page_size);


    const handleResetFilters = () => {
        // Очистка текстового поиска
        setSearchQuery('');

        // Очистка чекбоксов статусов
        setStatusFilters({
            experimentStatus: new Set(),
            taskStatus: new Set(),
        });

        // Очистка дат
        setDateFilters({
            createdFrom: '',
            createdTo: '',
            updatedFrom: '',
            updatedTo: '',
        });

        // Очистка ID конфигурации
        setConfigIds('');

        // Выполнение запроса с очищенными фильтрами
        fetchExperiments(pagination.page, pagination.page_size, {});
    };

    const applyFilters = async () => {
        const filters = {
            search: searchQuery,
            experimentStatus: Array.from(statusFilters.experimentStatus),
            taskStatus: Array.from(statusFilters.taskStatus),
            createdFrom: dateFilters.createdFrom,
            createdTo: dateFilters.createdTo,
            updatedFrom: dateFilters.updatedFrom,
            updatedTo: dateFilters.updatedTo,
            configIds: configIds.split(',').map(id => id.trim()),
        };

        // Выполняем запрос с фильтрами
        fetchExperiments(pagination.page, pagination.page_size, filters);
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

    const toggleExpandCollapseAll = () => {
        if (isExpandedAll) {
            // Если все развернуты, сворачиваем их
            setExpandedExperiments(new Set());
            setExpandedTasks(new Set()); // Сворачиваем все задачи
        } else {
            // Если не все развернуты, разворачиваем все
            setExpandedExperiments(new Set(experiments.map(experiment => experiment.id)));

            // Разворачиваем все задачи, которые связаны с экспериментами
            const allTaskIds = experiments.flatMap(experiment => experiment.tasks.map(task => task.id));
            setExpandedTasks(new Set(allTaskIds)); // Разворачиваем все задачи
        }
        setIsExpandedAll(prevState => !prevState); // Переключаем флаг
    };

    const configTranslations: Record<string, string> = {
        algorithm: 'Алгоритм',
        num_islands: 'Количество островов',
        num_workers: 'Количество рабочих процессов',
        mutation_rate: 'Вероятность мутации',
        crossover_rate: 'Вероятность кроссинговера',
        fitness_kwargs: 'Параметры функции приспособленности',
        selection_rate: 'Вероятность отбора особей',
        migration_rate: 'Частота миграции',
        max_generations: 'Максимальное количество поколений',
        mutation_kwargs: 'Параметры мутации',
        population_size: 'Размер популяции',
        crossover_kwargs: 'Параметры кроссинговера',
        fitness_function: 'Функция приспособленности',
        selection_kwargs: 'Параметры селекции',
        mutation_function: 'Функция мутации',
        crossover_function: 'Функция кроссинговера',
        migration_interval: 'Интервал миграции',
        selection_function: 'Функция селекции',
        termination_kwargs: 'Параметры завершения',
        termination_function: 'Функция завершения',
        initialize_population_kwargs: 'Параметры инициализации популяции',
        initialize_population_function: 'Функция инициализации популяции',
        adaptation_function: 'Функция адаптации',
        adaptation_kwargs: 'Параметры адаптации',
    };

    const configOrder: string[] = [
        'algorithm',
        'population_size',

        'max_generations',
        'num_workers',

        'mutation_rate',
        'crossover_rate',

        'selection_rate',
        'migration_rate',

        'migration_interval',
        'num_islands',

        'adaptation_function',
        'adaptation_kwargs',

        'crossover_function',
        'crossover_kwargs',

        'fitness_function',
        'fitness_kwargs',

        'initialize_population_function',
        'initialize_population_kwargs',

        'mutation_function',
        'mutation_kwargs',


        'selection_function',
        'selection_kwargs',

        'termination_function',
        'termination_kwargs'
    ];

    const renderConfig = (config: any, prefix = '') => {
        const sortedEntries = Object.entries(config)
            .sort(([keyA], [keyB]) => {
                const indexA = configOrder.indexOf(keyA);
                const indexB = configOrder.indexOf(keyB);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });

        const normalParams = [];
        const functionParams = new Map();

        sortedEntries.forEach(([key, value]) => {
            if (key.endsWith('_function')) {
                functionParams.set(key, { function: value, kwargs: null });
            } else if (key.endsWith('_kwargs')) {
                const functionKey = key.replace('_kwargs', '_function');
                if (functionParams.has(functionKey)) {
                    functionParams.get(functionKey).kwargs = value;
                } else {
                    functionParams.set(functionKey, { function: null, kwargs: value });
                }
            } else {
                normalParams.push([key, value]);
            }
        });

        return (
            <>
                {/* Обычные параметры в две колонки */}
                <div className="grid grid-cols-2 gap-2 items-center pb-2 border-b-2 border-black">
                    {normalParams.map(([key, value]) => (
                        <div key={prefix + key} className="flex justify-between items-center border-b last:border-b-0 p-2 bg-gray-300 rounded-lg">
                            <span className="font-semibold ">{configTranslations[key] || key.replace(/_/g, ' ').toUpperCase()}:</span>
                            <span>{value as string}</span>
                        </div>
                    ))}
                </div>

                {/* Группировка функций и kwargs */}
                <div className="mt-2">
                    {Array.from(functionParams.entries()).map(([key, { function: func, kwargs }]) => (
                        <div key={key} className="grid grid-cols-2 gap-2 p-2 border-b last:border-b-0 mb-2 bg-gray-200 rounded-lg items-center">
                            <div className="flex justify-between bg-gray-300 rounded-lg items-center p-2 pr-2 h-full">
                                <span className="font-semibold">{configTranslations[key] || key.replace(/_/g, ' ').toUpperCase()}:</span>
                                <span>{func as string}</span>
                            </div>
                            {kwargs && (
                                <div className="bg-gray-300 rounded-lg items-center p-2 h-full">
                                    <span className="font-semibold">{configTranslations[key.replace('_function', '_kwargs')] || key.replace('_function', '_KWARGS').toUpperCase()}:</span>
                                    <div className="ml-1 grid grid-cols-2 gap-2 border-gray-300">
                                        {Object.entries(kwargs).map(([kwargKey, kwargValue]) => (
                                            <div key={kwargKey} className="flex justify-between bg-gray-400 rounded-lg p-1 items-center pr-2">
                                                <span className="font-semibold">{configTranslations[kwargKey] || kwargKey}:</span>
                                                <span>{kwargValue as string}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </>
        );
    };


    return (
        <div className="container mx-auto p-0">
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
            <div className="flex justify-between mb-4 mt-4">
                <div className="flex space-x-4">
                    <Link
                        to="/create-experiment"
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Создать новый эксперимент
                    </Link>
                    <button
                        onClick={handleMultipleLaunch}
                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                    >
                        Множественный запуск
                    </button>
                </div>
            </div>

            <div className="flex items-center space-x-2 w-full">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Поиск"
                    className="border p-2 rounded mb-2 mt-2 w-full"
                />
            </div>

            <div className="flex space-x-4">
                <div className="flex-1 ">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold mb-2">Список экспериментов</h1>

                        <button
                            onClick={toggleExpandCollapseAll}
                            className={`p-2 rounded mr-4 mt-2 ${
                                isExpandedAll ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
                            } text-white`}
                        >
                            {isExpandedAll ? 'Свернуть все' : 'Развернуть все'}
                        </button>
                    </div>
                    <div className="flex items-center mx-1 mb-2">
                        <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={toggleSelectAllExperiments}
                            className="mr-2"
                        />
                        <span>Выбрать все</span>
                    </div>
                    <div className="space-y-4">
                        {experiments.map((experiment) => (
                            <div key={experiment.id} className="border p-4 rounded-lg shadow-md">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedExperiments.has(experiment.id)}
                                            onChange={() => toggleExperimentSelection(experiment.id)}
                                        />
                                        <h2 className="text-xl font-semibold">{experiment.id} / {experiment.name}</h2>
                                    </div>
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() => toggleExperimentExpansion(experiment.id)}
                                            className="text-blue-500"
                                        >
                                            {expandedExperiments.has(experiment.id) ? '▲' : '▼'}
                                        </button>
                                        <Link
                                            to={`/experiment/${experiment.id}`}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                        >
                                            Перейти к карточке
                                        </Link>
                                    </div>
                                </div>

                                {expandedExperiments.has(experiment.id) && (
                                    <div className="mt-2">
                                        <p className={`text-white ${getStatusColor(experiment.status)} p-2 inline-block rounded`}>Статус: {statusTranslations[experiment.status]}</p>
                                        <p className="text-gray-400">Создан: {new Date(experiment.created_at).toLocaleString()}</p>
                                    </div>
                                )}

                                {expandedExperiments.has(experiment.id) && (
                                    <div className="mt-2">
                                        <h3 className="text-lg font-semibold">Задачи:</h3>
                                        <ul className="space-y-2">
                                            {experiment.tasks.map((task) => (
                                                <li key={task.id} className="border p-2 rounded-lg">
                                                    <div className="flex justify-between">
                                                        <span>Задача ID: {task.id}</span>
                                                        <span
                                                            className={`text-white ${getStatusColor(task.status)} p-2 inline-block rounded`}>{statusTranslations[task.status]}</span>
                                                        <button
                                                            onClick={() => toggleTaskExpansion(task.id)}
                                                            className="text-blue-500"
                                                        >
                                                            {expandedTasks.has(task.id) ? '▲' : '▼'}
                                                        </button>
                                                    </div>

                                                    {expandedTasks.has(task.id) && (
                                                        <div className="mt-2">
                                                            <h4 className="text-lg font-semibold mb-4">Конфигурация {task.config.id}: {task.config.name}</h4>
                                                            <div>
                                                                {renderConfig(task.config.config)}
                                                            </div>
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
                </div>

                <div className="w-1/4 ml-8">
                    <h2 className="text-xl font-semibold mt-4 mb-4 ml-4">Фильтры</h2>
                    <div className="space-y-4 ml-4">
                        <div>
                            <h3 className="font-semibold">Статус эксперимента</h3>
                            <div className="space-y-2">
                                {['created', 'updated', 'started', 'finished', 'stopped', 'error'].map(status => (
                                    <label key={status} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            value={status}
                                            checked={statusFilters.experimentStatus.has(status)}
                                            onChange={() => handleStatusChange('experimentStatus', status)}
                                            className="mr-2"
                                        />
                                        {statusTranslations[status]}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold">Дата создания</h3>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="w-6">от:</span>
                                    <input
                                        type="date"
                                        className="border p-2 rounded mb-2 w-full"
                                        value={dateFilters.createdFrom}
                                        onChange={(e) => setDateFilters({...dateFilters, createdFrom: e.target.value})}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-6">до:</span>
                                    <input
                                        type="date"
                                        className="border p-2 rounded w-full"
                                        value={dateFilters.createdTo}
                                        onChange={(e) => setDateFilters({...dateFilters, createdTo: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold">Дата обновления</h3>
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center space-x-2">
                                    <span className="w-6">от:</span>
                                    <input
                                        type="date"
                                        className="border p-2 rounded w-full"
                                        value={dateFilters.updatedFrom}
                                        onChange={(e) => setDateFilters({
                                            ...dateFilters,
                                            updatedFrom: e.target.value
                                        })}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="w-6">до:</span>
                                    <input
                                        type="date"
                                        className="border p-2 rounded w-full"
                                        value={dateFilters.updatedTo}
                                        onChange={(e) => setDateFilters({
                                            ...dateFilters,
                                            updatedTo: e.target.value
                                        })}
                                    />
                                </div>
                            </div>
                        </div>


                        <div>
                            <h3 className="font-semibold">Статус задачи</h3>
                            <div className="space-y-2">
                                {['created', 'started', 'finished', 'stopped', 'error'].map(status => (
                                    <label key={status} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            value={status}
                                            checked={statusFilters.taskStatus.has(status)}
                                            onChange={() => handleStatusChange('taskStatus', status)}
                                            className="mr-2"/>
                                        {statusTranslations[status]}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold">ID конфигурации</h3>
                            <input
                                type="text"
                                className="border p-2 rounded w-full"
                                placeholder="Введите ID конфигурации"
                                value={configIds}
                                onChange={(e) => setConfigIds(e.target.value)}
                            />
                        </div>

                        <button
                            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 w-full"
                            onClick={applyFilters}
                        >Применить
                        </button>
                        <button
                            onClick={handleResetFilters}
                            className="bg-red-500 text-white p-2 rounded hover:bg-red-600 w-full"
                        >
                            Сбросить фильтры
                        </button>
                    </div>
                </div>
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

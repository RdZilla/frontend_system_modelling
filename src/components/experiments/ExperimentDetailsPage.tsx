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

const ExperimentDetailsPage: React.FC = () => {
    const statusTranslations: Record<string, string> = {
        created: 'Создан',
        updated: 'Обновлён',
        started: 'Запущен',
        finished: 'Завершён',
        stopped: 'Остановлен',
        error: 'Ошибка'
    };
    const modelTranslations: Record<string, string> = {
        master_worker: 'Мастер воркер модель',
        island_model: 'Островная модель',
        asynchronous_model: 'Асинхронная модель',
    };

    const {id} = useParams<{ id: string }>();
    const [experiment, setExperiment] = useState<Experiment | null>(null);
    const [newName, setNewName] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({message, type});

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

    const startTask = async (experimentId: number, taskId: number) => {
        try {
            const params = {"start": true}

            await axiosInstance.get(
                `${API_URL}/task_module/experiment/${experimentId}/task/${taskId}`,
                {params}
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

    const startExperiment = async (experimentId: number) => {
        const params = {"start": true}

        try {
            await axiosInstance.get(
                `${API_URL}/task_module/experiment/${experimentId}`,
                {params}
            );
            showNotification('Эксперимент успешно запущен!', 'success');
        } catch (error: any) {
            console.error('Error starting experiment:', error);
            const errorMessage = `Не удалось запустить эксперимент: ${error.response?.data?.detail}` || 'Не удалось запустить эксперимент.';
            showNotification(errorMessage, "error")
        }
    };

    const stopExperiment = async (experimentId: number) => {
        const params = {"stop": true}

        try {
            await axiosInstance.get(
                `${API_URL}/task_module/experiment/${experimentId}`,
                {params}
            );
            showNotification('Эксперимент успешно остановлен!', 'success');
        } catch (error: any) {
            console.error('Error stopping experiment:', error);
            const errorMessage = `Не удалось остановить эксперимент: ${error.response?.data?.detail}` || 'Не удалось запустить эксперимент.';
            showNotification(errorMessage, "error")
        }
    }

    const stopTask = async (experimentId: number, taskId: number) => {
        try {

            const params = {"stop": true}

            await axiosInstance.get(
                `${API_URL}/task_module/experiment/${experimentId}/task/${taskId}`,
                {params}
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

    const exportTaskResult = async (experimentId: number, taskId: number, exportType: string) => {
        try {
            const queryParam = {
                "png_all": "all_workers_png",
                "png_final": "final_result_png",
                "csv_all": "csv_all_results",
                "csv_final": "csv_best_results",
                "json_all": "json_all_results",
                "json_final": "json_best_results",
                "pdf_all": "pdf_results"
            }[exportType];

            if (!queryParam) {
                console.error("Некорректный тип экспорта");
                showNotification("Ошибка: некорректный тип экспорта", "error");
                return;
            }

            const params = { [queryParam]: true };

            const response = await axiosInstance.get(
                `${API_URL}/task_module/experiment/${experimentId}/task/${taskId}/export_result`,
                { params, responseType: "blob" } // blob нужен для скачивания файлов
            );

            // Создание ссылки для скачивания файла
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;

            // Определение имени файла
            const fileExtension = exportType.includes("png") ? "png" :
                exportType.includes("csv") ? "csv" :
                    exportType.includes("json") ? "json" : "pdf";

            link.setAttribute("download", `experiment_${experimentId}_task_${taskId}.${fileExtension}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showNotification("Файл успешно выгружен!", "success");
        } catch (error: any) {
            console.error("Ошибка при экспорте:", error);
            const errorMessage = `Не удалось выгрузить результаты: ${error.response?.data?.detail}` || "Ошибка при экспорте.";
            showNotification(errorMessage, "error");
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

        const normalParams: [string, any][] = [];
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
                            <span>{modelTranslations[value as string] || value}</span>
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

    if (!experiment) {
        return <div>Загрузка...</div>;
    }

    const ExportButton = ({ experimentId, taskId }: { experimentId: number; taskId: number }) => {
        const [selectedOption, setSelectedOption] = useState("csv_all");

        const exportOptions = [
            { value: "png_all", label: "Выгрузить график всех результатов в PNG" },
            { value: "png_final", label: "Выгрузить график финального результата в PNG" },
            { value: "csv_all", label: "Выгрузить все результаты в CSV" },
            { value: "csv_final", label: "Выгрузить финальный результат в CSV" },
            { value: "json_all", label: "Выгрузить все результаты в JSON" },
            { value: "json_final", label: "Выгрузить финальный результат в JSON" },
            { value: "pdf_all", label: "Выгрузить все результаты в PDF" },
        ];

        const handleExport = () => {
            exportTaskResult(experimentId, taskId, selectedOption);
        };

        return (
            <div className="relative flex items-center">
                <select
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="border p-2 rounded bg-white text-gray-700 mr-2"
                >
                    {exportOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <button
                    onClick={handleExport}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Выгрузить
                </button>
            </div>
        );
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Название эксперимента: {experiment.name}</h1>
            <p className={`text-white ${getStatusColor(experiment.status)} p-2 inline-block rounded`}>Статус: {statusTranslations[experiment.status]}</p>
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
                {experiment.status === 'created' || experiment.status === 'stopped' || experiment.status === 'error' ? (
                    <button
                        onClick={() => startExperiment(experiment.id)}
                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-4"
                    >
                        Запустить эксперимент
                    </button>
                ) : null}
                {experiment.status === 'started' ? (
                    <button
                        onClick={() => stopExperiment(experiment.id)}
                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 mr-4"
                    >
                        Остановить эксперимент
                    </button>
                ) : null}

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
                            <p className={`text-white ${getStatusColor(task.status)} p-2 inline-block rounded`}>{statusTranslations[task.status]}</p>

                            <div className="mt-2">
                                <h4 className="text-lg font-semibold mb-4">Конфигурация {task.config.id}: {task.config.name}</h4>
                                <div>
                                    {renderConfig(task.config.config)}
                                </div>
                            </div>

                            <div className="mt-5">
                                {task.status === 'created' || task.status === 'stopped' || task.status === 'error' ? (
                                    <button
                                        onClick={() => startTask(experiment.id, task.id)}
                                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mr-4"
                                    >
                                        Запустить задачу
                                    </button>
                                ) : null}
                            </div>

                            <div className="mt-5">
                                {task.status === 'started' ? (
                                    <button
                                        onClick={() => stopTask(experiment.id, task.id)}
                                        className="bg-red-500 text-white p-2 rounded hover:bg-red-600 mr-4"
                                    >
                                        Остановить задачу
                                    </button>
                                ) : null}
                                {task.status === 'finished' ? (
                                    <ExportButton experimentId={experiment.id} taskId={task.id} />
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

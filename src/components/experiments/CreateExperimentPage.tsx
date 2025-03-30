import React, {useState, useEffect} from 'react';
import axiosInstance from "../auth/axiosInstance.ts";
import {useNavigate} from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const CreateExperimentPage: React.FC = () => {
    const configTranslations: Record<string, string> = {
        adaptation_kwargs: 'Параметры адаптации',
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
    };

    const [name, setName] = useState('');
    const [configs, setConfigs] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [options, setOptions] = useState<any>(null);
    const [algorithms, setAlgorithms] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [algorithmsResponse, functionsResponse] = await Promise.all([
                    axiosInstance.get(`${API_URL}/task_module/get_supported_algorithms`),
                    axiosInstance.get(`${API_URL}/task_module/math_function`)
                ]);
                setAlgorithms(algorithmsResponse.data);
                setOptions(functionsResponse.data);
            } catch (err) {
                console.error("Ошибка при загрузке данных:", err);
                setError('Ошибка при загрузке данных');
            }
        };
        fetchOptions();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (configs.some(config => !config.name.trim())) {
            setError('Название конфигурации должно быть заполнено для каждой конфигурации.');
            return;
        }
        try {
            const response = await axiosInstance.post(`${API_URL}/task_module/experiment`, {
                name,
                configs,
            });
            const experimentId = response.data.detail;
            navigate(`/experiment/${experimentId}`);
        } catch (error: any) {
            setError(`Ошибка при создании эксперимента: ${error.response?.data?.detail}` || 'Ошибка при создании эксперимента');
        }
    };

    const addConfig = () => {
        setConfigs([...configs, {name: '', config: {}}]);
    };
    const updateConfig = (index: number, field: string, value: any, param?: string) => {
        const updatedConfigs = [...configs];

        if (param) {
            // Обновляем параметр внутри *_kwargs
            const kwargsField = `${field.replace('_function', '_kwargs')}`;
            updatedConfigs[index].config[kwargsField] = {
                ...updatedConfigs[index].config[kwargsField],
                [param]: value
            };
            console.log(`Изменён параметр ${param} для ${field}:`, updatedConfigs[index].config[kwargsField]);
        } else {
            // Обновляем обычные поля и сбрасываем *_kwargs только при смене функции
            if (field.endsWith('_function') && updatedConfigs[index].config[field] !== value) {
                updatedConfigs[index].config[`${field.replace('_function', '_kwargs')}`] = {};  // Сброс параметров для новой функции
            }
            updatedConfigs[index].config[field] = value;
        }

        setConfigs(updatedConfigs);
    };

    const updateConfigName = (index: number, value: string) => {
        const updatedConfigs = [...configs];
        updatedConfigs[index].name = value;
        setConfigs(updatedConfigs);
    };

    const removeConfig = (index: number) => {
        setConfigs(configs.filter((_, i) => i !== index));
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Создание нового эксперимента</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Название эксперимента</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border p-2 rounded w-full"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {configs.map((config, index) => (
                        <div key={index} className="border p-4 rounded-lg relative">
                            <button
                                type="button"
                                onClick={() => removeConfig(index)}
                                className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-700 font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md transition-all"
                            >
                                ✕
                            </button>

                            <input
                                type="text"
                                placeholder="Название конфигурации"
                                value={config.name}
                                onChange={(e) => updateConfigName(index, e.target.value)}
                                className="border p-2 rounded w-full mb-4"
                            />
                            {algorithms && (
                                <div className="mb-4">
                                    <label className="block text-sm mb-1"> Алгоритм </label>
                                    <select
                                        className="border p-2 rounded w-full"
                                        value={config.config.algorithm || ''}
                                        onChange={(e) => updateConfig(index, 'algorithm', e.target.value)
                                        }
                                    >
                                        <option value=""> Выберите алгоритм</option>
                                        {
                                            Object.keys(algorithms).map((algorithm) => (
                                                <option key={algorithm}
                                                        value={algorithm}> {algorithm} </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            )}
                            {config.config.algorithm && algorithms[config.config.algorithm]
                                ?.filter((param: string) => ![
                                    'algorithm',
                                    'crossover_function',
                                    'initialize_population_function',
                                    'fitness_function',
                                    'mutation_function',
                                    'selection_function'
                                ].includes(param)).map((param: string) => (
                                    <div key={param} className="mb-4">
                                        <label className="block text-sm mb-1">{configTranslations[param] || param.replace(/_/g, ' ').toUpperCase()}</label>
                                        <input
                                            type="text"
                                            className="border p-2 rounded w-full"
                                            value={config.config[param] || ''}
                                            onChange={(e) => updateConfig(index, param, e.target.value)}
                                        />
                                    </div>
                                ))}

                            {[
                                {
                                    field: 'crossover_function',
                                    label: 'Функция кроссовера',
                                    options: Object.keys(options.crossover_functions)
                                },
                                {
                                    field: 'adaptation_function',
                                    label: 'Функция адаптации',
                                    options: Object.keys(options.adaptation_functions)
                                },
                                {
                                    field: 'fitness_function',
                                    label: 'Фитнес-функция',
                                    options: Object.keys(options.fitness_functions)
                                },
                                {
                                    field: 'initialize_population_function',
                                    label: 'Функция инициализации',
                                    options: Object.keys(options.initialize_population_functions)
                                },
                                {
                                    field: 'mutation_function',
                                    label: 'Функция мутации',
                                    options: Object.keys(options.mutation_functions)
                                },
                                {
                                    field: 'selection_function',
                                    label: 'Функция селекции',
                                    options: Object.keys(options.selection_functions)
                                },
                                {
                                    field: 'termination_function',
                                    label: 'Функция завершения',
                                    options: Object.keys(options.termination_functions)
                                },
                            ].map(({field, label, options: funcOptions}) => (
                                <div key={field} className="mb-4">
                                    <label className="block text-sm mb-1">{label}</label>
                                    <select
                                        className="border p-2 rounded w-full"
                                        value={config.config[field]}
                                        onChange={(e) => updateConfig(index, field, e.target.value)}
                                    >
                                        <option value="">Выберите {label.toLowerCase()}</option>
                                        {funcOptions.map((option: string) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>

                                    {field !== 'algorithm' && config.config[field] && (() => {
                                        // Получаем параметры для выбранной функции
                                        const functionType = field.replace('_function', '_functions');
                                        const selectedFunction = config.config[field];
                                        const params = options[functionType]?.[selectedFunction];

                                        console.log(`Параметры для ${selectedFunction}:`, params);  // Для отладки

                                        return params && params.length > 0 ? (
                                            <div className="mt-2">
                                                {params.map((param: string) => (
                                                    <div key={param} className="mb-2">
                                                        <label className="block text-sm mb-1">{param}</label>
                                                        <input
                                                            type="text"
                                                            className="border p-2 rounded w-full"
                                                            placeholder={param}
                                                            value={config.config[`${field.replace('_function', '_kwargs')}`]?.[param] || ''}  // Безопасное значение
                                                            onChange={(e) =>
                                                                updateConfig(index, field, e.target.value, param)  // Исправленный вызов
                                                            }
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : null;
                                    })()}
                                </div>
                            ))}
                        </div>
                    ))}

                    {configs.length < 4 && (
                        <div className="flex justify-center items-center">
                            <button
                                type="button"
                                onClick={addConfig}
                                className="border border-gray-400 rounded-full w-16 h-16 flex justify-center items-center text-3xl text-gray-600 bg-white hover:text-white hover:bg-black hover:border-black shadow-lg transition-all"
                            >
                                <span className="leading-none flex items-center justify-center">+</span>
                            </button>
                        </div>
                    )}
                </div>

                <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 mt-4">
                    Создать эксперимент
                </button>
            </form>
        </div>
    );
};

export default CreateExperimentPage;

import React, {useState, useEffect} from 'react';
import axiosInstance from "../auth/axiosInstance.ts";
import {useNavigate} from 'react-router-dom';
import {fetchModelTranslations} from "../../api/getTranslation.tsx";

const API_URL = import.meta.env.VITE_API_URL;

const CreateExperimentPage: React.FC = () => {
    const [name, setName] = useState('');
    const [configs, setConfigs] = useState<any[]>([]);
    const [options, setOptions] = useState<any>(null);
    const [algorithms, setAlgorithms] = useState<any>(null);
    const navigate = useNavigate();

    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({message, type});

        // Автоматическое скрытие уведомления через 5 секунд
        setTimeout(() => {
            setNotification(null);
        }, 5000);
    };

    const [modelTranslations, setModelTranslations] = useState<Record<string, string>>({});
    const [existingConfigs, setExistingConfigs] = useState<any[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [algorithmsResponse, functionsResponse] = await Promise.all([
                    axiosInstance.get(`${API_URL}/task_module/get_supported_algorithms`),
                    axiosInstance.get(`${API_URL}/task_module/math_function`)
                ]);
                setAlgorithms(algorithmsResponse.data);
                setOptions(functionsResponse.data);
            } catch (error: any) {
                showNotification(`Ошибка при загрузке данных ${error.response?.data?.detail}`, 'error');
            }
        };
        const fetchTranslate = async () => {
            try {
                fetchModelTranslations()
                    .then(translations => setModelTranslations(translations));
            } catch (error: any) {
                showNotification(`Ошибка при открытии эксперимента: ${error.response?.data?.detail}` || 'Ошибка при создании эксперимента', 'error');
                return {};
            }
        }
        const fetchExistingConfigs = async () => {
            try {
                const params: { [key: string]: any } = {
                    "page_size": 0,
                };

                const response = await axiosInstance.get(`${API_URL}/task_module/task_config`,
                    {params}
                );
                setExistingConfigs(response.data.results);
            } catch (error: any) {
                showNotification(`Ошибка при загрузке конфигураций: ${error.response?.data?.detail}`, 'error');
            }
        };

        fetchTranslate();
        fetchOptions();
        fetchExistingConfigs();
    }, []);

    const translate = (key: string) => modelTranslations[key] || key.replace(/_/g, ' ');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!name || !name.trim()) {
            showNotification("Название эксперимента должно быть заполнено", 'error');
            return;
        }

        if (configs.some(config => !config.name.trim())) {
            showNotification('Название конфигурации должно быть заполнено для каждой конфигурации', 'error');
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
            showNotification(`Ошибка при создании эксперимента: ${error.response?.data?.detail}` || 'Ошибка при создании эксперимента', 'error');
        }
    };

    const addConfig = () => {
        setConfigs([...configs, {name: '', config: {}}]);
    };
    const updateConfig = (index: number, field: string, value: any, param?: string) => {
        const updatedConfigs = [...configs];

        // Проверка, можно ли преобразовать в дробное число (запятую заменим на точку, но оставим как строку)
        const parsedValue = typeof value === "string" ? value.replace(',', '.') : value;
        const isFloatConvertible = !isNaN(parseFloat(parsedValue)) && isFinite(parsedValue as any);

        const finalValue = isFloatConvertible ? parsedValue : value;

        if (param) {
            const kwargsField = field.replace('_function', '_kwargs');
            updatedConfigs[index].config[kwargsField] = {
                ...updatedConfigs[index].config[kwargsField],
                [param]: finalValue
            };
        } else {
            if (field === "algorithm") {
                updatedConfigs[index].config = {};
            }

            if (field.endsWith('_function') && updatedConfigs[index].config[field] !== value) {
                const kwargsField = field.replace('_function', '_kwargs');
                updatedConfigs[index].config[kwargsField] = {}; // Сброс параметров для новой функции
            }

            updatedConfigs[index].config[field] = finalValue;
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
            {notification && (
                <div
                    className={`fixed top-4 right-4 p-4 rounded-lg text-white flex items-center justify-between shadow-lg transition-opacity duration-300 ${
                        notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    role="alert"
                >
                    <span>{notification.message}</span>
                    <button
                        className="ml-3 bg-red-500 hover:bg-red-800 font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md transition-all text-white"
                        onClick={() => setNotification(null)}  // Закрыть уведомление по клику
                    >
                        ✕
                    </button>
                </div>
            )}
            <h1 className="text-2xl font-bold mb-4">Создание нового эксперимента</h1>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Название эксперимента</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border p-2 rounded w-full"
                        placeholder="Введите название эксперимента"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Выберите существующую конфигурацию или создайте
                        новую</label>
                    <select
                        className="border p-2 rounded w-full"
                        onChange={(e) => {
                            const selectedConfig = existingConfigs.find(config => config.id.toString() === e.target.value);
                            if (selectedConfig) {
                                setConfigs([...configs, {name: selectedConfig.name, config: selectedConfig.config}]);
                            }
                        }}
                    >
                        <option value="">-- Выберите конфигурацию --</option>
                        {existingConfigs.map((config) => (
                            <option key={config.id} value={config.id}>{config.name}</option>
                        ))}
                    </select>

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
                                placeholder="Введите название конфигурации"
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
                                        <option value="">— — —</option>
                                        {
                                            Object.keys(algorithms).map((algorithm) => (
                                                <option key={algorithm}
                                                        value={algorithm}> {translate(algorithm)} </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            )}
                            {
                                config.config.algorithm && algorithms[config.config.algorithm]
                                ?.filter((param: string) => ![
                                    'algorithm',
                                    'crossover_function',
                                    'initialize_population_function',
                                    'fitness_function',
                                    'mutation_function',
                                    'selection_function'
                                ].includes(param)).map((param: string) => (
                                    <div key={param} className="mb-4">
                                        <label className="block text-sm mb-1">{translate(param)}</label>
                                        <input
                                            type="text"
                                            className="border p-2 rounded w-full"
                                            value={config.config[param] || ''}
                                            onChange={(e) => updateConfig(index, param, e.target.value)}
                                        />
                                    </div>
                                ))
                            }

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
                                        <option value="">— — —</option>
                                        {funcOptions.map((option: string) => (
                                            <option key={option} value={option}>{translate(option)}</option>
                                        ))}
                                    </select>

                                    {field !== 'algorithm' && config.config[field] && (() => {
                                        // Получаем параметры для выбранной функции
                                        const functionType = field.replace('_function', '_functions');
                                        const selectedFunction = config.config[field];
                                        const params = options[functionType]?.[selectedFunction];

                                        return params && params.length > 0 ? (
                                            <div className="mt-2">
                                                {params.map((param: string) => (
                                                    <div key={param} className="mb-2">
                                                        <label className="block text-sm mb-1">{translate(param)}</label>
                                                        <input
                                                            type="text"
                                                            className="border p-2 rounded w-full"
                                                            placeholder={translate(param)}
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

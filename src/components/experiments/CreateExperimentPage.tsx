import React, {useState, useEffect} from 'react';
import axiosInstance from "../auth/axiosInstance.ts";
import {useNavigate} from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const CreateExperimentPage: React.FC = () => {
    const [name, setName] = useState('');
    const [configs, setConfigs] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [options, setOptions] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await axiosInstance.get(`${API_URL}/task_module/math_function`);
                setOptions(response.data.detail);
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
        setConfigs([...configs, {
            name: '',
            config: {
                algorithm: '',
                population_size: 200,
                max_generations: 100,
                mutation_rate: 0.05,
                crossover_rate: 0.05,
                selection_rate: 0.9,
                num_workers: 1,
                crossover_function: '',
                adaptation_function: '',
                fitness_function: '',
                initialize_population_function: '',
                mutation_function: '',
                selection_function: '',
                termination_function: '',
                adaptation_kwargs: {},
                crossover_kwargs: {},
                fitness_kwargs: {},
                initialize_population_kwargs: {},
                mutation_kwargs: {},
                selection_kwargs: {},
                termination_kwargs: {}
            }
        }]);
    };


    const updateConfig = (index: number, field: string, value: any, param?: string) => {
        const updatedConfigs = [...configs];
        if (param) {
            // Обновляем параметр внутри *_kwargs
            updatedConfigs[index].config[field] = {
                ...updatedConfigs[index].config[field],
                [param]: value
            };
        } else {
            // Обновляем обычные поля или сбрасываем *_kwargs при смене функции
            updatedConfigs[index].config[field] = value;
            if (field.endsWith('_function')) {
                updatedConfigs[index].config[`${field.replace('_function', '_kwargs')}`] = {};
            }
        }
        setConfigs(updatedConfigs);
    };


    const updateConfigName = (index: number, value: string) => {
        const updatedConfigs = [...configs];
        updatedConfigs[index].name = value;
        setConfigs(updatedConfigs);
    };

    const updateConfigParams = (index: number, field: string, param: string, value: any) => {
        const updatedConfigs = [...configs];
        updatedConfigs[index].config[field][param] = value;
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
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
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

                            {options && (
                                <>
                                    {/* Выпадающие списки и их подписи */}
                                    {[
                                        {field: 'algorithm', label: 'Алгоритм', options: options.supported_models},
                                        {field: 'crossover_function', label: 'Функция кроссовера', options: Object.keys(options.crossover_functions)},
                                        {field: 'adaptation_function', label: 'Функция адаптации', options: Object.keys(options.adaptation_functions)},
                                        {field: 'fitness_function', label: 'Фитнес-функция', options: Object.keys(options.fitness_functions)},
                                        {field: 'initialize_population_function', label: 'Функция инициализации', options: Object.keys(options.initialize_population_functions)},
                                        {field: 'mutation_function', label: 'Функция мутации', options: Object.keys(options.mutation_functions)},
                                        {field: 'selection_function', label: 'Функция селекции', options: Object.keys(options.selection_functions)},
                                        {field: 'termination_function', label: 'Функция завершения', options: Object.keys(options.termination_functions)},
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

                                            {/* Поля для параметров выбранных функций */}
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
                                                                    type="number"
                                                                    className="border p-2 rounded w-full"
                                                                    placeholder={param}
                                                                    value={config.config[`${field.replace('_function', '_kwargs')}`]?.[param] || ''}
                                                                    onChange={(e) =>
                                                                        updateConfig(index, `${field.replace('_function', '_kwargs')}`, param, +e.target.value)
                                                                    }
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>
                                    ))}

                                    {/* Числовые поля под соответствующими выпадающими списками */}
                                    {[
                                        {field: 'population_size', label: 'Размер популяции'},
                                        {field: 'max_generations', label: 'Максимум поколений'},
                                        {field: 'mutation_rate', label: 'Шанс мутации', step: 0.01},
                                        {field: 'crossover_rate', label: 'Шанс кроссовера', step: 0.01},
                                        {field: 'selection_rate', label: 'Шанс отбора', step: 0.01},
                                        {field: 'num_workers', label: 'Кол-во воркеров'}
                                    ].map(({field, label, step = 1}) => (
                                        <div key={field} className="mb-4">
                                            <label className="block text-sm mb-1">{label}</label>
                                            <input
                                                type="number"
                                                step={step}
                                                className="border p-2 rounded w-full"
                                                placeholder={label}
                                                value={config.config[field]}
                                                onChange={(e) => updateConfig(index, field, +e.target.value)}
                                            />
                                        </div>
                                    ))}
                                </>
                            )}

                        </div>
                    ))}

                    {configs.length < 4 && (
                        <div className="flex justify-center items-center">
                            <button
                                type="button"
                                onClick={addConfig}
                                className="border border-gray-400 p-4 rounded-full w-16 h-16 flex justify-center items-center text-2xl text-gray-600 hover:text-black hover:border-black transition"
                            >
                                +
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

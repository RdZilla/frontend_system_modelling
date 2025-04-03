import React, {useEffect, useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { saveTokens } from '../utils/tokenStorage';

const API_URL = import.meta.env.VITE_API_URL;

const Register: React.FC = () => {
    const [step, setStep] = useState(1); // Состояние для отслеживания шага регистрации
    const [email, setEmail] = useState('');
    const [emailCode, setEmailCode] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [showTooltip, setShowTooltip] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [, setShowError] = useState(false);
    const [passwordValid, setPasswordValid] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
    });

    const [cooldown, setCooldown] = useState(0); // Время до повторной отправки

    // Таймер обратного отсчёта
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => {
                setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    // Валидация пароля
    const validatePassword = (pwd: string) => {
        const validation = {
            length: pwd.length >= 8,
            uppercase: /[A-Z]/.test(pwd),
            lowercase: /[a-z]/.test(pwd),
            number: /\d/.test(pwd),
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
        };
        setPasswordValid(validation);

        // Если пароль корректный, скрываем подсказку
        if (Object.values(validation).every(Boolean)) {
            setShowTooltip(false);
        }
    };

    const handleSendCode = async () => {
        try {
            setError("");
            const response = await axios.post(`${API_URL}/auth/send-code`, { email });
            const waitTime = response.data?.wait_time; // Ожидаем, что API отправит "wait_time" в секундах
            if (waitTime) {
                setCooldown(waitTime);
                return;
            }

            setStep(2); // Переход на второй шаг для ввода кода
            setError("");
        } catch (error: any) {
            const error_message = `${error.response?.data?.detail}` || "Ошибка при отправке кода. Попробуйте снова"
            setError(error_message);
            return;
        }
    };

    const validateForm = () => {
        setError("");
        const newErrors: Record<string, string> = {};

        if (!emailCode.trim()) newErrors.emailCode = "Введите код подтверждения";
        if (!firstName.trim()) newErrors.firstName = "Введите имя";
        if (!lastName.trim()) newErrors.lastName = "Введите фамилию";
        if (!username.trim()) newErrors.username = "Введите логин";
        if (!password.trim()) newErrors.password = "Введите пароль";
        if (!passwordConfirm.trim()) newErrors.passwordConfirm = "Подтвердите пароль";
        if (password !== passwordConfirm) newErrors.passwordConfirm = "Пароли не совпадают";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!Object.values(passwordValid).every(Boolean) || password !== passwordConfirm) {
            setShowTooltip(true);
            setShowError(true);
            return;
        } else {
            if (!validateForm()) {
                setShowTooltip(true);
                setShowError(true);
                return;
            }
            setShowError(false);
        }
        try {
            setError("");
            const response = await axios.post(`${API_URL}/auth/register`, {
                email,
                email_code: emailCode,
                first_name: firstName,
                last_name: lastName,
                username,
                password,
                confirm_password: passwordConfirm
            });
            const { access, refresh, first_name, last_name, avatar_url } = response.data;
            saveTokens(access, refresh, first_name, last_name, avatar_url);
            navigate('/dashboard');
            setError("");
        } catch (error: any) {
            console.log(error.response.data)
            const error_message = `${error.response?.data?.detail}` || "Ошибка при регистрации. Попробуйте снова"
            setError(error_message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md w-80">
                <h2 className="text-2xl mb-4">Регистрация</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}

                {step === 1 ? (
                    <>
                        <input
                            type="email"
                            placeholder="Электронная почта"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border w-full mb-4 p-2 rounded"
                        />

                        {/* Кнопка отправки кода или таймер */}
                        {cooldown > 0 ? (
                            <p className="text-gray-500 text-sm">Повторная отправка через {cooldown} сек.</p>
                        ) : (
                            <button
                                onClick={handleSendCode}
                                className={`w-full py-2 rounded ${cooldown > 0 ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"}`}
                                disabled={cooldown > 0}
                            >
                                Получить код
                            </button>
                        )}
                    </>
                ) : (
                    <div className="mx-auto mt-10 p-4 border rounded shadow">
                        <input
                            type="text"
                            placeholder="Код подтверждения"
                            value={emailCode}
                            onChange={(e) => setEmailCode(e.target.value)}
                            className="border w-full p-2 rounded mb-2"
                        />
                        {errors.emailCode && <p className="text-red-500 text-sm mb-2">{errors.emailCode}</p>}

                        <input
                            type="text"
                            placeholder="Имя"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="border w-full p-2 rounded mb-2"
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mb-2">{errors.firstName}</p>}

                        <input
                            type="text"
                            placeholder="Фамилия"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="border w-full p-2 rounded mb-2"
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mb-2">{errors.lastName}</p>}

                        <input
                            type="text"
                            placeholder="Логин"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="border w-full p-2 rounded mb-2"
                        />
                        {errors.username && <p className="text-red-500 text-sm mb-2">{errors.username}</p>}

                        {/* Поле пароля с кнопкой-подсказкой */}
                        <div className="relative flex items-center mb-2">
                            <input
                                type="password"
                                placeholder="Пароль"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    validatePassword(e.target.value);
                                }}
                                className="border w-full p-2 rounded"
                            />
                            <button
                                type="button"
                                className="ml-3 bg-red-500 hover:bg-red-800 font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md transition-all text-white"
                                onClick={() => setShowTooltip(!showTooltip)}
                            >
                                ?
                                {showTooltip && (
                                    <div
                                        className="absolute left-full ml-2 w-56 bg-gray-100 border border-gray-300 p-2 rounded text-sm shadow-lg">
                                        <p className={passwordValid.length ? "text-green-500" : "text-red-500"}>✔
                                            Минимум 8 символов</p>
                                        <p className={passwordValid.uppercase ? "text-green-500" : "text-red-500"}>✔
                                            Заглавная буква</p>
                                        <p className={passwordValid.lowercase ? "text-green-500" : "text-red-500"}>✔
                                            Строчная буква</p>
                                        <p className={passwordValid.number ? "text-green-500" : "text-red-500"}>✔
                                            Цифра</p>
                                        <p className={passwordValid.specialChar ? "text-green-500" : "text-red-500"}>✔
                                            Спецсимвол (!@#$%^&*)</p>
                                    </div>
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mb-2">{errors.password}</p>}

                        {/* Подтверждение пароля */}
                        <input
                            type="password"
                            placeholder="Подтверждение пароля"
                            value={passwordConfirm}
                            onChange={(e) => setPasswordConfirm(e.target.value)}
                            className="border w-full p-2 rounded mb-2"
                        />
                        {errors.passwordConfirm &&
                            <p className="text-red-500 text-sm mb-2">{errors.passwordConfirm}</p>}

                        {/* Кнопка регистрации */}
                        <button
                            type="submit"
                            className={'w-full py-2 rounded  bg-blue-500 text-white hover:bg-blue-600'}
                        >
                            Зарегистрироваться
                        </button>
                    </div>
                )}

                {/* Вопрос о существовании аккаунта на каждом шаге */}
                <div className="mt-4 text-center">
                    <p>
                        Уже есть аккаунт?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-blue-500 hover:text-blue-700"
                        >
                            Войти
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Register;

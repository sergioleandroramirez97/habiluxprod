import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Lock, Mail, User } from 'lucide-react';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { login, register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        dynamicData: {},
    });
    const [dynamicFields, setDynamicFields] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const { data } = await api.get('/admin/public/fields');
                // Filter active fields and sort by order
                const activeFields = data
                    .filter(field => field.active)
                    .sort((a, b) => a.order - b.order);
                setDynamicFields(activeFields);
            } catch (err) {
                console.error('Failed to fetch fields', err);
            }
        };
        if (!isLogin) {
            fetchFields();
        }
    }, [isLogin]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDynamicChange = (e) => {
        setFormData({
            ...formData,
            dynamicData: { ...formData.dynamicData, [e.target.name]: e.target.value },
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                navigate('/dashboard');
            } else {
                const { message } = await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    dynamicData: formData.dynamicData,
                });
                setSuccess(message);
                setIsLogin(true);
                setFormData({ email: '', password: '', confirmPassword: '', name: '', dynamicData: {} });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="flex border-b border-gray-200 mb-8">
                    <button
                        className={`flex-1 pb-4 text-lg font-medium ${isLogin
                                ? 'border-b-2 border-slate-800 text-slate-800'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setIsLogin(true)}
                    >
                        Iniciar Sesión
                    </button>
                    <button
                        className={`flex-1 pb-4 text-lg font-medium ${!isLogin
                                ? 'border-b-2 border-slate-800 text-slate-800'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setIsLogin(false)}
                    >
                        Registrarse
                    </button>
                </div>

                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
                    </h2>
                    <p className="text-gray-600">
                        {isLogin
                            ? 'Ingresa a tu cuenta para continuar'
                            : 'Completa el formulario para registrarte'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all"
                                placeholder="Nombre Completo"
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all"
                            placeholder="Email"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all"
                            placeholder="Contraseña"
                        />
                    </div>

                    {!isLogin && (
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all"
                                placeholder="Confirmar Contraseña"
                            />
                        </div>
                    )}

                    {!isLogin &&
                        dynamicFields.map((field) => (
                            <div key={field.id}>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {field.label}
                                </label>
                                {field.type === 'select' ? (
                                    <select
                                        name={field.name}
                                        required={field.required}
                                        onChange={handleDynamicChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {field.options.split(',').map((opt) => (
                                            <option key={opt.trim()} value={opt.trim()}>
                                                {opt.trim()}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        required={field.required}
                                        onChange={handleDynamicChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-all"
                                        placeholder={field.label}
                                    />
                                )}
                            </div>
                        ))}

                    {isLogin && (
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center text-gray-600">
                                <input type="checkbox" className="mr-2 rounded border-gray-300" />
                                Recordarme
                            </label>
                            <a href="#" className="text-slate-600 hover:text-slate-800 font-medium">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                    >
                        {isLogin ? 'Iniciar Sesión' : 'Registrarse'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    {isLogin ? (
                        <>
                            ¿No tienes una cuenta?{' '}
                            <button
                                onClick={() => setIsLogin(false)}
                                className="text-slate-900 font-medium hover:underline"
                            >
                                Regístrate aquí
                            </button>
                        </>
                    ) : (
                        <>
                            ¿Ya tienes una cuenta?{' '}
                            <button
                                onClick={() => setIsLogin(true)}
                                className="text-slate-900 font-medium hover:underline"
                            >
                                Inicia Sesión
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;

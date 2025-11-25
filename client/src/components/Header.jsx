import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, ChevronDown } from 'lucide-react';
import { getPropertyTypes } from '../api/propertyApi';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuTypes, setMenuTypes] = useState([]);

    useEffect(() => {
        const loadMenuTypes = async () => {
            try {
                const types = await getPropertyTypes();
                setMenuTypes(types.filter(t => t.active && t.showInMenu));
            } catch (error) {
                console.error('Error loading menu types:', error);
            }
        };
        loadMenuTypes();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
                        <span className="text-white font-bold text-sm">RE</span>
                    </div>
                    <span className="text-xl font-semibold text-gray-900">RealEstate Portal</span>
                </div>

                {/* Navigation */}
                <nav className="flex items-center space-x-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                        Dashboard
                    </button>

                    <div className="relative group">
                        <button
                            className="flex items-center text-gray-600 hover:text-gray-900 font-medium py-2"
                            onClick={() => navigate('/properties')}
                        >
                            Propiedades
                            {menuTypes.length > 0 && <ChevronDown size={16} className="ml-1" />}
                        </button>

                        {menuTypes.length > 0 && (
                            <div className="absolute left-0 top-full w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block border border-gray-100">
                                <button
                                    onClick={() => navigate('/properties')}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left font-medium border-b border-gray-50"
                                >
                                    Ver todas
                                </button>
                                {menuTypes.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/properties?propertyTypeId=${type.id}`);
                                        }}
                                        className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-blue-600 w-full text-left"
                                    >
                                        {type.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button className="text-gray-600 hover:text-gray-900 font-medium">
                        Archivos
                    </button>
                    <button
                        onClick={() => navigate('/profile')}
                        className="text-gray-600 hover:text-gray-900 font-medium"
                    >
                        Configuración
                    </button>
                </nav>

                {/* User Menu */}
                <div className="flex items-center space-x-4">
                    <button className="relative p-2 text-gray-600 hover:text-gray-900">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden">
                            {user?.avatar ? (
                                <img
                                    src={`http://localhost:3000${user.avatar}`}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 font-semibold">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-600 hover:text-gray-900"
                            title="Cerrar sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

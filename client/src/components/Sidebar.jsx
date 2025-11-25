import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, Wrench, FileText, Settings, LogOut, DollarSign, FileSignature, Calendar, BarChart, MessageCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { getPropertyTypes } from '../api/propertyApi';
import NotificationBell from './NotificationBell';
import OverduePaymentFooter from './OverduePaymentFooter';

export default function Sidebar() {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';
    const [menuTypes, setMenuTypes] = useState([]);
    const [propertiesOpen, setPropertiesOpen] = useState(false);

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

    useEffect(() => {
        if (location.pathname.startsWith('/properties')) {
            setPropertiesOpen(true);
        }
    }, [location.pathname]);

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/properties', label: 'Propiedades', icon: Building2 },
        { path: '/maintenance', label: 'Mantenimiento', icon: Wrench },
        { path: '/documents', label: 'Documentación', icon: FileText },
        { path: '/payments', label: 'Pagos', icon: DollarSign },
        { path: '/contracts', label: 'Contratos', icon: FileSignature, badge: 'Próximamente' },
        { path: '/calendar', label: 'Calendario', icon: Calendar, badge: 'Próximamente' },
        { path: '/reports', label: 'Reportes', icon: BarChart, badge: 'Próximamente' },
        { path: '/chat', label: 'Chat', icon: MessageCircle, badge: 'Próximamente' },
        ...(isAdmin ? [{ path: '/admin', label: 'Configuración', icon: Settings }] : [])
    ];

    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Habilux</h1>
                        <p className="text-xs text-gray-400">Portal Inmobiliario</p>
                    </div>
                </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">
                            {user.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.role}</p>
                    </div>
                    <NotificationBell />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isProperties = item.path === '/properties';
                        const hasSubmenu = isProperties && menuTypes.length > 0;

                        return (
                            <li key={item.path}>
                                {hasSubmenu ? (
                                    <div>
                                        <button
                                            onClick={() => setPropertiesOpen(!propertiesOpen)}
                                            className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon size={20} />
                                                <span className="font-medium">{item.label}</span>
                                            </div>
                                            {propertiesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </button>

                                        {propertiesOpen && (
                                            <ul className="mt-1 ml-4 space-y-1 border-l border-gray-700 pl-2">
                                                <li>
                                                    <Link
                                                        to="/properties"
                                                        className={`block px-4 py-2 text-sm rounded-lg transition-colors ${location.pathname === '/properties' && !location.search
                                                            ? 'text-white bg-gray-800'
                                                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                                            }`}
                                                    >
                                                        Ver todas
                                                    </Link>
                                                </li>
                                                {menuTypes.map(type => (
                                                    <li key={type.id}>
                                                        <Link
                                                            to={`/properties?propertyTypeId=${type.id}`}
                                                            className={`block px-4 py-2 text-sm rounded-lg transition-colors ${location.search.includes(`propertyTypeId=${type.id}`)
                                                                ? 'text-white bg-gray-800'
                                                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                                                }`}
                                                        >
                                                            {type.name}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={20} />
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <span className="text-xs bg-yellow-500 text-gray-900 px-2 py-1 rounded-full font-semibold">
                                                {item.badge}
                                            </span>
                                        )}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors w-full"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>

            <OverduePaymentFooter />
        </aside>
    );
}

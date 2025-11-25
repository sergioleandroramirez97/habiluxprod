import { useNavigate, useLocation } from 'react-router-dom';
import { User, Bell, Shield } from 'lucide-react';

const ProfileSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { id: 'perfil', label: 'Perfil', icon: User, path: '/profile' },
        { id: 'notificaciones', label: 'Notificaciones', icon: Bell, path: '/profile/notifications' },
        { id: 'seguridad', label: 'Seguridad', icon: Shield, path: '/profile/security' },
    ];

    return (
        <div className="w-64 bg-white border-r border-gray-200 p-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                CONFIGURACIÓN
            </h3>
            <nav className="space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-slate-100 text-slate-900'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default ProfileSidebar;

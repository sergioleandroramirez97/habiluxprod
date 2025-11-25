import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getNotifications, markAsRead, markAllAsRead } from '../api/notificationApi';
import { Bell, CheckCheck } from 'lucide-react';

export default function Notifications() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread

    useEffect(() => {
        loadNotifications();
    }, [filter]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const params = { limit: 50 };
            if (filter === 'unread') {
                params.unreadOnly = true;
            }
            const data = await getNotifications(params);
            setNotifications(data.notifications || []);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            if (!notification.read) {
                await markAsRead(notification.id);
                setNotifications(prev =>
                    prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                );
            }

            // Navigate to related resource
            if (notification.relatedType === 'MAINTENANCE') {
                navigate(`/maintenance/${notification.relatedId}/edit`);
            } else if (notification.relatedType === 'DOCUMENTATION') {
                navigate('/documents');
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        return '🔔';
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
                    <p className="text-gray-600">Mantente al día con las actualizaciones</p>
                </div>

                {/* Filters and Actions */}
                <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Todas
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'unread'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            No leídas
                        </button>
                    </div>
                    <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        <CheckCheck size={18} />
                        Marcar todas como leídas
                    </button>
                </div>

                {/* Notifications List */}
                <div className="bg-white rounded-lg shadow">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Cargando notificaciones...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500">
                                {filter === 'unread' ? 'No tienes notificaciones sin leer' : 'No hay notificaciones'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="font-semibold text-gray-900">
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                {new Date(notification.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getAllProperties } from '../api/propertyApi';
import { getAllMaintenances } from '../api/maintenanceApi';
import { getUsers } from '../api/adminApi';
import { Building2, Wrench, Users } from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalProperties: 0,
        myProperties: 0,
        openMaintenances: 0,
        totalUsers: 0
    });
    const [myProperties, setMyProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    const isOwner = user?.role === 'PROPIETARIO';
    const isAdmin = user?.role === 'ADMIN';

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            // Cargar propiedades
            const propertiesData = await getAllProperties({ limit: 1000 });
            const allProperties = propertiesData.properties || [];

            // Filtrar propiedades del usuario si es propietario
            const userProperties = isOwner
                ? allProperties.filter(p => p.ownerId === user.id)
                : allProperties;

            // Cargar mantenimientos
            const maintenancesData = await getAllMaintenances({ status: 'ABIERTO', limit: 1000 });
            const openMaintenances = maintenancesData.maintenances || [];

            // Cargar usuarios si es admin
            let totalUsers = 0;
            if (isAdmin) {
                try {
                    const usersData = await getUsers();
                    totalUsers = usersData.users?.length || 0;
                } catch (error) {
                    console.error('Error loading users:', error);
                }
            }

            setMyProperties(userProperties.slice(0, 5)); // Mostrar solo las primeras 5
            setStats({
                totalProperties: allProperties.length,
                myProperties: userProperties.length,
                openMaintenances: openMaintenances.length,
                totalUsers: totalUsers
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-600">Bienvenido, {user?.name}</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-600">
                                    {isOwner ? 'Mis Propiedades' : 'Total Propiedades'}
                                </h3>
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Building2 size={20} className="text-blue-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {loading ? '-' : (isOwner ? stats.myProperties : stats.totalProperties)}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                {isOwner ? 'Propiedades que posees' : 'En el sistema'}
                            </p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-600">Mantenimientos</h3>
                                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <Wrench size={20} className="text-yellow-600" />
                                </div>
                            </div>
                            <p className="text-3xl font-bold text-gray-900">
                                {loading ? '-' : stats.openMaintenances}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">Abiertos</p>
                        </div>

                        {isAdmin && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-medium text-gray-600">Usuarios</h3>
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Users size={20} className="text-green-600" />
                                    </div>
                                </div>
                                <p className="text-3xl font-bold text-gray-900">
                                    {loading ? '-' : stats.totalUsers}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">Total registrados</p>
                            </div>
                        )}
                    </div>

                    {/* Properties List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {isOwner ? 'Mis Propiedades' : 'Propiedades Recientes'}
                                </h2>
                                <button
                                    onClick={() => navigate('/properties')}
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    Ver todas →
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                Cargando...
                            </div>
                        ) : myProperties.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                {isOwner ? 'No tienes propiedades registradas' : 'No hay propiedades en el sistema'}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {myProperties.map((property) => (
                                    <div
                                        key={property.id}
                                        className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => navigate(`/properties/${property.id}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            {property.image ? (
                                                <img
                                                    src={`http://localhost:3000${property.image}`}
                                                    alt={property.title}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <Building2 size={24} className="text-gray-400" />
                                                </div>
                                            )}

                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900">{property.title}</h3>
                                                <p className="text-sm text-gray-600">{property.address}</p>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-xs text-gray-500">Código: {property.propertyCode}</span>
                                                    <span className={`text-xs px-2 py-1 rounded-full ${property.status === 'DISPONIBLE' ? 'bg-green-100 text-green-800' :
                                                        property.status === 'ALQUILADA' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {property.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">
                                                    ${property.rentValue.toLocaleString()}
                                                </p>
                                                <p className="text-sm text-gray-500">/ mes</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Admin Panel Link */}
                    {isAdmin && (
                        <div className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-sm p-6 text-white">
                            <h2 className="text-xl font-semibold mb-2">Panel de Administración</h2>
                            <p className="text-blue-100 mb-4">
                                Gestiona usuarios, campos dinámicos y configuraciones del sistema
                            </p>
                            <button
                                onClick={() => navigate('/admin')}
                                className="px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
                            >
                                Ir al Panel de Admin
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMaintenances, deleteMaintenance } from '../api/maintenanceApi';
import { Plus, Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function Maintenances() {
    const navigate = useNavigate();
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        propertyId: '',
        search: ''
    });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';

    useEffect(() => {
        loadData();
    }, [filters, pagination.page]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Si es propietario, solo mostrar mantenimientos de sus propiedades
            const queryFilters = { ...filters };
            if (user.role === 'PROPIETARIO') {
                // Primero necesitamos obtener las propiedades del usuario
                // Por ahora, el backend debería manejar esto
                queryFilters.ownerId = user.id;
            }

            const data = await getAllMaintenances({
                ...queryFilters,
                page: pagination.page,
                limit: pagination.limit
            });
            setMaintenances(data.maintenances || []);
            setPagination(prev => ({ ...prev, ...data.pagination }));
        } catch (error) {
            console.error('Error loading maintenances:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar este mantenimiento?')) {
            try {
                await deleteMaintenance(id);
                loadData();
            } catch (error) {
                console.error('Error deleting maintenance:', error);
                alert('Error al eliminar el mantenimiento');
            }
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            ABIERTO: 'bg-yellow-100 text-yellow-800',
            RESUELTO: 'bg-green-100 text-green-800',
            CANCELADO: 'bg-red-100 text-red-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ABIERTO':
                return <Clock size={16} className="text-yellow-600" />;
            case 'RESUELTO':
                return <CheckCircle size={16} className="text-green-600" />;
            case 'CANCELADO':
                return <XCircle size={16} className="text-red-600" />;
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-6">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mantenimientos</h1>
                        <p className="text-gray-600">Gestiona todas las solicitudes de mantenimiento</p>
                    </div>
                    <button
                        onClick={() => navigate('/maintenance/new')}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Nuevo Mantenimiento
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar por ID, propiedad o solicitante..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="">Todos los estados</option>
                            <option value="ABIERTO">Abierto</option>
                            <option value="RESUELTO">Resuelto</option>
                            <option value="CANCELADO">Cancelado</option>
                        </select>
                    </div>
                </div>

                {/* Maintenances Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propiedad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solicitante</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resumen</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        Cargando...
                                    </td>
                                </tr>
                            ) : maintenances.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                                        No hay mantenimientos registrados
                                    </td>
                                </tr>
                            ) : (
                                maintenances.map((maintenance) => (
                                    <tr key={maintenance.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-mono text-gray-600">
                                            {maintenance.id.substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{maintenance.property.title}</div>
                                            <div className="text-sm text-gray-500">Código: {maintenance.property.propertyCode}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{maintenance.requester.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            {maintenance.summary}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(maintenance.createdAt).toLocaleDateString()} <br />
                                            {new Date(maintenance.createdAt).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(maintenance.status)}
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(maintenance.status)}`}>
                                                    {maintenance.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            onClick={() => navigate(`/maintenance/${maintenance.id}/edit`)}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Editar"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(maintenance.id)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="px-6 py-4 flex items-center justify-between border-t">
                            <div className="text-sm text-gray-700">
                                Mostrando {maintenances.length} de {pagination.total} mantenimientos
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Anterior
                                </button>
                                <span className="px-3 py-1">
                                    Página {pagination.page} de {pagination.pages}
                                </span>
                                <button
                                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-3 py-1 border rounded disabled:opacity-50"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

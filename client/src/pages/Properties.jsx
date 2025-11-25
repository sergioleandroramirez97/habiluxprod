import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllProperties, deleteProperty } from '../api/propertyApi';
import { getCities, getPropertyTypes } from '../api/propertyApi';
import { Search, Plus, Filter, Edit, Trash2, Wrench, FileText, Eye } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function Properties() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [cities, setCities] = useState([]);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const [filters, setFilters] = useState(() => {
        const params = new URLSearchParams(location.search);
        return {
            search: '',
            cityId: '',
            propertyTypeId: params.get('propertyTypeId') || '',
            status: ''
        };
    });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const typeId = params.get('propertyTypeId');
        if (typeId !== null && typeId !== filters.propertyTypeId) {
            setFilters(prev => ({ ...prev, propertyTypeId: typeId }));
        } else if (typeId === null && filters.propertyTypeId !== '') {
            setFilters(prev => ({ ...prev, propertyTypeId: '' }));
        }
    }, [location.search]);

    useEffect(() => {
        loadData();
    }, [filters, pagination.page]);

    useEffect(() => {
        loadFiltersData();
    }, []);

    const loadFiltersData = async () => {
        try {
            const [citiesData, typesData] = await Promise.all([
                getCities(),
                getPropertyTypes()
            ]);
            setCities(citiesData.filter(c => c.active));
            setPropertyTypes(typesData.filter(t => t.active));
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    };

    const loadData = async () => {
        try {
            setLoading(true);

            // Si es propietario, filtrar solo sus propiedades
            const queryFilters = { ...filters };
            if (user.role === 'PROPIETARIO') {
                queryFilters.ownerId = user.id;
            }

            const data = await getAllProperties({
                ...queryFilters,
                page: pagination.page,
                limit: pagination.limit
            });
            setProperties(data.properties || []);
            setPagination(prev => ({ ...prev, ...data.pagination }));
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Está seguro de eliminar esta propiedad?')) {
            try {
                await deleteProperty(id);
                loadData();
            } catch (error) {
                console.error('Error deleting property:', error);
                alert('Error al eliminar la propiedad');
            }
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            DISPONIBLE: 'bg-green-100 text-green-800',
            ALQUILADA: 'bg-blue-100 text-blue-800',
            MANTENIMIENTO: 'bg-yellow-100 text-yellow-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-6">
                {/* Header */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Propiedades</h1>
                        <p className="text-gray-600">Gestiona todas las propiedades del portal</p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/properties/new')}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            <Plus size={20} />
                            Nueva Propiedad
                        </button>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar propiedades..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                            />
                        </div>
                        <select
                            value={filters.cityId}
                            onChange={(e) => setFilters({ ...filters, cityId: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="">Todas las ciudades</option>
                            {cities.map(city => (
                                <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                        </select>
                        <select
                            value={filters.propertyTypeId}
                            onChange={(e) => setFilters({ ...filters, propertyTypeId: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="">Todos los tipos</option>
                            {propertyTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="px-4 py-2 border rounded-lg"
                        >
                            <option value="">Todos los estados</option>
                            <option value="DISPONIBLE">Disponible</option>
                            <option value="ALQUILADA">Alquilada</option>
                            <option value="MANTENIMIENTO">Mantenimiento</option>
                        </select>
                    </div>
                </div>

                {/* Properties Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Imagen</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propiedad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propietario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        Cargando...
                                    </td>
                                </tr>
                            ) : properties.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        No hay propiedades registradas
                                    </td>
                                </tr>
                            ) : (
                                properties.map((property) => (
                                    <tr key={property.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            {property.image ? (
                                                <img
                                                    src={`http://localhost:3000${property.image}`}
                                                    alt={property.title}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">Sin imagen</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{property.title}</div>
                                            <div className="text-sm text-gray-500">Código: {property.propertyCode}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{property.propertyType.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{property.city.name}</div>
                                            <div className="text-sm text-gray-500">{property.address}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{property.owner.name}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            ${property.rentValue.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(property.status)}`}>
                                                {property.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/properties/${property.id}`)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Ver Detalles"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/documents?propertyId=${property.id}`)}
                                                    className="text-gray-600 hover:text-gray-800"
                                                    title="Documentación"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate('/maintenance/new', { state: { propertyId: property.id } })}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Solicitar Mantenimiento"
                                                >
                                                    <Wrench size={18} />
                                                </button>
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            onClick={() => navigate(`/properties/${property.id}/edit`)}
                                                            className="text-green-600 hover:text-green-800"
                                                            title="Editar"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(property.id)}
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
                                Mostrando {properties.length} de {pagination.total} propiedades
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

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPropertyById } from '../api/propertyApi';
import { getAllMaintenances } from '../api/maintenanceApi';
import DocumentationList from '../components/DocumentationList';
import Sidebar from '../components/Sidebar';
import { MapPin, User, Home, DollarSign, ArrowLeft, Wrench, Edit } from 'lucide-react';

export default function PropertyDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [maintenances, setMaintenances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details'); // details, maintenance, documentation

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [propertyData, maintenanceData] = await Promise.all([
                getPropertyById(id),
                getAllMaintenances({ propertyId: id, limit: 5 }) // Fetch recent maintenances
            ]);
            setProperty(propertyData);
            setMaintenances(maintenanceData.maintenances || []);
        } catch (error) {
            console.error('Error loading property data:', error);
            alert('Error al cargar la propiedad');
            navigate('/properties');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen">Cargando...</div>;
    if (!property) return null;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-6">
                <button
                    onClick={() => navigate('/properties')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Volver a Propiedades
                </button>

                {/* Header / Hero */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                    <div className="relative h-64 bg-gray-200">
                        {property.image ? (
                            <img
                                src={`http://localhost:3000${property.image}`}
                                alt={property.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <Home size={64} />
                            </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                            <h1 className="text-3xl font-bold text-white mb-2">{property.title}</h1>
                            <div className="flex items-center text-white/90 gap-4">
                                <span className="flex items-center gap-1">
                                    <MapPin size={18} />
                                    {property.address}, {property.city.name}
                                </span>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                    {property.propertyType.name}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${property.status === 'DISPONIBLE' ? 'bg-green-500 text-white' :
                                    property.status === 'ALQUILADA' ? 'bg-blue-500 text-white' :
                                        'bg-yellow-500 text-white'
                                    }`}>
                                    {property.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'details'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('details')}
                    >
                        Detalles
                    </button>
                    <button
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'maintenance'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('maintenance')}
                    >
                        Mantenimiento
                    </button>
                    <button
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'documentation'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('documentation')}
                    >
                        Documentación
                    </button>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {activeTab === 'details' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Código</span>
                                        <span className="font-medium">{property.propertyCode}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Valor de Renta</span>
                                        <span className="font-medium flex items-center text-green-600">
                                            <DollarSign size={16} />
                                            {property.rentValue.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Estacionamientos</span>
                                        <span className="font-medium">{property.parkingSpots}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Bodegas</span>
                                        <span className="font-medium">{property.warehouses}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Número de Escritura</span>
                                        <span className="font-medium">{property.deedNumber || '-'}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personas Asociadas</h3>
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Propietario</p>
                                                <p className="text-sm text-gray-600">{property.owner.name}</p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-11">{property.owner.email}</p>
                                        {property.owner.phone && <p className="text-xs text-gray-500 ml-11">{property.owner.phone}</p>}
                                    </div>

                                    {property.tenant ? (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="bg-green-100 p-2 rounded-full text-green-600">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Inquilino Actual</p>
                                                    <p className="text-sm text-gray-600">{property.tenant.name}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 ml-11">{property.tenant.email}</p>
                                            {property.tenant.phone && <p className="text-xs text-gray-500 ml-11">{property.tenant.phone}</p>}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 text-center text-gray-500">
                                            Sin inquilino asignado
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'maintenance' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Historial de Mantenimiento</h3>
                                <button
                                    onClick={() => navigate('/maintenance/new', { state: { propertyId: property.id } })}
                                    className="text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <Wrench size={16} />
                                    Nuevo Reporte
                                </button>
                            </div>

                            {maintenances.length > 0 ? (
                                <div className="space-y-4">
                                    {maintenances.map(m => (
                                        <div key={m.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{m.summary}</h4>
                                                    <p className="text-sm text-gray-500">{new Date(m.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${m.status === 'RESUELTO' ? 'bg-green-100 text-green-800' :
                                                        m.status === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {m.status}
                                                    </span>
                                                    <button
                                                        onClick={() => navigate(`/maintenance/${m.id}/edit`, { state: { propertyId: property.id } })}
                                                        className="text-gray-400 hover:text-blue-600"
                                                        title="Editar Mantenimiento"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2">{m.description}</p>
                                            <div className="mt-2 text-xs text-gray-400">
                                                Reportado por: {m.requester.name}
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => navigate(`/maintenance?propertyId=${property.id}`)}
                                        className="w-full text-center text-blue-600 text-sm hover:underline mt-4"
                                    >
                                        Ver todo el historial
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    No hay registros de mantenimiento.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'documentation' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Documentación de la Propiedad</h3>
                                <button
                                    onClick={() => navigate(`/documents?propertyId=${property.id}`)}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Gestionar Documentos
                                </button>
                            </div>
                            <DocumentationList propertyId={property.id} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { createMaintenance, updateMaintenance, getMaintenanceById } from '../api/maintenanceApi';
import { getAllProperties } from '../api/propertyApi';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function MaintenanceForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [properties, setProperties] = useState([]);

    const [formData, setFormData] = useState({
        propertyId: location.state?.propertyId || '',
        summary: '',
        description: '',
        status: 'ABIERTO'
    });

    useEffect(() => {
        loadProperties();
        if (isEdit) {
            loadMaintenance();
        }
    }, [id]);

    const loadProperties = async () => {
        try {
            const data = await getAllProperties({ limit: 1000 });
            setProperties(data.properties || []);
        } catch (error) {
            console.error('Error loading properties:', error);
        }
    };

    const loadMaintenance = async () => {
        try {
            setLoadingData(true);
            const maintenance = await getMaintenanceById(id);
            setFormData({
                propertyId: maintenance.propertyId,
                summary: maintenance.summary,
                description: maintenance.description || '',
                status: maintenance.status
            });
        } catch (error) {
            console.error('Error loading maintenance:', error);
            alert('Error al cargar el mantenimiento');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.propertyId || !formData.summary) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        try {
            setLoading(true);
            const data = {
                propertyId: parseInt(formData.propertyId),
                summary: formData.summary,
                description: formData.description || null,
                ...(isEdit && { status: formData.status })
            };

            if (isEdit) {
                await updateMaintenance(id, data);
                alert('Mantenimiento actualizado exitosamente');
            } else {
                await createMaintenance(data);
                alert('Mantenimiento creado exitosamente');
            }
            navigate('/maintenance');
        } catch (error) {
            console.error('Error saving maintenance:', error);
            alert(error.response?.data?.message || 'Error al guardar el mantenimiento');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 p-6 flex justify-center items-center">
                    <div className="text-gray-600">Cargando...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-6">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/maintenance')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEdit ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}
                        </h1>
                        <p className="text-gray-600">Complete los datos del mantenimiento</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                    <div className="grid grid-cols-1 gap-6">
                        {/* Propiedad */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Propiedad *
                            </label>
                            <select
                                name="propertyId"
                                value={formData.propertyId}
                                onChange={handleChange}
                                required
                                disabled={isEdit}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">Seleccionar propiedad</option>
                                {properties.map(property => (
                                    <option key={property.id} value={property.id}>
                                        {property.title} - {property.propertyCode}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Resumen */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Resumen *
                            </label>
                            <input
                                type="text"
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: Fuga de agua en el baño"
                            />
                        </div>

                        {/* Descripción */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción Detallada
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Describe el problema en detalle..."
                            />
                        </div>

                        {/* Estado (solo en edición) */}
                        {isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Estado
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    {JSON.parse(localStorage.getItem('user') || '{}').role === 'ADMIN' ? (
                                        <>
                                            <option value="ABIERTO">Abierto</option>
                                            <option value="RESUELTO">Resuelto</option>
                                            <option value="CANCELADO">Cancelado</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value={formData.status} disabled>
                                                {formData.status === 'ABIERTO' ? 'Abierto' :
                                                    formData.status === 'RESUELTO' ? 'Resuelto' : 'Cancelado'}
                                            </option>
                                            <option value="CANCELADO">Cancelar Mantenimiento</option>
                                        </>
                                    )}
                                </select>
                                {JSON.parse(localStorage.getItem('user') || '{}').role !== 'ADMIN' && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        Solo puedes cancelar este mantenimiento
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Nota:</strong> El mantenimiento se registrará con tu usuario como solicitante
                            y la fecha y hora actual.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex gap-4 justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/maintenance')}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Mantenimiento')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

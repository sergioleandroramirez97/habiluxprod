import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProperty, updateProperty, getPropertyById } from '../api/propertyApi';
import { getCities, getPropertyTypes, getOwners, getTenants, getPropertyStatuses } from '../api/propertyApi';
import { ArrowLeft, Upload } from 'lucide-react';

export default function PropertyForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [imagePreview, setImagePreview] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        ownerId: '',
        tenantId: '',
        cityId: '',
        address: '',
        parkingSpots: 0,
        warehouses: 0,
        deedNumber: '',
        propertyTypeId: '',
        rentValue: '',
        status: 'DISPONIBLE',
        image: null
    });

    const [options, setOptions] = useState({
        cities: [],
        propertyTypes: [],
        owners: [],
        tenants: [],
        statuses: []
    });

    useEffect(() => {
        loadOptions();
        if (isEdit) {
            loadProperty();
        }
    }, [id]);

    const loadOptions = async () => {
        try {
            const [cities, types, owners, tenants, statuses] = await Promise.all([
                getCities(),
                getPropertyTypes(),
                getOwners(),
                getTenants(),
                getPropertyStatuses()
            ]);
            setOptions({
                cities: cities.filter(c => c.active),
                propertyTypes: types.filter(t => t.active),
                owners: owners.users || [],
                tenants: tenants.users || [],
                statuses: statuses.filter(s => s.active)
            });
        } catch (error) {
            console.error('Error loading options:', error);
        }
    };

    const loadProperty = async () => {
        try {
            setLoadingData(true);
            const property = await getPropertyById(id);
            setFormData({
                title: property.title,
                ownerId: property.ownerId,
                tenantId: property.tenantId || '',
                cityId: property.cityId,
                address: property.address,
                parkingSpots: property.parkingSpots,
                warehouses: property.warehouses,
                deedNumber: property.deedNumber || '',
                propertyTypeId: property.propertyTypeId,
                rentValue: property.rentValue,
                status: property.status,
                image: null
            });
            if (property.image) {
                setImagePreview(`http://localhost:3000${property.image}`);
            }
        } catch (error) {
            console.error('Error loading property:', error);
            alert('Error al cargar la propiedad');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.ownerId || !formData.cityId || !formData.propertyTypeId || !formData.rentValue) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        try {
            setLoading(true);
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    data.append(key, formData[key]);
                }
            });

            if (isEdit) {
                await updateProperty(id, data);
                alert('Propiedad actualizada exitosamente');
            } else {
                await createProperty(data);
                alert('Propiedad creada exitosamente');
            }
            navigate('/properties');
        } catch (error) {
            console.error('Error saving property:', error);
            alert(error.response?.data?.message || 'Error al guardar la propiedad');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="p-6 flex justify-center items-center">
                <div className="text-gray-600">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <button
                    onClick={() => navigate('/properties')}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEdit ? 'Editar Propiedad' : 'Nueva Propiedad'}
                    </h1>
                    <p className="text-gray-600">Complete los datos de la propiedad</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Título */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Título *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Casa en Palermo"
                        />
                    </div>

                    {/* Propietario */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Propietario *
                        </label>
                        <select
                            name="ownerId"
                            value={formData.ownerId}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccionar propietario</option>
                            {options.owners.map(owner => (
                                <option key={owner.id} value={owner.id}>
                                    {owner.name} ({owner.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Inquilino */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Inquilino (opcional)
                        </label>
                        <select
                            name="tenantId"
                            value={formData.tenantId}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Sin inquilino</option>
                            {options.tenants.map(tenant => (
                                <option key={tenant.id} value={tenant.id}>
                                    {tenant.name} ({tenant.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Ciudad */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ciudad *
                        </label>
                        <select
                            name="cityId"
                            value={formData.cityId}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccionar ciudad</option>
                            {options.cities.map(city => (
                                <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tipo de Propiedad */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo de Propiedad *
                        </label>
                        <select
                            name="propertyTypeId"
                            value={formData.propertyTypeId}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Seleccionar tipo</option>
                            {options.propertyTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dirección */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dirección *
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Ej: Av. Santa Fe 1234"
                        />
                    </div>

                    {/* Estacionamientos */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estacionamientos
                        </label>
                        <input
                            type="number"
                            name="parkingSpots"
                            value={formData.parkingSpots}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Bodegas */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bodegas
                        </label>
                        <input
                            type="number"
                            name="warehouses"
                            value={formData.warehouses}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Número de Escritura */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Número de Escritura
                        </label>
                        <input
                            type="text"
                            name="deedNumber"
                            value={formData.deedNumber}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Valor de Alquiler */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Valor de Alquiler *
                        </label>
                        <input
                            type="number"
                            name="rentValue"
                            value={formData.rentValue}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Estado */}
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
                            {options.statuses.map(status => (
                                <option key={status.id} value={status.name}>{status.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Imagen */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imagen de la Propiedad
                        </label>
                        <div className="flex items-center gap-4">
                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg"
                                />
                            )}
                            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                <Upload size={20} />
                                <span>Seleccionar imagen</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-4 justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/properties')}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Propiedad')}
                    </button>
                </div>
            </form>
        </div>
    );
}

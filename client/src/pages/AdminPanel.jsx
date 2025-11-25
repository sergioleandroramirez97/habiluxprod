import { useState, useEffect } from 'react';
import { getUsers, updateUserStatus, updateUserRole, deleteUser } from '../api/adminApi';
import { getCities, createCity, updateCity, deleteCity, getPropertyTypes, createPropertyType, updatePropertyType, deletePropertyType, getPropertyStatuses, createPropertyStatus, updatePropertyStatus, deletePropertyStatus } from '../api/propertyApi';
import { getAllConfig, updateConfig } from '../api/portalConfigApi';
import { Users, Building, Settings, Plus, Edit, Trash2, Check, X, Upload } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [cities, setCities] = useState([]);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [propertyStatuses, setPropertyStatuses] = useState([]);
    const [config, setConfig] = useState({ siteTitle: '', favicon: null, logo: null });
    const [loading, setLoading] = useState(true);

    // Estados para formularios
    const [editingCity, setEditingCity] = useState(null);
    const [editingType, setEditingType] = useState(null);
    const [editingStatus, setEditingStatus] = useState(null);
    const [newCityName, setNewCityName] = useState('');
    const [newTypeName, setNewTypeName] = useState('');
    const [newTypeShowInMenu, setNewTypeShowInMenu] = useState(false);
    const [newStatusName, setNewStatusName] = useState('');

    // Estados para configuración
    const [configForm, setConfigForm] = useState({ siteTitle: '' });
    const [faviconFile, setFaviconFile] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [configPreview, setConfigPreview] = useState({ favicon: null, logo: null });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'users') {
                const data = await getUsers();
                setUsers(data.users || []);
            } else if (activeTab === 'properties') {
                const [citiesData, typesData, statusesData] = await Promise.all([getCities(), getPropertyTypes(), getPropertyStatuses()]);
                setCities(citiesData || []);
                setPropertyTypes(typesData || []);
                setPropertyStatuses(statusesData || []);
            } else if (activeTab === 'config') {
                const data = await getAllConfig();
                setConfig(data);
                setConfigForm({ siteTitle: data.siteTitle || '' });
                setConfigPreview({
                    favicon: data.favicon ? `http://localhost:3000${data.favicon}` : null,
                    logo: data.logo ? `http://localhost:3000${data.logo}` : null
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- User Handlers ---
    const handleApproveUser = async (userId, role) => {
        try {
            await updateUserRole(userId, role);
            await updateUserStatus(userId, 'APPROVED');
            loadData();
        } catch (error) {
            console.error('Error approving user:', error);
            alert('Error al aprobar usuario: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleRejectUser = async (userId) => {
        try {
            await updateUserStatus(userId, 'REJECTED');
            loadData();
        } catch (error) {
            console.error('Error rejecting user:', error);
            alert('Error al rechazar usuario: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('¿Está seguro de eliminar este usuario?')) {
            try {
                await deleteUser(userId);
                loadData();
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Error al eliminar usuario');
            }
        }
    };

    // --- City Handlers ---
    const handleCreateCity = async (e) => {
        e.preventDefault();
        try {
            await createCity({ name: newCityName });
            setNewCityName('');
            loadData();
        } catch (error) {
            alert('Error al crear ciudad');
        }
    };

    const handleUpdateCity = async (id, name, active) => {
        try {
            await updateCity(id, { name, active });
            setEditingCity(null);
            loadData();
        } catch (error) {
            alert('Error al actualizar ciudad');
        }
    };

    const handleDeleteCity = async (id) => {
        if (window.confirm('¿Eliminar ciudad?')) {
            try {
                await deleteCity(id);
                loadData();
            } catch (error) {
                alert('Error al eliminar ciudad');
            }
        }
    };

    // --- Property Type Handlers ---
    const handleCreateType = async (e) => {
        e.preventDefault();
        try {
            await createPropertyType({ name: newTypeName, showInMenu: newTypeShowInMenu });
            setNewTypeName('');
            setNewTypeShowInMenu(false);
            loadData();
        } catch (error) {
            alert('Error al crear tipo de propiedad');
        }
    };

    const handleUpdateType = async (id, name, active, showInMenu) => {
        try {
            await updatePropertyType(id, { name, active, showInMenu });
            setEditingType(null);
            loadData();
        } catch (error) {
            alert('Error al actualizar tipo de propiedad');
        }
    };

    const handleDeleteType = async (id) => {
        if (window.confirm('¿Eliminar tipo de propiedad?')) {
            try {
                await deletePropertyType(id);
                loadData();
            } catch (error) {
                alert('Error al eliminar tipo de propiedad');
            }
        }
    };

    // --- Property Status Handlers ---
    const handleCreateStatus = async (e) => {
        e.preventDefault();
        try {
            await createPropertyStatus({ name: newStatusName });
            setNewStatusName('');
            loadData();
        } catch (error) {
            console.error('Error creating status:', error);
            alert('Error al crear estado: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdateStatus = async (id, name, active) => {
        try {
            await updatePropertyStatus(id, { name, active });
            setEditingStatus(null);
            loadData();
        } catch (error) {
            alert('Error al actualizar estado');
        }
    };

    const handleDeleteStatus = async (id) => {
        if (window.confirm('¿Eliminar estado?')) {
            try {
                await deletePropertyStatus(id);
                loadData();
            } catch (error) {
                alert('Error al eliminar estado. Puede estar en uso.');
            }
        }
    };

    // --- Config Handlers ---
    const handleConfigSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('siteTitle', configForm.siteTitle);
            if (faviconFile) formData.append('favicon', faviconFile);
            if (logoFile) formData.append('logo', logoFile);

            await updateConfig(formData);
            alert('Configuración actualizada exitosamente');
            window.location.reload(); // Recargar para aplicar cambios globales
        } catch (error) {
            console.error('Error updating config:', error);
            alert('Error al actualizar configuración');
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (type === 'favicon') setFaviconFile(file);
            else setLogoFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setConfigPreview(prev => ({ ...prev, [type]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                    <p className="text-gray-600">Gestiona usuarios y configuraciones del sistema</p>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Users className="inline-block mr-2" size={18} />
                            Usuarios
                        </button>
                        <button
                            onClick={() => setActiveTab('properties')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'properties'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Building className="inline-block mr-2" size={18} />
                            Propiedades (Ciudades/Tipos)
                        </button>
                        <button
                            onClick={() => setActiveTab('config')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'config'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Settings className="inline-block mr-2" size={18} />
                            Configuración del Portal
                        </button>
                    </nav>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-10">Cargando...</div>
                ) : (
                    <>
                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-sm text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={user.role}
                                                        onChange={async (e) => {
                                                            try {
                                                                await updateUserRole(user.id, e.target.value);
                                                                loadData();
                                                            } catch (error) {
                                                                alert('Error al actualizar rol');
                                                            }
                                                        }}
                                                        className="text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border-none focus:ring-0 cursor-pointer"
                                                    >
                                                        <option value="ADMIN">ADMIN</option>
                                                        <option value="PROPIETARIO">PROPIETARIO</option>
                                                        <option value="INQUILINO">INQUILINO</option>
                                                        <option value="GUEST">GUEST</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        user.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {user.status === 'PENDING' && (
                                                        <>
                                                            <button onClick={() => handleApproveUser(user.id, user.role)} className="text-green-600 hover:text-green-900 mr-4">Aprobar</button>
                                                            <button onClick={() => handleRejectUser(user.id)} className="text-red-600 hover:text-red-900 mr-4">Rechazar</button>
                                                        </>
                                                    )}
                                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Properties Tab (Cities & Types) */}
                        {activeTab === 'properties' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Cities */}
                                <div className="bg-white shadow rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Ciudades</h3>
                                    <form onSubmit={handleCreateCity} className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={newCityName}
                                            onChange={(e) => setNewCityName(e.target.value)}
                                            placeholder="Nueva ciudad..."
                                            className="flex-1 px-3 py-2 border rounded-md"
                                            required
                                        />
                                        <button type="submit" className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
                                            <Plus size={20} />
                                        </button>
                                    </form>
                                    <ul className="divide-y divide-gray-200">
                                        {cities.map(city => (
                                            <li key={city.id} className="py-3 flex justify-between items-center">
                                                {editingCity === city.id ? (
                                                    <div className="flex gap-2 flex-1 mr-2">
                                                        <input
                                                            type="text"
                                                            defaultValue={city.name}
                                                            id={`city-${city.id}`}
                                                            className="flex-1 px-2 py-1 border rounded"
                                                        />
                                                        <button onClick={() => handleUpdateCity(city.id, document.getElementById(`city-${city.id}`).value, city.active)} className="text-green-600">
                                                            <Check size={18} />
                                                        </button>
                                                        <button onClick={() => setEditingCity(null)} className="text-red-600">
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={city.active ? '' : 'text-gray-400 line-through'}>{city.name}</span>
                                                )}
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingCity(city.id)} className="text-blue-600 hover:text-blue-900">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => handleUpdateCity(city.id, city.name, !city.active)} className={`text-${city.active ? 'yellow' : 'green'}-600 hover:text-${city.active ? 'yellow' : 'green'}-900`}>
                                                        {city.active ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                    <button onClick={() => handleDeleteCity(city.id)} className="text-red-600 hover:text-red-900">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Property Types */}
                                <div className="bg-white shadow rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Tipos de Propiedad</h3>
                                    <form onSubmit={handleCreateType} className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={newTypeName}
                                            onChange={(e) => setNewTypeName(e.target.value)}
                                            placeholder="Nuevo tipo..."
                                            className="flex-1 px-3 py-2 border rounded-md"
                                            required
                                        />
                                        <label className="flex items-center gap-2 text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                checked={newTypeShowInMenu}
                                                onChange={(e) => setNewTypeShowInMenu(e.target.checked)}
                                                className="rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            Menú
                                        </label>
                                        <button type="submit" className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
                                            <Plus size={20} />
                                        </button>
                                    </form>
                                    <ul className="divide-y divide-gray-200">
                                        {propertyTypes.map(type => (
                                            <li key={type.id} className="py-3 flex justify-between items-center">
                                                {editingType === type.id ? (
                                                    <div className="flex gap-2 flex-1 mr-2">
                                                        <input
                                                            type="text"
                                                            defaultValue={type.name}
                                                            id={`type-${type.id}`}
                                                            className="flex-1 px-2 py-1 border rounded"
                                                        />
                                                        <label className="flex items-center gap-1 text-xs">
                                                            <input
                                                                type="checkbox"
                                                                defaultChecked={type.showInMenu}
                                                                id={`type-menu-${type.id}`}
                                                            />
                                                            Menú
                                                        </label>
                                                        <button onClick={() => handleUpdateType(type.id, document.getElementById(`type-${type.id}`).value, type.active, document.getElementById(`type-menu-${type.id}`).checked)} className="text-green-600">
                                                            <Check size={18} />
                                                        </button>
                                                        <button onClick={() => setEditingType(null)} className="text-red-600">
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={type.active ? '' : 'text-gray-400 line-through'}>{type.name}</span>
                                                )}
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingType(type.id)} className="text-blue-600 hover:text-blue-900">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateType(type.id, type.name, type.active, !type.showInMenu)}
                                                        className={`text-${type.showInMenu ? 'blue' : 'gray'}-600 hover:text-${type.showInMenu ? 'blue' : 'gray'}-900`}
                                                        title={type.showInMenu ? "Ocultar del menú" : "Mostrar en menú"}
                                                    >
                                                        <Settings size={18} />
                                                    </button>
                                                    <button onClick={() => handleUpdateType(type.id, type.name, !type.active, type.showInMenu)} className={`text-${type.active ? 'yellow' : 'green'}-600 hover:text-${type.active ? 'yellow' : 'green'}-900`}>
                                                        {type.active ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                    <button onClick={() => handleDeleteType(type.id)} className="text-red-600 hover:text-red-900">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Property Statuses */}
                                <div className="bg-white shadow rounded-lg p-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Estados de Propiedad</h3>
                                    <form onSubmit={handleCreateStatus} className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={newStatusName}
                                            onChange={(e) => setNewStatusName(e.target.value)}
                                            placeholder="Nuevo estado..."
                                            className="flex-1 px-3 py-2 border rounded-md"
                                            required
                                        />
                                        <button type="submit" className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
                                            <Plus size={20} />
                                        </button>
                                    </form>
                                    <ul className="divide-y divide-gray-200">
                                        {propertyStatuses.map(status => (
                                            <li key={status.id} className="py-3 flex justify-between items-center">
                                                {editingStatus === status.id ? (
                                                    <div className="flex gap-2 flex-1 mr-2">
                                                        <input
                                                            type="text"
                                                            defaultValue={status.name}
                                                            id={`status-${status.id}`}
                                                            className="flex-1 px-2 py-1 border rounded"
                                                        />
                                                        <button onClick={() => handleUpdateStatus(status.id, document.getElementById(`status-${status.id}`).value, status.active)} className="text-green-600">
                                                            <Check size={18} />
                                                        </button>
                                                        <button onClick={() => setEditingStatus(null)} className="text-red-600">
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className={status.active ? '' : 'text-gray-400 line-through'}>{status.name}</span>
                                                )}
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingStatus(status.id)} className="text-blue-600 hover:text-blue-900">
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={() => handleUpdateStatus(status.id, status.name, !status.active)} className={`text-${status.active ? 'yellow' : 'green'}-600 hover:text-${status.active ? 'yellow' : 'green'}-900`}>
                                                        {status.active ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                    <button onClick={() => handleDeleteStatus(status.id)} className="text-red-600 hover:text-red-900">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* Config Tab */}
                        {activeTab === 'config' && (
                            <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
                                <h3 className="text-lg font-medium text-gray-900 mb-6">Configuración del Portal</h3>
                                <form onSubmit={handleConfigSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Título del Sitio
                                        </label>
                                        <input
                                            type="text"
                                            value={configForm.siteTitle}
                                            onChange={(e) => setConfigForm({ ...configForm, siteTitle: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Habilux Inmobiliaria"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Favicon (ICO/PNG)
                                            </label>
                                            <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
                                                {configPreview.favicon ? (
                                                    <img src={configPreview.favicon} alt="Favicon Preview" className="w-16 h-16 object-contain mb-2" />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-100 rounded mb-2 flex items-center justify-center text-gray-400">
                                                        <Upload size={24} />
                                                    </div>
                                                )}
                                                <label className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                    <span>Subir archivo</span>
                                                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'favicon')} accept=".ico,.png" />
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Logo del Sitio
                                            </label>
                                            <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50">
                                                {configPreview.logo ? (
                                                    <img src={configPreview.logo} alt="Logo Preview" className="h-16 object-contain mb-2" />
                                                ) : (
                                                    <div className="w-32 h-16 bg-gray-100 rounded mb-2 flex items-center justify-center text-gray-400">
                                                        <Upload size={24} />
                                                    </div>
                                                )}
                                                <label className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-medium">
                                                    <span>Subir archivo</span>
                                                    <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'logo')} accept="image/*" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

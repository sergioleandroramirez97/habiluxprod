import { useState, useEffect } from 'react';
import { createDocumentation } from '../api/documentationApi';
import { getAllProperties } from '../api/propertyApi';
import { Upload, X } from 'lucide-react';

export default function DocumentationForm({ propertyId, onSuccess, onCancel }) {
    const [title, setTitle] = useState('');
    const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId || '');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        if (!propertyId) {
            loadProperties();
        }
    }, [propertyId]);

    const loadProperties = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const params = { limit: 100 };
            if (user.role === 'PROPIETARIO') params.ownerId = user.id;

            const data = await getAllProperties(params);
            setProperties(data.properties || []);
        } catch (error) {
            console.error('Error loading properties:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !title || !selectedPropertyId) {
            alert('Por favor complete todos los campos');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('title', title);
            formData.append('propertyId', selectedPropertyId);
            formData.append('file', file);

            await createDocumentation(formData);
            setTitle('');
            setFile(null);
            if (!propertyId) setSelectedPropertyId('');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error uploading document:', error);
            alert('Error al subir documento: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Nueva Documentación</h3>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {!propertyId && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Propiedad
                        </label>
                        <select
                            value={selectedPropertyId}
                            onChange={(e) => setSelectedPropertyId(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Seleccionar propiedad</option>
                            {properties.map(p => (
                                <option key={p.id} value={p.id}>{p.title} ({p.propertyCode})</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título del Documento
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Contrato de Alquiler 2024"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Archivo
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors relative">
                        <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                    <span>Subir un archivo</span>
                                    <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        accept=".pdf,.csv,.xls,.xlsx,image/*"
                                        required
                                    />
                                </label>
                                <p className="pl-1">o arrastrar y soltar</p>
                            </div>
                            <p className="text-xs text-gray-500">
                                PDF, Excel, CSV, Imagen hasta 10MB
                            </p>
                        </div>
                        {file && (
                            <div className="absolute inset-0 bg-white flex items-center justify-center rounded-md">
                                <div className="text-center">
                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="mt-2 text-xs text-red-600 hover:text-red-800"
                                    >
                                        Cambiar archivo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Subiendo...' : 'Subir Documento'}
                    </button>
                </div>
            </div>
        </form>
    );
}

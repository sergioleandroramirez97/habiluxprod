import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import DocumentationList from '../components/DocumentationList';
import DocumentationForm from '../components/DocumentationForm';
import { getAllProperties } from '../api/propertyApi';
import { Plus, Filter } from 'lucide-react';

export default function Documents() {
    const [searchParams] = useSearchParams();
    const initialPropertyId = searchParams.get('propertyId') || '';

    const [selectedPropertyId, setSelectedPropertyId] = useState(initialPropertyId);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [properties, setProperties] = useState([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        try {
            const params = { limit: 100 };
            if (user.role === 'PROPIETARIO') params.ownerId = user.id;
            const data = await getAllProperties(params);
            setProperties(data.properties || []);
        } catch (error) {
            console.error('Error loading properties:', error);
        }
    };

    const handleUploadSuccess = () => {
        setShowUploadModal(false);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-6">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Documentación</h1>
                        <p className="text-gray-600">Gestión de documentos de propiedades</p>
                    </div>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={20} />
                        Subir Documento
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center gap-4">
                    <Filter className="text-gray-400" size={20} />
                    <select
                        value={selectedPropertyId}
                        onChange={(e) => setSelectedPropertyId(e.target.value)}
                        className="flex-1 max-w-md px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Todas las propiedades</option>
                        {properties.map(p => (
                            <option key={p.id} value={p.id}>{p.title} ({p.propertyCode})</option>
                        ))}
                    </select>
                </div>

                {/* Content */}
                <DocumentationList
                    propertyId={selectedPropertyId}
                    refreshTrigger={refreshTrigger}
                />

                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="w-full max-w-md">
                            <DocumentationForm
                                propertyId={selectedPropertyId}
                                onSuccess={handleUploadSuccess}
                                onCancel={() => setShowUploadModal(false)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

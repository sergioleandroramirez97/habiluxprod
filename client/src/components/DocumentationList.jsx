import { useState, useEffect } from 'react';
import { getDocumentation, deleteDocumentation } from '../api/documentationApi';
import { FileText, Image, FileSpreadsheet, Trash2, Eye, Download } from 'lucide-react';

export default function DocumentationList({ propertyId, refreshTrigger }) {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewDoc, setPreviewDoc] = useState(null);

    useEffect(() => {
        loadDocs();
    }, [propertyId, refreshTrigger]);

    const loadDocs = async () => {
        try {
            setLoading(true);
            const data = await getDocumentation({ propertyId });
            setDocs(data.docs);
        } catch (error) {
            console.error('Error loading documentation:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este documento?')) {
            try {
                await deleteDocumentation(id);
                loadDocs();
            } catch (error) {
                alert('Error al eliminar documento');
            }
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'PDF': return <FileText className="text-red-500" size={40} />;
            case 'EXCEL': return <FileSpreadsheet className="text-green-500" size={40} />;
            case 'CSV': return <FileSpreadsheet className="text-green-600" size={40} />;
            case 'IMAGE': return <Image className="text-blue-500" size={40} />;
            default: return <FileText className="text-gray-500" size={40} />;
        }
    };

    if (loading) return <div className="text-center py-4">Cargando documentación...</div>;

    if (docs.length === 0) return <div className="text-center py-4 text-gray-500">No hay documentos registrados.</div>;

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {docs.map(doc => (
                    <div key={doc.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col items-center text-center relative group">
                        <div className="mb-3">
                            {getIcon(doc.fileType)}
                        </div>
                        <h3 className="font-medium text-gray-900 truncate w-full mb-1" title={doc.title}>{doc.title}</h3>
                        <p className="text-xs text-gray-500 mb-2">
                            {new Date(doc.createdAt).toLocaleDateString()} - {new Date(doc.createdAt).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-gray-400 mb-4">
                            Por: {doc.uploader.name}
                        </p>

                        <div className="flex gap-2 mt-auto">
                            <button
                                onClick={() => setPreviewDoc(doc)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                                title="Ver"
                            >
                                <Eye size={18} />
                            </button>
                            <a
                                href={`http://localhost:3000${doc.fileUrl}`}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded-full"
                                title="Descargar"
                            >
                                <Download size={18} />
                            </a>
                            <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                                title="Eliminar"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Preview Modal */}
            {previewDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-lg">{previewDoc.title}</h3>
                            <button onClick={() => setPreviewDoc(null)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 bg-gray-100 flex justify-center">
                            {previewDoc.fileType === 'IMAGE' ? (
                                <img src={`http://localhost:3000${previewDoc.fileUrl}`} alt={previewDoc.title} className="max-w-full h-auto object-contain" />
                            ) : previewDoc.fileType === 'PDF' ? (
                                <iframe src={`http://localhost:3000${previewDoc.fileUrl}`} className="w-full h-[70vh]" title="PDF Preview"></iframe>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64">
                                    {getIcon(previewDoc.fileType)}
                                    <p className="mt-4 text-gray-600">Vista previa no disponible para este tipo de archivo.</p>
                                    <a
                                        href={`http://localhost:3000${previewDoc.fileUrl}`}
                                        className="mt-2 text-blue-600 hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Descargar archivo
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Need to import X icon
import { X } from 'lucide-react';

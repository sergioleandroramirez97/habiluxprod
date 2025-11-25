import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getPaymentById, createPayment, updatePayment } from '../api/paymentApi';
import { getAllProperties } from '../api/propertyApi';
import api from '../api/axios';
import { ArrowLeft, Save, Upload, FileText, AlertCircle } from 'lucide-react';

export default function PaymentForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isEdit = Boolean(id);

    // User role detection
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';
    const isOwner = user.role === 'PROPIETARIO';
    const isTenant = user.role === 'INQUILINO';

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [properties, setProperties] = useState([]);
    const [formData, setFormData] = useState({
        propertyId: searchParams.get('propertyId') || '',
        tenantId: '',
        amount: '',
        dueDate: '',
        paymentDate: '',
        status: 'PENDING',
        paymentMethod: '',
        reference: '',
        notes: '',
        receiptUrl: ''
    });

    const isLocked = isTenant && (formData.status === 'PROCESSING' || formData.status === 'PAID');

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                // Load properties for admin/owner
                if (isAdmin || isOwner) {
                    const propsRes = await getAllProperties();
                    setProperties(propsRes.properties || []);
                }
                // Load payment if editing
                if (isEdit) {
                    const payment = await getPaymentById(id);
                    setFormData({
                        propertyId: payment.propertyId?.toString() || '',
                        tenantId: payment.tenantId?.toString() || '',
                        amount: payment.amount?.toString() || '',
                        dueDate: payment.dueDate ? payment.dueDate.split('T')[0] : '',
                        paymentDate: payment.paymentDate ? payment.paymentDate.split('T')[0] : (isTenant ? new Date().toISOString().split('T')[0] : ''),
                        status: payment.status || 'PENDING',
                        paymentMethod: payment.paymentMethod || '',
                        reference: payment.reference || '',
                        notes: payment.notes || '',
                        receiptUrl: payment.receiptUrl || ''
                    });
                }
            } catch (e) {
                console.error(e);
                setError(e.response?.data?.message || e.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [isAdmin, isOwner, isEdit, id, getAllProperties, getPaymentById]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePropertyChange = (e) => {
        const propertyId = e.target.value;
        setFormData((prev) => ({ ...prev, propertyId }));
        const selected = properties.find((p) => p.id === parseInt(propertyId));
        if (selected?.tenantId) {
            setFormData((prev) => ({ ...prev, tenantId: selected.tenantId.toString() }));
        }
    };

    // Receipt upload – tenant only
    const handleReceiptUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const form = new FormData();
        form.append('receipt', file);
        try {
            const res = await api.post(`/payments/${id}/receipt`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData((prev) => ({
                ...prev,
                receiptUrl: res.data.receiptUrl,
                status: 'PROCESSING'
            }));
        } catch (err) {
            console.error(err);
            alert('Error al subir el comprobante');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = {
                propertyId: parseInt(formData.propertyId),
                tenantId: formData.tenantId ? parseInt(formData.tenantId) : null,
                amount: parseFloat(formData.amount),
                dueDate: formData.dueDate,
                paymentDate: formData.paymentDate || null,
                status: formData.status,
                paymentMethod: formData.paymentMethod || null,
                reference: formData.reference || null,
                notes: formData.notes || null,
                receiptUrl: formData.receiptUrl || null
            };
            if (isEdit) {
                await updatePayment(id, payload);
                alert('Pago actualizado');
            } else {
                await createPayment(payload);
                alert('Pago creado');
            }
            navigate('/payments');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Error al guardar el pago');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEdit) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-500">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-6">
                <button
                    onClick={() => navigate('/payments')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Volver a Pagos
                </button>
                <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        {isEdit ? 'Editar Pago' : isTenant ? 'Actualizar Pago' : 'Crear Orden de Pago'}
                    </h1>
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-800">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}
                    {isLocked && (
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                            <div>
                                <h3 className="font-medium text-blue-900">Pago en Proceso</h3>
                                <p className="text-sm text-blue-700 mt-1">
                                    Ya has enviado el comprobante para este pago. No puedes realizar más cambios mientras está en revisión.
                                </p>
                            </div>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {(isAdmin || isOwner) && !isTenant && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Propiedad *</label>
                                <select
                                    name="propertyId"
                                    value={formData.propertyId}
                                    onChange={handlePropertyChange}
                                    required
                                    disabled={isEdit}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                >
                                    <option value="">Seleccionar propiedad</option>
                                    {properties.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.title} - {p.propertyCode}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {(isAdmin || isOwner) && formData.propertyId && !formData.tenantId && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                                <p className="font-medium flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    Advertencia
                                </p>
                                <p className="mt-1">
                                    Esta propiedad no tiene un inquilino asignado. La orden de pago se creará pero no se enviará ninguna notificación.
                                </p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Monto *</label>
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                                step="0.01"
                                min="0"
                                disabled={isTenant || isLocked}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Vencimiento *</label>
                            <input
                                type="date"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleChange}
                                required
                                disabled={isTenant || isLocked}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            />
                        </div>
                        {(isTenant || isEdit) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Pago</label>
                                <input
                                    type="date"
                                    name="paymentDate"
                                    value={formData.paymentDate}
                                    onChange={handleChange}
                                    disabled={isLocked}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Método de Pago{!isTenant && ' (Preferido)'}
                            </label>
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                                disabled={isLocked}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                            >
                                <option value="">Seleccionar método</option>
                                <option value="CASH">Efectivo</option>
                                <option value="TRANSFER">Transferencia</option>
                                <option value="CHECK">Cheque</option>
                                <option value="CARD">Tarjeta</option>
                            </select>
                        </div>
                        {(isTenant || isEdit) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Referencia/Comprobante</label>
                                <input
                                    type="text"
                                    name="reference"
                                    value={formData.reference}
                                    onChange={handleChange}
                                    disabled={isLocked}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                    placeholder="Número de referencia"
                                />
                            </div>
                        )}
                        {isAdmin && isEdit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="PENDING">Pendiente</option>
                                    <option value="PROCESSING">En proceso</option>
                                    <option value="PAID">Pagado</option>
                                    <option value="LATE">Vencido</option>
                                    <option value="CANCELLED">Cancelado</option>
                                </select>
                            </div>
                        )}
                        {isTenant && isEdit && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <label className="block text-sm font-medium text-blue-900 mb-2">
                                    Comprobante de Pago
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                                        <Upload size={20} />
                                        <span>{formData.receiptUrl ? 'Cambiar archivo' : 'Subir archivo'}</span>
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={handleReceiptUpload}
                                            disabled={isLocked}
                                            className="hidden"
                                        />
                                    </label>
                                    {formData.receiptUrl && (
                                        <a
                                            href={formData.receiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-blue-700 hover:underline"
                                        >
                                            <FileText size={20} />
                                            Ver comprobante actual
                                        </a>
                                    )}
                                </div>
                                <p className="mt-2 text-xs text-blue-600">
                                    Al subir el comprobante, el estado cambiará automáticamente a "En proceso" cuando guardes.
                                </p>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Notas adicionales..."
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading || isLocked}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                <Save size={20} />
                                {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Pago'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/payments')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

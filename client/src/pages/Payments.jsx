import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getAllPayments, getPaymentStats } from '../api/paymentApi';
import { DollarSign, Plus, TrendingUp, AlertCircle, Clock } from 'lucide-react';

export default function Payments() {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, paid, late

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isOwner = user.role === 'PROPIETARIO';
    const isTenant = user.role === 'INQUILINO';

    useEffect(() => {
        loadData();
    }, [filter]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const params = {};
            if (filter !== 'all') {
                params.status = filter.toUpperCase();
            }

            const [paymentsData, statsData] = await Promise.all([
                getAllPayments(params),
                getPaymentStats()
            ]);

            setPayments(paymentsData.payments || []);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading payments:', error);
            setError('Error al cargar los pagos. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PAID: 'bg-green-100 text-green-800',
            PENDING: 'bg-yellow-100 text-yellow-800',
            LATE: 'bg-red-100 text-red-800',
            CANCELLED: 'bg-gray-100 text-gray-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        const labels = {
            PAID: 'Pagado',
            PENDING: 'Pendiente',
            LATE: 'Vencido',
            CANCELLED: 'Cancelado'
        };
        return labels[status] || status;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isTenant ? 'Mis Pagos' : 'Gestión de Cobros'}
                    </h1>
                    <p className="text-gray-600">
                        {isTenant
                            ? 'Consulta tus pagos pendientes y sube tus comprobantes'
                            : 'Administra las solicitudes de pago de tus propiedades'}
                    </p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Cobrado este Mes</p>
                                <TrendingUp className="text-green-600" size={20} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                ${stats.thisMonthPaid.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Total Pagado</p>
                                <DollarSign className="text-blue-600" size={20} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                ${stats.totalPaid.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Pendiente</p>
                                <Clock className="text-yellow-600" size={20} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                ${stats.totalPending.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Vencido</p>
                                <AlertCircle className="text-red-600" size={20} />
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                ${stats.totalLate.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}

                {/* Filters and Actions */}
                <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Pendientes
                        </button>
                        <button
                            onClick={() => setFilter('paid')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'paid'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Pagados
                        </button>
                        <button
                            onClick={() => setFilter('late')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'late'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Vencidos
                        </button>
                    </div>
                    {!isTenant && (
                        <button
                            onClick={() => navigate('/payments/new')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={20} />
                            {isOwner ? 'Crear Solicitud' : 'Registrar Pago'}
                        </button>
                    )}
                </div>

                {/* Payments Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {error ? (
                        <div className="p-8 text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={loadData}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : loading ? (
                        <div className="p-8 text-center text-gray-500">Cargando pagos...</div>
                    ) : payments.length === 0 ? (
                        <div className="p-8 text-center">
                            <DollarSign className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500 mb-2">No hay pagos registrados</p>
                            <p className="text-sm text-gray-400">Comienza registrando el primer pago</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propiedad</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inquilino</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                                        {isTenant && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {payments.map((payment) => (
                                        <tr
                                            key={payment.id}
                                            onClick={() => navigate(`/payments/${payment.id}/edit`)}
                                            className="hover:bg-gray-50 cursor-pointer"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{payment.property.title}</p>
                                                    <p className="text-sm text-gray-500">{payment.property.propertyCode}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900">
                                                    {payment.tenant ? payment.tenant.name : '-'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">
                                                    ${payment.amount.toLocaleString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-900">
                                                    {new Date(payment.dueDate).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payment.status)}`}>
                                                    {getStatusLabel(payment.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600">
                                                    {payment.paymentMethod || '-'}
                                                </p>
                                            </td>
                                            {isTenant && (
                                                <td className="px-6 py-4">
                                                    {payment.status === 'PENDING' || payment.status === 'LATE' ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/payments/${payment.id}/edit`);
                                                            }}
                                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                                        >
                                                            Pagar
                                                        </button>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">Ver detalle</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

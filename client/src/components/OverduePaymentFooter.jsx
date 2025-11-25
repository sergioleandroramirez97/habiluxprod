import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllPayments } from '../api/paymentApi';

export default function OverduePaymentFooter() {
    const [overdueCount, setOverdueCount] = useState(0);
    const [visible, setVisible] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isTenant = user.role === 'INQUILINO';

    useEffect(() => {
        if (isTenant) {
            checkOverduePayments();
        }
    }, [isTenant]);

    const checkOverduePayments = async () => {
        try {
            // Fetch only LATE payments
            const response = await getAllPayments({ status: 'LATE' });
            if (response.payments && response.payments.length > 0) {
                setOverdueCount(response.payments.length);
            }
        } catch (error) {
            console.error('Error checking overdue payments:', error);
        }
    };

    if (!isTenant || overdueCount === 0 || !visible) return null;

    return (
        <div className="fixed bottom-0 left-64 right-0 bg-red-600 text-white p-4 shadow-lg z-50 flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                    <AlertTriangle size={24} className="text-white" />
                </div>
                <div>
                    <p className="font-bold text-lg">¡Atención! Tienes {overdueCount} pago(s) vencido(s)</p>
                    <p className="text-sm text-red-100">Por favor, regulariza tu situación lo antes posible para evitar recargos.</p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/payments?filter=late')}
                    className="px-6 py-2 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors"
                >
                    Ver Pagos
                </button>
                <button
                    onClick={() => setVisible(false)}
                    className="p-2 hover:bg-red-700 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}

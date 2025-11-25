import Sidebar from '../components/Sidebar';
import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

export default function ComingSoon() {
    const location = useLocation();

    const getModuleName = () => {
        const path = location.pathname.replace('/', '');
        const names = {
            'contracts': 'Contratos',
            'calendar': 'Calendario',
            'reports': 'Reportes',
            'chat': 'Chat'
        };
        return names[path] || 'Módulo';
    };

    const getDescription = () => {
        const path = location.pathname.replace('/', '');
        const descriptions = {
            'contracts': 'Gestión completa de contratos de arrendamiento, fechas de vencimiento y renovaciones automáticas.',
            'calendar': 'Calendario integrado con vencimientos de contratos, mantenimientos programados y pagos pendientes.',
            'reports': 'Generación de reportes personalizados, exportación a PDF/Excel y análisis de rentabilidad.',
            'chat': 'Sistema de mensajería interna entre propietarios, inquilinos y soporte técnico.'
        };
        return descriptions[path] || 'Este módulo está en desarrollo.';
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="mb-6 flex justify-center">
                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Construction size={48} className="text-yellow-600" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        {getModuleName()}
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">
                        Próximamente
                    </p>
                    <p className="text-sm text-gray-500 mb-8">
                        {getDescription()}
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            Este módulo está en desarrollo y estará disponible pronto.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex w-1/2 bg-gray-100 flex-col justify-center items-center p-12 relative overflow-hidden">
                <div className="z-10 text-center">
                    <div className="w-20 h-20 bg-slate-700 rounded-xl mx-auto mb-6 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Portal Inmobiliario</h1>
                    <p className="text-lg text-gray-600 max-w-md mx-auto">
                        Gestiona tus propiedades de manera eficiente y profesional
                    </p>
                    <div className="mt-12 space-y-4 text-left max-w-xs mx-auto">
                        <div className="flex items-center space-x-3 text-gray-700">
                            <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs">✓</div>
                            <span>Gestión completa de propiedades</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-700">
                            <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs">✓</div>
                            <span>Carga de archivos y documentos</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-700">
                            <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs">✓</div>
                            <span>Reportes y análisis avanzados</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white">
                <div className="w-full max-w-md">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;

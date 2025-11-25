import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Header from '../components/Header';
import ProfileSidebar from '../components/ProfileSidebar';
import { Upload, Trash2, User as UserIcon } from 'lucide-react';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    const [profile, setProfile] = useState({
        name: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        avatar: null,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/profile/me');
            setProfile({
                name: data.name || '',
                lastName: data.lastName || '',
                email: data.email || '',
                phone: data.phone || '',
                bio: data.bio || '',
                avatar: data.avatar || null,
            });
            if (data.avatar) {
                setAvatarPreview(`http://localhost:3000${data.avatar}`);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Error al cargar el perfil' });
        }
    };

    const handleChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { data } = await api.put('/profile/me', {
                name: profile.name,
                lastName: profile.lastName,
                phone: profile.phone,
                bio: profile.bio,
            });

            // Update user in context
            updateUser(data);

            setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
            setMessage({ type: 'error', text: 'Solo se permiten imágenes JPG y PNG' });
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'La imagen no debe superar 2MB' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const { data } = await api.post('/profile/me/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setProfile({ ...profile, avatar: data.avatar });
            setAvatarPreview(`http://localhost:3000${data.avatar}`);
            updateUser(data);

            setMessage({ type: 'success', text: 'Foto de perfil actualizada' });
        } catch (error) {
            console.error('Error uploading avatar:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Error al subir la imagen' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAvatar = async () => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) {
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const { data } = await api.delete('/profile/me/avatar');
            setProfile({ ...profile, avatar: null });
            setAvatarPreview(null);
            updateUser(data);

            setMessage({ type: 'success', text: 'Foto de perfil eliminada' });
        } catch (error) {
            console.error('Error deleting avatar:', error);
            setMessage({ type: 'error', text: 'Error al eliminar la foto' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="flex">
                <ProfileSidebar />

                <main className="flex-1 p-8">
                    <div className="max-w-3xl">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Configuración de Perfil</h1>
                        <p className="text-gray-600 mb-8">Gestiona tu información personal y configuración de cuenta</p>

                        {message.text && (
                            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        {/* Profile Photo Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-1">Foto de Perfil</h2>
                            <p className="text-sm text-gray-600 mb-6">Tu foto se mostrará en tu perfil y en las publicaciones</p>

                            <div className="flex items-center space-x-6">
                                <div className="w-24 h-24 bg-slate-200 rounded-full overflow-hidden flex items-center justify-center">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserIcon className="w-12 h-12 text-slate-400" />
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={loading}
                                            className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Upload className="w-4 h-4" />
                                            <span>Cambiar Foto</span>
                                        </button>

                                        {profile.avatar && (
                                            <button
                                                onClick={handleDeleteAvatar}
                                                disabled={loading}
                                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span>Eliminar</span>
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Recomendado: imágenes cuadradas, máximo 2MB (.JPG, .PNG)
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Personal Information Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-1">Información Personal</h2>
                            <p className="text-sm text-gray-600 mb-6">Actualiza tus datos personales y de contacto</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={profile.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                            placeholder="Carlos"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Apellido
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={profile.lastName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                            placeholder="Martínez"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">El email no puede ser modificado</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                                        placeholder="+54 9 12 3456 7890"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Biografía
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={profile.bio}
                                        onChange={handleChange}
                                        rows={4}
                                        maxLength={500}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                                        placeholder="Especialista en propiedades residenciales con más de 10 años de experiencia en el mercado inmobiliario..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Máximo 500 caracteres ({profile.bio.length}/500)
                                    </p>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;

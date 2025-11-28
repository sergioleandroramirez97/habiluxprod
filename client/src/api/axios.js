import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const baseURL = rawBase.endsWith('/api') ? rawBase : rawBase.replace(/\/+$/, '') + '/api';

const api = axios.create({
    baseURL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

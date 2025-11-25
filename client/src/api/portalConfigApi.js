import api from './axios';

export const getPublicConfig = async () => {
    const response = await api.get('/portal-config/public');
    return response.data;
};

export const getAllConfig = async () => {
    const response = await api.get('/portal-config');
    return response.data;
};

export const updateConfig = async (formData) => {
    const response = await api.put('/portal-config', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

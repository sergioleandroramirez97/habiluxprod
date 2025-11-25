import axios from './axios';

export const getDocumentation = async (params) => {
    const response = await axios.get('/documentation', { params });
    return response.data;
};

export const createDocumentation = async (formData) => {
    const response = await axios.post('/documentation', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const deleteDocumentation = async (id) => {
    const response = await axios.delete(`/documentation/${id}`);
    return response.data;
};

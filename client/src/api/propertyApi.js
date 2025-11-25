import api from './axios';

// ===== PROPERTIES =====

export const getAllProperties = async (params = {}) => {
    const response = await api.get('/properties', { params });
    return response.data;
};

export const getPropertyById = async (id) => {
    const response = await api.get(`/properties/${id}`);
    return response.data;
};

export const createProperty = async (formData) => {
    const response = await api.post('/properties', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const updateProperty = async (id, formData) => {
    const response = await api.put(`/properties/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
};

export const deleteProperty = async (id) => {
    const response = await api.delete(`/properties/${id}`);
    return response.data;
};

// ===== CONFIGURATION =====

export const getCities = async () => {
    const response = await api.get('/config/cities');
    return response.data;
};

export const createCity = async (data) => {
    const response = await api.post('/config/cities', data);
    return response.data;
};

export const updateCity = async (id, data) => {
    const response = await api.put(`/config/cities/${id}`, data);
    return response.data;
};

export const deleteCity = async (id) => {
    const response = await api.delete(`/config/cities/${id}`);
    return response.data;
};

export const getPropertyTypes = async () => {
    const response = await api.get('/config/property-types');
    return response.data;
};

export const createPropertyType = async (data) => {
    const response = await api.post('/config/property-types', data);
    return response.data;
};

export const updatePropertyType = async (id, data) => {
    const response = await api.put(`/config/property-types/${id}`, data);
    return response.data;
};

export const deletePropertyType = async (id) => {
    const response = await api.delete(`/config/property-types/${id}`);
    return response.data;
};

export const getPropertyStatuses = async () => {
    const response = await api.get('/config/property-statuses');
    return response.data;
};

export const createPropertyStatus = async (data) => {
    const response = await api.post('/config/property-statuses', data);
    return response.data;
};

export const updatePropertyStatus = async (id, data) => {
    const response = await api.put(`/config/property-statuses/${id}`, data);
    return response.data;
};

export const deletePropertyStatus = async (id) => {
    const response = await api.delete(`/config/property-statuses/${id}`);
    return response.data;
};

// ===== USERS (for selects) =====

export const getOwners = async () => {
    const response = await api.get('/admin/users');
    // Filtrar solo usuarios con rol PROPIETARIO y estado APPROVED
    const owners = (response.data.users || []).filter(user => user.role === 'PROPIETARIO' && user.status === 'APPROVED');
    return { users: owners };
};

export const getTenants = async () => {
    const response = await api.get('/admin/users');
    // Filtrar solo usuarios con rol INQUILINO y estado APPROVED
    const tenants = (response.data.users || []).filter(user => user.role === 'INQUILINO' && user.status === 'APPROVED');
    return { users: tenants };
};

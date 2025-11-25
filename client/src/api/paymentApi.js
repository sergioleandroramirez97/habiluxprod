import api from './axios';

export const getAllPayments = async (params = {}) => {
    const response = await api.get('/payments', { params });
    return response.data;
};

export const getPaymentById = async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
};

export const createPayment = async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
};

export const updatePayment = async (id, paymentData) => {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
};

export const deletePayment = async (id) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
};

export const getPaymentStats = async () => {
    const response = await api.get('/payments/stats');
    return response.data;
};

export const getUpcomingPayments = async (days = 7) => {
    const response = await api.get('/payments/upcoming', { params: { days } });
    return response.data;
};

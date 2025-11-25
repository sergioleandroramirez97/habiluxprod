import axios from './axios';

// Get all users
export const getUsers = async () => {
    const response = await axios.get('/admin/users');
    return response.data;
};

// Update user status
export const updateUserStatus = async (userId, status) => {
    const response = await axios.put(`/admin/users/${userId}/status`, { status });
    return response.data;
};

// Update user role
export const updateUserRole = async (userId, role) => {
    const response = await axios.put(`/admin/users/${userId}/role`, { role });
    return response.data;
};

// Delete user
export const deleteUser = async (userId) => {
    const response = await axios.delete(`/admin/users/${userId}`);
    return response.data;
};

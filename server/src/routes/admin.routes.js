const express = require('express');
const router = express.Router();
const {
    getUsers,
    approveUser,
    rejectUser,
    getFields,
    createField,
    updateField,
    deleteField,
    updateUserRole,
    updateUserStatus,
    deleteUser
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// User management routes (protected, admin only)
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/approve', protect, admin, approveUser);
router.put('/users/:id/reject', protect, admin, rejectUser);
router.put('/users/:id/status', protect, admin, updateUserStatus);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);

// Dynamic field management routes (protected, admin only)
router.get('/fields', protect, admin, getFields);
router.post('/fields', protect, admin, createField);
router.put('/fields/:id', protect, admin, updateField);
router.delete('/fields/:id', protect, admin, deleteField);

// Public route for registration form
router.get('/public/fields', getFields);

module.exports = router;

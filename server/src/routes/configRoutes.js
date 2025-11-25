const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getCities,
    createCity,
    updateCity,
    deleteCity,
    getPropertyTypes,
    createPropertyType,
    updatePropertyType,
    deletePropertyType,
    getPropertyStatuses,
    createPropertyStatus,
    updatePropertyStatus,
    deletePropertyStatus
} = require('../controllers/configController');

// Todas las rutas de configuración requieren autenticación y rol ADMIN

// Cities
router.get('/cities', protect, getCities);
router.post('/cities', protect, adminOnly, createCity);
router.put('/cities/:id', protect, adminOnly, updateCity);
router.delete('/cities/:id', protect, adminOnly, deleteCity);

// Property Types
router.get('/property-types', protect, getPropertyTypes);
router.post('/property-types', protect, adminOnly, createPropertyType);
router.put('/property-types/:id', protect, adminOnly, updatePropertyType);
router.delete('/property-types/:id', protect, adminOnly, deletePropertyType);

// Property Statuses
router.get('/property-statuses', protect, getPropertyStatuses);
router.post('/property-statuses', protect, adminOnly, createPropertyStatus);
router.put('/property-statuses/:id', protect, adminOnly, updatePropertyStatus);
router.delete('/property-statuses/:id', protect, adminOnly, deletePropertyStatus);

module.exports = router;

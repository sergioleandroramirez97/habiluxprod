const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const uploadProperty = require('../middleware/uploadProperty');
const {
    getAllProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty
} = require('../controllers/propertyController');

// Rutas públicas (protegidas pero accesibles para usuarios autenticados)
router.get('/', protect, getAllProperties);
router.get('/:id', protect, getPropertyById);

// Rutas solo para ADMIN
router.post('/', protect, adminOnly, uploadProperty.single('image'), createProperty);
router.put('/:id', protect, adminOnly, uploadProperty.single('image'), updateProperty);
router.delete('/:id', protect, adminOnly, deleteProperty);

module.exports = router;

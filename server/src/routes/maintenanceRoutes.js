const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
    getAllMaintenances,
    getMaintenanceById,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance
} = require('../controllers/maintenanceController');

// Rutas protegidas (usuarios autenticados pueden ver y crear)
router.get('/', protect, getAllMaintenances);
router.get('/:id', protect, getMaintenanceById);
router.post('/', protect, createMaintenance);
router.put('/:id', protect, updateMaintenance); // Ahora usuarios pueden cancelar
router.delete('/:id', protect, adminOnly, deleteMaintenance);

module.exports = router;

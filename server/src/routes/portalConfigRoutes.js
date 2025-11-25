const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const uploadConfig = require('../middleware/uploadConfig');
const {
    getPublicConfig,
    getAllConfig,
    updateConfig
} = require('../controllers/portalConfigController');

// Ruta pública para obtener configuración básica
router.get('/public', getPublicConfig);

// Rutas protegidas para admin
router.get('/', protect, adminOnly, getAllConfig);
router.put('/', protect, adminOnly, uploadConfig.fields([
    { name: 'favicon', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
]), updateConfig);

module.exports = router;

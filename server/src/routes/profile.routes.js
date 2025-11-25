const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadAvatar, deleteAvatar } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Profile routes (all protected)
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/me/avatar', protect, deleteAvatar);

module.exports = router;

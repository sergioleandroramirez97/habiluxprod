const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadReceipt');
const {
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    getPaymentStats,
    getUpcomingPayments
} = require('../controllers/paymentController');

router.get('/', protect, getAllPayments);
router.get('/stats', protect, getPaymentStats);
router.get('/upcoming', protect, getUpcomingPayments);
router.get('/:id', protect, getPaymentById);
router.post('/', protect, createPayment);
router.put('/:id', protect, updatePayment);
router.delete('/:id', protect, adminOnly, deletePayment);

// Upload receipt endpoint
router.post('/:id/receipt', protect, upload.single('receipt'), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { property: true }
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Permission check - tenant can only upload for their payments
        if (userRole === 'INQUILINO' && payment.tenantId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const receiptUrl = `/uploads/receipts/${req.file.filename}`;

        const updateData = {
            receiptUrl
        };

        // Auto-change to PROCESSING when tenant uploads receipt
        if (userRole === 'INQUILINO' && payment.status === 'PENDING') {
            updateData.status = 'PROCESSING';
        }

        const updatedPayment = await prisma.payment.update({
            where: { id },
            data: updateData,
            include: {
                property: { select: { id: true, title: true, propertyCode: true } },
                tenant: { select: { id: true, name: true, email: true } },
                createdBy: { select: { id: true, name: true } }
            }
        });

        res.json(updatedPayment);
    } catch (error) {
        console.error('Error uploading receipt:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;

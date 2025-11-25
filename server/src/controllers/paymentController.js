const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createPaymentOrderNotification, createPaymentPaidNotification, createPaymentStatusNotification } = require('../helpers/notificationHelper');

// Get all payments with filters
const getAllPayments = async (req, res) => {
    try {
        const { propertyId, tenantId, status, startDate, endDate, page = 1, limit = 20 } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        const where = {};
        if (propertyId) where.propertyId = parseInt(propertyId);
        if (tenantId) where.tenantId = parseInt(tenantId);
        if (status) where.status = status;

        // Date range filter
        if (startDate || endDate) {
            where.dueDate = {};
            if (startDate) where.dueDate.gte = new Date(startDate);
            if (endDate) where.dueDate.lte = new Date(endDate);
        }

        // Permission filtering
        if (userRole !== 'ADMIN') {
            if (userRole === 'PROPIETARIO') {
                where.property = { ownerId: userId };
            } else if (userRole === 'INQUILINO') {
                where.tenantId = userId;
            } else {
                return res.status(403).json({ message: 'Unauthorized' });
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                include: {
                    property: { select: { id: true, title: true, propertyCode: true } },
                    tenant: { select: { id: true, name: true, email: true } },
                    createdBy: { select: { id: true, name: true } }
                },
                skip,
                take: parseInt(limit),
                orderBy: { dueDate: 'desc' }
            }),
            prisma.payment.count({ where })
        ]);

        res.json({
            payments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get payment by ID
const getPaymentById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        propertyCode: true,
                        address: true,
                        ownerId: true
                    }
                },
                tenant: { select: { id: true, name: true, email: true, phone: true } },
                createdBy: { select: { id: true, name: true, email: true } }
            }
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Permission check
        if (userRole !== 'ADMIN') {
            if (userRole === 'PROPIETARIO' && payment.property.ownerId !== userId) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            if (userRole === 'INQUILINO' && payment.tenantId !== userId) {
                return res.status(403).json({ message: 'Not authorized' });
            }
        }

        res.json(payment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create payment
const createPayment = async (req, res) => {
    try {
        const { propertyId, tenantId, amount, paymentDate, dueDate, status, paymentMethod, reference, notes } = req.body;
        const createdById = req.user.id;

        if (!propertyId || !amount || !dueDate) {
            return res.status(400).json({ message: 'Property, amount and due date are required' });
        }

        // Verify property exists
        const property = await prisma.property.findUnique({
            where: { id: parseInt(propertyId) }
        });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Permission check: Admin can create for any property, Owner only for their properties
        if (req.user.role !== 'ADMIN' && req.user.role === 'PROPIETARIO' && property.ownerId !== createdById) {
            return res.status(403).json({ message: 'You can only create payments for your properties' });
        }

        const payment = await prisma.payment.create({
            data: {
                propertyId: parseInt(propertyId),
                tenantId: tenantId ? parseInt(tenantId) : null,
                amount: parseFloat(amount),
                paymentDate: paymentDate ? new Date(paymentDate) : null,
                dueDate: new Date(dueDate),
                status: status || 'PENDING',
                paymentMethod: paymentMethod || null,
                reference: reference || null,
                notes: notes || null,
                createdById
            },
            include: {
                property: { select: { id: true, title: true, propertyCode: true } },
                tenant: { select: { id: true, name: true, email: true } },
                createdBy: { select: { id: true, name: true } }
            }
        });

        // Send notification to tenant
        try {
            await createPaymentOrderNotification(payment, payment.property);
        } catch (notifError) {
            console.error('Error sending notification (non-critical):', notifError);
            // Don't fail the request if notification fails
        }

        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update payment
const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, paymentDate, dueDate, status, paymentMethod, reference, notes, receiptUrl } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        const payment = await prisma.payment.findUnique({
            where: { id },
            include: { property: true }
        });

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }

        // Permission check
        if (userRole !== 'ADMIN' && userRole === 'PROPIETARIO' && payment.property.ownerId !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Tenants can only update payment info, not status (unless uploading receipt)
        if (userRole === 'INQUILINO') {
            if (payment.tenantId !== userId) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            // Lock if already processing or paid
            if (payment.status === 'PROCESSING' || payment.status === 'PAID') {
                return res.status(403).json({ message: 'Cannot edit payment in this status' });
            }
        }

        const updateData = {};
        if (amount !== undefined && userRole !== 'INQUILINO') updateData.amount = parseFloat(amount);
        if (paymentDate !== undefined) updateData.paymentDate = paymentDate ? new Date(paymentDate) : null;
        if (dueDate !== undefined && userRole !== 'INQUILINO') updateData.dueDate = new Date(dueDate);

        // Only admin and owner can change status manually
        if (status && (userRole === 'ADMIN' || userRole === 'PROPIETARIO')) {
            updateData.status = status;
        }

        if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
        if (reference !== undefined) updateData.reference = reference;
        if (notes !== undefined) updateData.notes = notes;
        if (receiptUrl !== undefined) {
            updateData.receiptUrl = receiptUrl;
            // Auto-change to PROCESSING when tenant uploads receipt
            if (userRole === 'INQUILINO' && payment.status === 'PENDING') {
                updateData.status = 'PROCESSING';
            }
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

        // Send notification if status changed
        if (updatedPayment.status !== payment.status) {
            await createPaymentStatusNotification(updatedPayment, payment.property, payment.status);
        }

        res.json(updatedPayment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete payment (Admin only)
const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.payment.delete({
            where: { id }
        });

        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get payment statistics
const getPaymentStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        const where = {};
        if (userRole !== 'ADMIN') {
            if (userRole === 'PROPIETARIO') {
                where.property = { ownerId: userId };
            } else if (userRole === 'INQUILINO') {
                where.tenantId = userId;
            }
        }

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const [totalPaid, totalPending, totalLate, thisMonthPaid] = await Promise.all([
            prisma.payment.aggregate({
                where: { ...where, status: 'PAID' },
                _sum: { amount: true }
            }),
            prisma.payment.aggregate({
                where: { ...where, status: 'PENDING' },
                _sum: { amount: true }
            }),
            prisma.payment.aggregate({
                where: { ...where, status: 'LATE' },
                _sum: { amount: true }
            }),
            prisma.payment.aggregate({
                where: {
                    ...where,
                    status: 'PAID',
                    paymentDate: {
                        gte: firstDayOfMonth,
                        lte: lastDayOfMonth
                    }
                },
                _sum: { amount: true }
            })
        ]);

        res.json({
            totalPaid: totalPaid._sum.amount || 0,
            totalPending: totalPending._sum.amount || 0,
            totalLate: totalLate._sum.amount || 0,
            thisMonthPaid: thisMonthPaid._sum.amount || 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get upcoming payments (for reminders)
const getUpcomingPayments = async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        const where = {
            status: 'PENDING',
            dueDate: {
                gte: new Date(),
                lte: new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000)
            }
        };

        if (userRole !== 'ADMIN') {
            if (userRole === 'PROPIETARIO') {
                where.property = { ownerId: userId };
            } else if (userRole === 'INQUILINO') {
                where.tenantId = userId;
            }
        }

        const payments = await prisma.payment.findMany({
            where,
            include: {
                property: { select: { id: true, title: true, propertyCode: true } },
                tenant: { select: { id: true, name: true, email: true } }
            },
            orderBy: { dueDate: 'asc' }
        });

        res.json({ payments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    getPaymentStats,
    getUpcomingPayments
};

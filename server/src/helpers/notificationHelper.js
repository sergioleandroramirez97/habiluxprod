const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create notifications for multiple users
 */
const notifyUsers = async (userIds, notificationData) => {
    try {
        // SQLite doesn't support createMany, so we create individually
        const promises = userIds.map(userId =>
            prisma.notification.create({
                data: {
                    userId,
                    ...notificationData
                }
            })
        );

        await Promise.all(promises);
    } catch (error) {
        console.error('Error creating notifications:', error);
    }
};

/**
 * Create notification for maintenance creation
 */
const createMaintenanceNotification = async (maintenance, property) => {
    try {
        const userIds = [];

        // Notify property owner
        if (property.ownerId && property.ownerId !== maintenance.requesterId) {
            userIds.push(property.ownerId);
        }

        // Notify admin users
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
        });
        admins.forEach(admin => {
            if (admin.id !== maintenance.requesterId) {
                userIds.push(admin.id);
            }
        });

        if (userIds.length > 0) {
            await notifyUsers(userIds, {
                type: 'MAINTENANCE_CREATED',
                title: 'Nuevo Mantenimiento',
                message: `Se ha creado un nuevo reporte de mantenimiento para ${property.title}: ${maintenance.summary}`,
                relatedId: maintenance.id,
                relatedType: 'MAINTENANCE'
            });
        }
    } catch (error) {
        console.error('Error creating maintenance notification:', error);
    }
};

/**
 * Create notification for maintenance status change
 */
const createMaintenanceStatusNotification = async (maintenance, property, oldStatus) => {
    try {
        const userIds = [];

        // Notify requester if they're not the one making the change
        if (maintenance.requesterId) {
            userIds.push(maintenance.requesterId);
        }

        // Notify property owner
        if (property.ownerId && property.ownerId !== maintenance.requesterId) {
            userIds.push(property.ownerId);
        }

        if (userIds.length > 0) {
            await notifyUsers(userIds, {
                type: 'MAINTENANCE_STATUS_CHANGED',
                title: 'Estado de Mantenimiento Actualizado',
                message: `El mantenimiento "${maintenance.summary}" cambió de ${oldStatus} a ${maintenance.status}`,
                relatedId: maintenance.id,
                relatedType: 'MAINTENANCE'
            });
        }
    } catch (error) {
        console.error('Error creating maintenance status notification:', error);
    }
};

/**
 * Create notification for documentation upload
 */
const createDocumentationNotification = async (documentation, property) => {
    try {
        const userIds = [];

        // Notify property owner
        if (property.ownerId && property.ownerId !== documentation.uploaderId) {
            userIds.push(property.ownerId);
        }

        // Notify admin users
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
        });
        admins.forEach(admin => {
            if (admin.id !== documentation.uploaderId) {
                userIds.push(admin.id);
            }
        });

        if (userIds.length > 0) {
            await notifyUsers(userIds, {
                type: 'DOCUMENTATION_UPLOADED',
                title: 'Nueva Documentación',
                message: `Se ha subido un nuevo documento para ${property.title}: ${documentation.title}`,
                relatedId: documentation.id,
                relatedType: 'DOCUMENTATION'
            });
        }
    } catch (error) {
        console.error('Error creating documentation notification:', error);
    }
};

/**
 * Create notification for payment order creation
 */
const createPaymentOrderNotification = async (payment, property) => {
    try {
        const userIds = [];

        // Notify tenant if assigned
        if (payment.tenantId && payment.tenantId !== payment.createdById) {
            userIds.push(payment.tenantId);
        }

        if (userIds.length > 0) {
            await notifyUsers(userIds, {
                type: 'PAYMENT_ORDER_CREATED',
                title: 'Nueva Orden de Pago',
                message: `Tienes un nuevo pago pendiente para ${property.title} por $${payment.amount.toLocaleString()}. Vence el ${new Date(payment.dueDate).toLocaleDateString()}`,
                relatedId: payment.id,
                relatedType: 'PAYMENT'
            });
        }
    } catch (error) {
        console.error('Error creating payment order notification:', error);
    }
};

/**
 * Create notification when payment is marked as paid
 */
const createPaymentPaidNotification = async (payment, property) => {
    try {
        const userIds = [];

        // Notify property owner
        if (property.ownerId && property.ownerId !== payment.tenantId) {
            userIds.push(property.ownerId);
        }

        // Notify admin users
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
        });
        admins.forEach(admin => {
            if (admin.id !== payment.tenantId) {
                userIds.push(admin.id);
            }
        });

        if (userIds.length > 0) {
            await notifyUsers(userIds, {
                type: 'PAYMENT_RECEIVED',
                title: 'Pago Recibido',
                message: `Se ha registrado el pago de $${payment.amount.toLocaleString()} para ${property.title}`,
                relatedId: payment.id,
                relatedType: 'PAYMENT'
            });
        }
    } catch (error) {
        console.error('Error creating payment received notification:', error);
    }
};

/**
 * Create notification for payment status change
 */
const createPaymentStatusNotification = async (payment, property, oldStatus) => {
    try {
        const userIds = [];

        // Notify tenant
        if (payment.tenantId && payment.tenantId !== payment.createdById) {
            userIds.push(payment.tenantId);
        }

        // Notify owner if tenant updated it (e.g. uploaded receipt -> PROCESSING)
        // or if admin updated it
        if (property.ownerId && property.ownerId !== payment.tenantId) {
            // Avoid duplicates if owner is also the creator/updater in some contexts
            if (!userIds.includes(property.ownerId)) {
                userIds.push(property.ownerId);
            }
        }

        if (userIds.length > 0) {
            let title = 'Estado de Pago Actualizado';
            let message = `El pago de $${payment.amount.toLocaleString()} para ${property.title} ha cambiado de estado: ${oldStatus} -> ${payment.status}`;

            // Customize message based on status
            if (payment.status === 'PROCESSING') {
                title = 'Comprobante Subido';
                message = `Se ha subido un comprobante para el pago de ${property.title}. El estado es ahora: En Proceso.`;
            } else if (payment.status === 'LATE') {
                title = 'Pago Vencido';
                message = `El pago de ${property.title} ha vencido.`;
            }

            await notifyUsers(userIds, {
                type: 'PAYMENT_STATUS_CHANGED',
                title,
                message,
                relatedId: payment.id,
                relatedType: 'PAYMENT'
            });
        }
    } catch (error) {
        console.error('Error creating payment status notification:', error);
    }
};

module.exports = {
    notifyUsers,
    createMaintenanceNotification,
    createMaintenanceStatusNotification,
    createDocumentationNotification,
    createPaymentOrderNotification,
    createPaymentPaidNotification,
    createPaymentStatusNotification
};

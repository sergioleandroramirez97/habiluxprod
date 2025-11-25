const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createMaintenanceNotification, createMaintenanceStatusNotification } = require('../helpers/notificationHelper');

// Obtener todos los mantenimientos con filtros
const getAllMaintenances = async (req, res) => {
    try {
        const { propertyId, status, ownerId, page = 1, limit = 10 } = req.query;

        const where = {};
        if (propertyId) where.propertyId = parseInt(propertyId);
        if (status) where.status = status;

        // Si se filtra por ownerId, buscar mantenimientos de propiedades del propietario
        if (ownerId) {
            where.property = {
                ownerId: parseInt(ownerId)
            };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [maintenances, total] = await Promise.all([
            prisma.maintenance.findMany({
                where,
                include: {
                    property: { select: { id: true, title: true, propertyCode: true } },
                    requester: { select: { id: true, name: true, email: true } }
                },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.maintenance.count({ where })
        ]);

        res.json({
            maintenances,
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

// Obtener un mantenimiento por ID
const getMaintenanceById = async (req, res) => {
    try {
        const { id } = req.params;

        const maintenance = await prisma.maintenance.findUnique({
            where: { id },
            include: {
                property: { select: { id: true, title: true, propertyCode: true, address: true } },
                requester: { select: { id: true, name: true, email: true, phone: true } }
            }
        });

        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance not found' });
        }

        res.json(maintenance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Crear nuevo mantenimiento
const createMaintenance = async (req, res) => {
    try {
        const { propertyId, summary, description } = req.body;
        const requesterId = req.user.id; // Usuario autenticado

        if (!propertyId || !summary) {
            return res.status(400).json({ message: 'Property and summary are required' });
        }

        // Verificar que la propiedad existe
        const property = await prisma.property.findUnique({ where: { id: parseInt(propertyId) } });
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        const maintenance = await prisma.maintenance.create({
            data: {
                propertyId: parseInt(propertyId),
                requesterId,
                summary,
                description: description || null,
                status: 'ABIERTO'
            },
            include: {
                property: { select: { id: true, title: true, propertyCode: true } },
                requester: { select: { id: true, name: true, email: true } }
            }
        });

        // Create notification
        await createMaintenanceNotification(maintenance, property);

        res.status(201).json(maintenance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Actualizar mantenimiento
const updateMaintenance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, summary, description } = req.body;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'ADMIN';

        // Obtener el mantenimiento actual
        const maintenance = await prisma.maintenance.findUnique({
            where: { id },
            include: { requester: true }
        });

        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance not found' });
        }

        // Validar permisos
        if (!isAdmin) {
            // Usuario regular solo puede cancelar sus propios mantenimientos
            if (maintenance.requesterId !== userId) {
                return res.status(403).json({ message: 'No tienes permiso para modificar este mantenimiento' });
            }
            if (status && status !== 'CANCELADO') {
                return res.status(403).json({ message: 'Solo puedes cancelar tus mantenimientos' });
            }
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (summary) updateData.summary = summary;
        if (description !== undefined) updateData.description = description;

        const oldStatus = maintenance.status;

        const updatedMaintenance = await prisma.maintenance.update({
            where: { id },
            data: updateData,
            include: {
                property: { select: { id: true, title: true, propertyCode: true, ownerId: true } },
                requester: { select: { id: true, name: true, email: true } }
            }
        });

        // Create notification if status changed
        if (status && status !== oldStatus) {
            await createMaintenanceStatusNotification(updatedMaintenance, updatedMaintenance.property, oldStatus);
        }

        res.json(updatedMaintenance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Eliminar mantenimiento (solo ADMIN)
const deleteMaintenance = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.maintenance.delete({
            where: { id }
        });

        res.json({ message: 'Maintenance deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllMaintenances,
    getMaintenanceById,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance
};

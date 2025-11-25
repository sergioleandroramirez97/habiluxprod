const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generar código único de propiedad
const generatePropertyCode = async () => {
    let code;
    let exists = true;

    while (exists) {
        code = 'PR' + Math.floor(100000 + Math.random() * 900000);
        const property = await prisma.property.findUnique({ where: { propertyCode: code } });
        exists = !!property;
    }

    return code;
};

// Obtener todas las propiedades con filtros
const getAllProperties = async (req, res) => {
    try {
        const { cityId, propertyTypeId, status, search, ownerId, page = 1, limit = 10 } = req.query;

        const where = {};
        if (cityId) where.cityId = parseInt(cityId);
        if (propertyTypeId) where.propertyTypeId = parseInt(propertyTypeId);
        if (status) where.status = status;
        if (ownerId) where.ownerId = parseInt(ownerId);
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { propertyCode: { contains: search } },
                { address: { contains: search } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where,
                include: {
                    city: true,
                    propertyType: true,
                    owner: { select: { id: true, name: true, email: true } },
                    tenant: { select: { id: true, name: true, email: true } }
                },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.property.count({ where })
        ]);

        res.json({
            properties,
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

// Obtener una propiedad por ID
const getPropertyById = async (req, res) => {
    try {
        const { id } = req.params;

        const property = await prisma.property.findUnique({
            where: { id: parseInt(id) },
            include: {
                city: true,
                propertyType: true,
                owner: { select: { id: true, name: true, email: true, phone: true } },
                tenant: { select: { id: true, name: true, email: true, phone: true } }
            }
        });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.json(property);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Crear nueva propiedad (solo ADMIN)
const createProperty = async (req, res) => {
    try {
        const {
            title,
            ownerId,
            tenantId,
            cityId,
            address,
            parkingSpots,
            warehouses,
            deedNumber,
            propertyTypeId,
            rentValue
        } = req.body;

        // Validar que el owner existe y es PROPIETARIO
        const owner = await prisma.user.findUnique({ where: { id: parseInt(ownerId) } });
        if (!owner || owner.role !== 'PROPIETARIO') {
            return res.status(400).json({ message: 'Invalid owner' });
        }

        // Validar tenant si se proporciona
        if (tenantId) {
            const tenant = await prisma.user.findUnique({ where: { id: parseInt(tenantId) } });
            if (!tenant || tenant.role !== 'INQUILINO') {
                return res.status(400).json({ message: 'Invalid tenant' });
            }
        }

        const propertyCode = await generatePropertyCode();

        const property = await prisma.property.create({
            data: {
                propertyCode,
                title,
                ownerId: parseInt(ownerId),
                tenantId: tenantId ? parseInt(tenantId) : null,
                cityId: parseInt(cityId),
                address,
                parkingSpots: parseInt(parkingSpots) || 0,
                warehouses: parseInt(warehouses) || 0,
                deedNumber,
                propertyTypeId: parseInt(propertyTypeId),
                rentValue: parseFloat(rentValue),
                image: req.file ? `/uploads/properties/${req.file.filename}` : null
            },
            include: {
                city: true,
                propertyType: true,
                owner: { select: { id: true, name: true, email: true } },
                tenant: { select: { id: true, name: true, email: true } }
            }
        });

        res.status(201).json(property);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Actualizar propiedad (solo ADMIN)
const updateProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            ownerId,
            tenantId,
            cityId,
            address,
            parkingSpots,
            warehouses,
            deedNumber,
            propertyTypeId,
            rentValue,
            status
        } = req.body;

        const updateData = {};
        if (title) updateData.title = title;
        if (ownerId) updateData.ownerId = parseInt(ownerId);
        if (tenantId !== undefined) updateData.tenantId = tenantId ? parseInt(tenantId) : null;
        if (cityId) updateData.cityId = parseInt(cityId);
        if (address) updateData.address = address;
        if (parkingSpots !== undefined) updateData.parkingSpots = parseInt(parkingSpots);
        if (warehouses !== undefined) updateData.warehouses = parseInt(warehouses);
        if (deedNumber !== undefined) updateData.deedNumber = deedNumber;
        if (propertyTypeId) updateData.propertyTypeId = parseInt(propertyTypeId);
        if (rentValue) updateData.rentValue = parseFloat(rentValue);
        if (status) updateData.status = status;
        if (req.file) updateData.image = `/uploads/properties/${req.file.filename}`;

        const property = await prisma.property.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                city: true,
                propertyType: true,
                owner: { select: { id: true, name: true, email: true } },
                tenant: { select: { id: true, name: true, email: true } }
            }
        });

        res.json(property);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Eliminar propiedad (solo ADMIN)
const deleteProperty = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.property.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty
};

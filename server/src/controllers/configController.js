const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===== CITIES =====

const getCities = async (req, res) => {
    try {
        const cities = await prisma.city.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(cities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createCity = async (req, res) => {
    try {
        const { name } = req.body;

        const city = await prisma.city.create({
            data: { name }
        });

        res.status(201).json(city);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'City already exists' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateCity = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, active } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (active !== undefined) updateData.active = active;

        const city = await prisma.city.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json(city);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteCity = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si hay propiedades asociadas
        const propertiesCount = await prisma.property.count({
            where: { cityId: parseInt(id) }
        });

        if (propertiesCount > 0) {
            return res.status(400).json({
                message: `Cannot delete city. ${propertiesCount} properties are associated with it.`
            });
        }

        await prisma.city.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'City deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ===== PROPERTY TYPES =====

const getPropertyTypes = async (req, res) => {
    try {
        const propertyTypes = await prisma.propertyType.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(propertyTypes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createPropertyType = async (req, res) => {
    try {
        const { name, showInMenu } = req.body;

        const propertyType = await prisma.propertyType.create({
            data: { name, showInMenu: showInMenu || false }
        });

        res.status(201).json(propertyType);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Property type already exists' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updatePropertyType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, active, showInMenu } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (active !== undefined) updateData.active = active;
        if (showInMenu !== undefined) updateData.showInMenu = showInMenu;

        const propertyType = await prisma.propertyType.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json(propertyType);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deletePropertyType = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si hay propiedades asociadas
        const propertiesCount = await prisma.property.count({
            where: { propertyTypeId: parseInt(id) }
        });

        if (propertiesCount > 0) {
            return res.status(400).json({
                message: `Cannot delete property type. ${propertiesCount} properties are associated with it.`
            });
        }

        await prisma.propertyType.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Property type deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



// ===== PROPERTY STATUSES =====

const getPropertyStatuses = async (req, res) => {
    try {
        const statuses = await prisma.propertyStatus.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(statuses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createPropertyStatus = async (req, res) => {
    try {
        const { name } = req.body;
        const status = await prisma.propertyStatus.create({
            data: { name }
        });
        res.status(201).json(status);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'Status already exists' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updatePropertyStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, active } = req.body;

        // If renaming, we need to update existing properties
        if (name) {
            const oldStatus = await prisma.propertyStatus.findUnique({
                where: { id: parseInt(id) }
            });

            if (oldStatus && oldStatus.name !== name) {
                // Update all properties with the old status name
                await prisma.property.updateMany({
                    where: { status: oldStatus.name },
                    data: { status: name }
                });
            }
        }

        const status = await prisma.propertyStatus.update({
            where: { id: parseInt(id) },
            data: { name, active }
        });

        res.json(status);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deletePropertyStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if used
        const status = await prisma.propertyStatus.findUnique({ where: { id: parseInt(id) } });
        if (status) {
            const count = await prisma.property.count({ where: { status: status.name } });
            if (count > 0) {
                return res.status(400).json({ message: `Cannot delete status. ${count} properties use it.` });
            }
        }

        await prisma.propertyStatus.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Status deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
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
};

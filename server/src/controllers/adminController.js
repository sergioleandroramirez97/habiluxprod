const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                dynamicData: true,
                createdAt: true,
            },
        });
        res.json({ users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const approveUser = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                status: 'APPROVED',
                role: role || 'INQUILINO',
            },
        });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const rejectUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                status: 'REJECTED',
            },
        });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getFields = async (req, res) => {
    try {
        const fields = await prisma.dynamicField.findMany({
            orderBy: {
                order: 'asc',
            },
        });
        res.json(fields);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const createField = async (req, res) => {
    const { label, type, required, options, order, active } = req.body;
    const name = label.toLowerCase().replace(/\s+/g, '_');

    try {
        const field = await prisma.dynamicField.create({
            data: {
                label,
                name,
                type,
                required: required || false,
                options: options || null,
                order: order || 0,
                active: active !== undefined ? active : true,
            },
        });
        res.json(field);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateField = async (req, res) => {
    const { id } = req.params;
    const { label, type, required, options, order, active } = req.body;

    try {
        const updateData = {};
        if (label !== undefined) {
            updateData.label = label;
            updateData.name = label.toLowerCase().replace(/\s+/g, '_');
        }
        if (type !== undefined) updateData.type = type;
        if (required !== undefined) updateData.required = required;
        if (options !== undefined) updateData.options = options;
        if (order !== undefined) updateData.order = order;
        if (active !== undefined) updateData.active = active;

        const field = await prisma.dynamicField.update({
            where: { id: parseInt(id) },
            data: updateData,
        });
        res.json(field);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteField = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.dynamicField.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'Field deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { role },
        });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { status },
        });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.user.delete({
            where: { id: parseInt(id) },
        });
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getUsers,
    approveUser,
    rejectUser,
    getFields,
    createField,
    updateField,
    deleteField,
    updateUserRole,
    updateUserStatus,
    deleteUser
};

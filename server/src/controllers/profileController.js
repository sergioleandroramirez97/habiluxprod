const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                lastName: true,
                email: true,
                phone: true,
                bio: true,
                avatar: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    const { name, lastName, phone, bio } = req.body;

    try {
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (phone !== undefined) updateData.phone = phone;
        if (bio !== undefined) updateData.bio = bio;

        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                lastName: true,
                email: true,
                phone: true,
                bio: true,
                avatar: true,
                role: true,
                status: true,
            },
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Get current user to delete old avatar if exists
        const currentUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { avatar: true },
        });

        // Delete old avatar file if exists
        if (currentUser.avatar) {
            const oldAvatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(currentUser.avatar));
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }

        // Update user with new avatar URL
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { avatar: avatarUrl },
            select: {
                id: true,
                name: true,
                lastName: true,
                email: true,
                phone: true,
                bio: true,
                avatar: true,
                role: true,
                status: true,
            },
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        // Delete uploaded file if database update fails
        if (req.file) {
            const filePath = path.join(__dirname, '../../uploads/avatars', req.file.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete avatar
const deleteAvatar = async (req, res) => {
    try {
        // Get current user to delete avatar file
        const currentUser = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { avatar: true },
        });

        if (currentUser.avatar) {
            const avatarPath = path.join(__dirname, '../../uploads/avatars', path.basename(currentUser.avatar));
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
            }
        }

        // Update user to remove avatar
        const user = await prisma.user.update({
            where: { id: req.user.id },
            data: { avatar: null },
            select: {
                id: true,
                name: true,
                lastName: true,
                email: true,
                phone: true,
                bio: true,
                avatar: true,
                role: true,
                status: true,
            },
        });

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { getProfile, updateProfile, uploadAvatar, deleteAvatar };

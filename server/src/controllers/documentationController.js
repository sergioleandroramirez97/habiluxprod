const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const { createDocumentationNotification } = require('../helpers/notificationHelper');

// Helper to determine file type from mimetype or extension
const getFileType = (file) => {
    const mime = file.mimetype;
    if (mime.startsWith('image/')) return 'IMAGE';
    if (mime === 'application/pdf') return 'PDF';
    if (mime.includes('excel') || mime.includes('spreadsheet')) return 'EXCEL';
    if (mime === 'text/csv') return 'CSV';
    return 'OTHER';
};

const createDocumentation = async (req, res) => {
    try {
        const { title, propertyId } = req.body;
        const file = req.file;
        const userId = req.user.id;

        if (!title || !propertyId || !file) {
            return res.status(400).json({ message: 'Title, property and file are required' });
        }

        // Verify property existence and permissions
        const property = await prisma.property.findUnique({ where: { id: parseInt(propertyId) } });
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Check permissions: Admin can upload anywhere. Owner only on owned. Tenant only on rented.
        if (req.user.role !== 'ADMIN') {
            if (req.user.role === 'PROPIETARIO' && property.ownerId !== userId) {
                return res.status(403).json({ message: 'You can only upload documentation for your properties' });
            }
            if (req.user.role === 'INQUILINO' && property.tenantId !== userId) {
                return res.status(403).json({ message: 'You can only upload documentation for your rented properties' });
            }
        }

        const fileType = getFileType(file);
        const fileUrl = `/uploads/documentation/${file.filename}`;

        console.log('Creating documentation for user:', userId, req.user.name);

        const doc = await prisma.documentation.create({
            data: {
                title,
                fileUrl,
                fileType,
                propertyId: parseInt(propertyId),
                uploaderId: userId
            },
            include: {
                uploader: { select: { name: true, email: true } },
                property: { select: { title: true, propertyCode: true } }
            }
        });

        console.log('Documentation created:', doc);

        // Create notification
        await createDocumentationNotification(doc, property);

        res.status(201).json(doc);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getDocumentation = async (req, res) => {
    try {
        const { propertyId, fileType, page = 1, limit = 10 } = req.query;
        const userId = req.user.id;
        const userRole = req.user.role;

        const where = {};
        if (propertyId) where.propertyId = parseInt(propertyId);
        if (fileType) where.fileType = fileType;

        // Permission filtering
        if (userRole !== 'ADMIN') {
            if (userRole === 'PROPIETARIO') {
                // Can see docs for owned properties
                where.property = { ownerId: userId };
            } else if (userRole === 'INQUILINO') {
                // Can see docs for rented properties
                where.property = { tenantId: userId };
            } else {
                // Guest or others shouldn't see docs? Or maybe just public ones if any?
                // For now, restrict to involved parties.
                return res.status(403).json({ message: 'Unauthorized' });
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [docs, total] = await Promise.all([
            prisma.documentation.findMany({
                where,
                include: {
                    uploader: { select: { name: true, email: true } },
                    property: { select: { title: true, propertyCode: true } }
                },
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.documentation.count({ where })
        ]);

        console.log('Fetched docs:', docs.map(d => ({ id: d.id, uploader: d.uploader })));

        res.json({
            docs,
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

const deleteDocumentation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const doc = await prisma.documentation.findUnique({
            where: { id },
            include: { property: true }
        });

        if (!doc) {
            return res.status(404).json({ message: 'Documentation not found' });
        }

        // Permissions: Admin can delete any. Uploader can delete their own? 
        // Or maybe Owners can delete docs on their properties?
        // Let's say Admin can delete any, and Uploader can delete their own.
        const isUploader = doc.uploaderId === userId;
        const isAdmin = userRole === 'ADMIN';

        if (!isAdmin && !isUploader) {
            return res.status(403).json({ message: 'Not authorized to delete this document' });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../../', doc.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await prisma.documentation.delete({ where: { id } });

        res.json({ message: 'Documentation deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createDocumentation,
    getDocumentation,
    deleteDocumentation
};

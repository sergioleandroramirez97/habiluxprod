const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Obtener configuración pública (favicon, logo, titulo)
const getPublicConfig = async (req, res) => {
    try {
        const configs = await prisma.portalConfig.findMany({
            where: {
                key: { in: ['siteTitle', 'favicon', 'logo'] }
            }
        });

        const configMap = configs.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        res.json(configMap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Obtener toda la configuración (admin)
const getAllConfig = async (req, res) => {
    try {
        const configs = await prisma.portalConfig.findMany();
        const configMap = configs.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        res.json(configMap);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Actualizar configuración
const updateConfig = async (req, res) => {
    try {
        const { siteTitle } = req.body;
        const files = req.files; // Multer files

        const updates = [];

        if (siteTitle) {
            updates.push(prisma.portalConfig.upsert({
                where: { key: 'siteTitle' },
                update: { value: siteTitle },
                create: { key: 'siteTitle', value: siteTitle }
            }));
        }

        if (files) {
            if (files.favicon) {
                const faviconPath = `/uploads/config/${files.favicon[0].filename}`;
                updates.push(prisma.portalConfig.upsert({
                    where: { key: 'favicon' },
                    update: { value: faviconPath },
                    create: { key: 'favicon', value: faviconPath }
                }));
            }
            if (files.logo) {
                const logoPath = `/uploads/config/${files.logo[0].filename}`;
                updates.push(prisma.portalConfig.upsert({
                    where: { key: 'logo' },
                    update: { value: logoPath },
                    create: { key: 'logo', value: logoPath }
                }));
            }
        }

        await Promise.all(updates);

        res.json({ message: 'Configuration updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getPublicConfig,
    getAllConfig,
    updateConfig
};

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkAdmin() {
    try {
        const admin = await prisma.user.findUnique({
            where: { email: 'admin@admin.com' }
        });

        if (!admin) {
            console.log('Admin user not found!');
            return;
        }

        console.log('Admin user found.');

        const isMatch1 = await bcrypt.compare('admin', admin.password);
        if (isMatch1) {
            console.log('Password is: admin');
            return;
        }

        const isMatch2 = await bcrypt.compare('admin123', admin.password);
        if (isMatch2) {
            console.log('Password is: admin123');
            return;
        }

        console.log('Password is neither "admin" nor "admin123".');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdmin();

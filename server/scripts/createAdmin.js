const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        // Check if admin user exists
        const adminExists = await prisma.user.findUnique({
            where: { email: 'admin@admin.com' }
        });

        if (adminExists) {
            console.log('✓ Admin user already exists');
            console.log('Email: admin@admin.com');
            console.log('Role:', adminExists.role);
            console.log('Status:', adminExists.status);
            return;
        }

        // Create admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin', salt);

        const admin = await prisma.user.create({
            data: {
                name: 'Administrator',
                email: 'admin@admin.com',
                password: hashedPassword,
                role: 'ADMIN',
                status: 'APPROVED',
                dynamicData: '{}',
            },
        });

        console.log('✓ Admin user created successfully!');
        console.log('Email: admin@admin.com');
        console.log('Password: admin');
        console.log('Role:', admin.role);
        console.log('Status:', admin.status);
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser();

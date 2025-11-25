const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const statuses = ['DISPONIBLE', 'ALQUILADA', 'MANTENIMIENTO'];

    for (const status of statuses) {
        const exists = await prisma.propertyStatus.findUnique({
            where: { name: status }
        });

        if (!exists) {
            await prisma.propertyStatus.create({
                data: { name: status }
            });
            console.log(`Created status: ${status}`);
        } else {
            console.log(`Status already exists: ${status}`);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

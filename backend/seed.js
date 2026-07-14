const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.empleados.update({
      where: { empleadoid: 59 },
      data: { email: 'admin@admin.com' }
    });
    console.log('Usuario actualizado correctamente en controldetiempo.');
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();

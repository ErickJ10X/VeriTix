import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../generated/prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/**
 * Función principal para ejecutar el seed. Crea un usuario admin y un usuario normal con contraseñas hasheadas.
 */
async function main() {
  const adminPassword = await bcrypt.hash(`${process.env.ADMIN_PASSWORD}`, 12);
  const userPassword = await bcrypt.hash(`${process.env.USER_PASSWORD}`, 12);

  await prisma.user.upsert({
    where: { email: 'admin@veritix.app' },
    update: {},
    create: {
      email: 'admin@veritix.app',
      phone: '+34600000000',
      name: 'Admin',
      lastName: 'VeriTix',
      password: adminPassword,
      role: Role.ADMIN,
      isActive: true,
      emailVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@veritix.app' },
    update: {},
    create: {
      email: 'user@veritix.app',
      phone: '+34600000000',
      name: 'User',
      lastName: 'VeriTix',
      password: userPassword,
      role: Role.BUYER,
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('Seed completado: admin y user creados');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

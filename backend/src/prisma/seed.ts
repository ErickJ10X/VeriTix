import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../generated/prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// ─── CATÁLOGOS ────────────────────────────────────────────────────────────────

const concertFormats = [
  {
    name: 'Concierto',
    slug: 'concierto',
    icon: '🎤',
    description: 'Show de uno o dos artistas, noche única',
  },
  {
    name: 'Festival',
    slug: 'festival',
    icon: '🎪',
    description: 'Múltiples artistas, puede ser multi-día',
  },
  {
    name: 'Tour',
    slug: 'tour',
    icon: '🚌',
    description: 'Fecha de una gira nacional o internacional',
  },
  {
    name: 'Tributo',
    slug: 'tributo',
    icon: '🎸',
    description: 'Banda tributo a un artista icónico',
  },
  {
    name: 'Acústico',
    slug: 'acustico',
    icon: '🪕',
    description: 'Formato íntimo sin amplificación electrónica',
  },
  {
    name: 'Club Night',
    slug: 'club-night',
    icon: '🎧',
    description: 'Show de DJ o música electrónica en club',
  },
];

const genres = [
  // Rock y derivados
  { name: 'Rock', slug: 'rock' },
  { name: 'Rock Alternativo', slug: 'rock-alternativo' },
  { name: 'Indie', slug: 'indie' },
  { name: 'Metal', slug: 'metal' },
  { name: 'Punk', slug: 'punk' },
  // Pop
  { name: 'Pop', slug: 'pop' },
  { name: 'Pop Latino', slug: 'pop-latino' },
  { name: 'K-Pop', slug: 'k-pop' },
  // Electrónica
  { name: 'Electrónica', slug: 'electronica' },
  { name: 'House', slug: 'house' },
  { name: 'Techno', slug: 'techno' },
  // Urban
  { name: 'Hip-Hop', slug: 'hip-hop' },
  { name: 'Trap', slug: 'trap' },
  { name: 'R&B', slug: 'r-and-b' },
  { name: 'Reggaeton', slug: 'reggaeton' },
  // Regional
  { name: 'Regional Mexicano', slug: 'regional-mexicano' },
  { name: 'Cumbia', slug: 'cumbia' },
  { name: 'Banda', slug: 'banda' },
  { name: 'Norteño', slug: 'norteno' },
  // Otros
  { name: 'Jazz', slug: 'jazz' },
  { name: 'Blues', slug: 'blues' },
  { name: 'Soul', slug: 'soul' },
  { name: 'Clásica', slug: 'clasica' },
  { name: 'Reggae', slug: 'reggae' },
  { name: 'Folk', slug: 'folk' },
];

const venues = [
  {
    name: 'Foro Sol',
    slug: 'foro-sol',
    address: 'Av. Viaducto Río de la Piedad s/n',
    city: 'Ciudad de México',
    state: 'CDMX',
    capacity: 65000,
    type: 'FORO' as const,
  },
  {
    name: 'Auditorio Nacional',
    slug: 'auditorio-nacional',
    address: 'Paseo de la Reforma 50',
    city: 'Ciudad de México',
    state: 'CDMX',
    capacity: 10000,
    type: 'AUDITORIO' as const,
  },
  {
    name: 'Arena Ciudad de México',
    slug: 'arena-cdmx',
    address: 'Av. de los Insurgentes Sur 3000',
    city: 'Ciudad de México',
    state: 'CDMX',
    capacity: 22000,
    type: 'ARENA' as const,
  },
  {
    name: 'Palacio de los Deportes',
    slug: 'palacio-de-los-deportes',
    address: 'Av. Río Churubusco s/n',
    city: 'Ciudad de México',
    state: 'CDMX',
    capacity: 20000,
    type: 'ARENA' as const,
  },
  {
    name: 'Foro Indie Rocks',
    slug: 'foro-indie-rocks',
    address: 'Av. Sonora 117',
    city: 'Ciudad de México',
    state: 'CDMX',
    capacity: 4500,
    type: 'FORO' as const,
  },
  {
    name: 'Estadio BBVA',
    slug: 'estadio-bbva',
    address: 'Av. Pablo Livas 2011',
    city: 'Monterrey',
    state: 'Nuevo León',
    capacity: 53500,
    type: 'ESTADIO' as const,
  },
  {
    name: 'Explanada Ciudad Modelo',
    slug: 'explanada-ciudad-modelo-gdl',
    address: 'Av. Mariano Otero 1499',
    city: 'Guadalajara',
    state: 'Jalisco',
    capacity: 30000,
    type: 'AL_AIRE_LIBRE' as const,
  },
];

// ─── SEED ─────────────────────────────────────────────────────────────────────

async function main() {
  // Usuarios base
  const adminPassword = await bcrypt.hash(`${process.env.ADMIN_PASSWORD}`, 12);
  const userPassword = await bcrypt.hash(`${process.env.USER_PASSWORD}`, 12);

  await prisma.user.upsert({
    where: { email: 'admin@veritix.app' },
    update: {},
    create: {
      email: 'admin@veritix.app',
      phone: '+52550000001',
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
      phone: '+52550000002',
      name: 'User',
      lastName: 'VeriTix',
      password: userPassword,
      role: Role.BUYER,
      isActive: true,
      emailVerified: true,
    },
  });

  // Formatos de concierto
  for (const format of concertFormats) {
    await prisma.concertFormat.upsert({
      where: { slug: format.slug },
      update: {},
      create: format,
    });
  }

  // Géneros musicales
  for (const genre of genres) {
    await prisma.genre.upsert({
      where: { slug: genre.slug },
      update: {},
      create: genre,
    });
  }

  // Venues
  for (const venue of venues) {
    await prisma.venue.upsert({
      where: { slug: venue.slug },
      update: {},
      create: venue,
    });
  }

  console.log('Seed completado: usuarios, formatos, géneros y venues creados');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

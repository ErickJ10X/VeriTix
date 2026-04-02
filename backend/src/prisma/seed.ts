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
    name: 'Palacio de Congresos de Granada',
    slug: 'palacio-congresos-granada',
    address: 'Paseo del Violon s/n',
    city: 'Granada',
    state: 'Andalucia',
    country: 'ES',
    capacity: 2000,
    type: 'AUDITORIO' as const,
  },
  {
    name: 'Plaza de Toros de Granada',
    slug: 'plaza-toros-granada',
    address: 'Avenida del Doctor Oloriz 25',
    city: 'Granada',
    state: 'Andalucia',
    country: 'ES',
    capacity: 12000,
    type: 'AL_AIRE_LIBRE' as const,
  },
  {
    name: 'Industrial Copera',
    slug: 'industrial-copera',
    address: 'Calle Paris 18',
    city: 'Granada',
    state: 'Andalucia',
    country: 'ES',
    capacity: 4500,
    type: 'CLUB' as const,
  },
  {
    name: 'Teatro Isabel la Catolica',
    slug: 'teatro-isabel-la-catolica',
    address: 'Acera del Casino s/n',
    city: 'Granada',
    state: 'Andalucia',
    country: 'ES',
    capacity: 662,
    type: 'TEATRO' as const,
  },
];

const artists = [
  {
    name: 'Lori Meyers',
    slug: 'lori-meyers',
    country: 'ES',
    bio: 'Banda indie rock granadina.',
    genres: ['indie', 'rock-alternativo'],
  },
  {
    name: 'Los Planetas',
    slug: 'los-planetas',
    country: 'ES',
    bio: 'Referente del indie rock en Espana, originarios de Granada.',
    genres: ['indie', 'rock'],
  },
  {
    name: 'Dellafuente',
    slug: 'dellafuente',
    country: 'ES',
    bio: 'Artista urbano granadino que fusiona trap, flamenco y hip-hop.',
    genres: ['trap', 'hip-hop'],
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
      phone: '+34958000001',
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
      phone: '+34958000002',
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

  // Artistas
  for (const artist of artists) {
    await prisma.artist.upsert({
      where: { slug: artist.slug },
      update: {
        name: artist.name,
        country: artist.country,
        bio: artist.bio,
        genres: {
          set: [],
          connect: artist.genres.map((slug) => ({ slug })),
        },
      },
      create: {
        name: artist.name,
        slug: artist.slug,
        country: artist.country,
        bio: artist.bio,
        genres: {
          connect: artist.genres.map((slug) => ({ slug })),
        },
      },
    });
  }

  const adminUser = await prisma.user.findUniqueOrThrow({
    where: { email: 'admin@veritix.app' },
  });

  const indieFormat = await prisma.concertFormat.findUniqueOrThrow({
    where: { slug: 'concierto' },
  });

  const palacioCongresos = await prisma.venue.findUniqueOrThrow({
    where: { slug: 'palacio-congresos-granada' },
  });

  const plazaToros = await prisma.venue.findUniqueOrThrow({
    where: { slug: 'plaza-toros-granada' },
  });

  const losPlanetas = await prisma.artist.findUniqueOrThrow({
    where: { slug: 'los-planetas' },
  });

  const loriMeyers = await prisma.artist.findUniqueOrThrow({
    where: { slug: 'lori-meyers' },
  });

  const dellafuente = await prisma.artist.findUniqueOrThrow({
    where: { slug: 'dellafuente' },
  });

  const indieGenre = await prisma.genre.findUniqueOrThrow({
    where: { slug: 'indie' },
  });

  const trapGenre = await prisma.genre.findUniqueOrThrow({
    where: { slug: 'trap' },
  });

  await prisma.event.deleteMany({
    where: {
      name: {
        in: ['Granada Indie Night 2026', 'Granada Urban Sessions 2026'],
      },
    },
  });

  // Eventos en Granada con moneda EUR
  const indieNight = await prisma.event.create({
    data: {
      name: 'Granada Indie Night 2026',
      description: 'Noche indie con artistas emblematicos de Granada.',
      eventDate: new Date('2026-09-19T21:00:00.000+02:00'),
      doorsOpenTime: new Date('2026-09-19T19:30:00.000+02:00'),
      startSale: new Date('2026-05-01T10:00:00.000+02:00'),
      endSale: new Date('2026-09-19T18:00:00.000+02:00'),
      maxCapacity: 2000,
      status: 'PUBLISHED',
      currency: 'EUR',
      creatorId: adminUser.id,
      venueId: palacioCongresos.id,
      formatId: indieFormat.id,
      genres: {
        connect: [{ id: indieGenre.id }],
      },
      artists: {
        create: [
          {
            role: 'HEADLINER',
            performanceOrder: 1,
            artistId: losPlanetas.id,
          },
          {
            role: 'SPECIAL_GUEST',
            performanceOrder: 2,
            artistId: loriMeyers.id,
          },
        ],
      },
    },
  });

  await prisma.ticketType.createMany({
    data: [
      {
        name: 'General',
        description: 'Acceso general',
        price: '38.00',
        totalQuantity: 1200,
        availableQuantity: 1200,
        maxPerUser: 6,
        eventId: indieNight.id,
        saleStartDate: new Date('2026-05-01T10:00:00.000+02:00'),
        saleEndDate: new Date('2026-09-19T18:00:00.000+02:00'),
      },
      {
        name: 'Preferente',
        description: 'Zona preferente frente al escenario',
        price: '65.00',
        totalQuantity: 500,
        availableQuantity: 500,
        maxPerUser: 4,
        eventId: indieNight.id,
        saleStartDate: new Date('2026-05-01T10:00:00.000+02:00'),
        saleEndDate: new Date('2026-09-19T18:00:00.000+02:00'),
      },
    ],
  });

  const urbanFest = await prisma.event.create({
    data: {
      name: 'Granada Urban Sessions 2026',
      description: 'Encuentro urbano en formato al aire libre.',
      eventDate: new Date('2026-10-03T22:00:00.000+02:00'),
      doorsOpenTime: new Date('2026-10-03T20:00:00.000+02:00'),
      startSale: new Date('2026-06-10T10:00:00.000+02:00'),
      endSale: new Date('2026-10-03T20:30:00.000+02:00'),
      maxCapacity: 12000,
      status: 'PUBLISHED',
      currency: 'EUR',
      creatorId: adminUser.id,
      venueId: plazaToros.id,
      formatId: indieFormat.id,
      genres: {
        connect: [{ id: trapGenre.id }],
      },
      artists: {
        create: [
          {
            role: 'HEADLINER',
            performanceOrder: 1,
            artistId: dellafuente.id,
          },
        ],
      },
    },
  });

  await prisma.ticketType.createMany({
    data: [
      {
        name: 'Pista',
        description: 'Acceso pista general',
        price: '45.00',
        totalQuantity: 7000,
        availableQuantity: 7000,
        maxPerUser: 6,
        eventId: urbanFest.id,
        saleStartDate: new Date('2026-06-10T10:00:00.000+02:00'),
        saleEndDate: new Date('2026-10-03T20:30:00.000+02:00'),
      },
      {
        name: 'Front Stage',
        description: 'Zona premium cercana al escenario',
        price: '85.00',
        totalQuantity: 1500,
        availableQuantity: 1500,
        maxPerUser: 4,
        eventId: urbanFest.id,
        saleStartDate: new Date('2026-06-10T10:00:00.000+02:00'),
        saleEndDate: new Date('2026-10-03T20:30:00.000+02:00'),
      },
    ],
  });

  console.log(
    'Seed completado: usuarios, formatos, generos, venues, artistas, eventos y ticket types en EUR para Granada, Espana',
  );
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

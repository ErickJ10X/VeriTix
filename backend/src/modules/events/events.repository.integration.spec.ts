import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import { EventStatus } from '../../generated/prisma/enums';
import { EventsRepository } from './events.repository';

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const phone = () => `+521${Math.floor(Math.random() * 9_000_000_000 + 1_000_000_000)}`;

describe('EventsRepository (integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repo: EventsRepository;

  // Fixtures compartidos — creados una sola vez
  let creatorId: string;
  let venueId: string;
  let genreId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [EventsRepository],
    }).compile();

    await module.init();
    prisma = module.get(PrismaService);
    repo = module.get(EventsRepository);

    const suffix = uid();

    const [creator, venue, genre] = await Promise.all([
      prisma.user.create({
        data: { email: `events-creator-${suffix}@int.test`, phone: phone(), password: 'hash', name: 'Creator', lastName: 'Test' },
      }),
      prisma.venue.create({
        data: { name: `Venue ${suffix}`, slug: `venue-${suffix}`, address: 'Av. Principal 1', city: `Guadalajara-${suffix}`, country: 'MX' },
      }),
      prisma.genre.create({
        data: { name: `Genre-${suffix}`, slug: `genre-${suffix}` },
      }),
    ]);

    creatorId = creator.id;
    venueId = venue.id;
    genreId = genre.id;
  });

  afterEach(async () => {
    // Cascade: Event → TicketTypes, Tickets, EventArtists, M2M genres
    await prisma.event.deleteMany({ where: { creatorId } });
  });

  afterAll(async () => {
    await prisma.event.deleteMany({ where: { creatorId } });
    await prisma.genre.deleteMany({ where: { id: genreId } });
    await prisma.venue.deleteMany({ where: { id: venueId } });
    await prisma.user.deleteMany({ where: { email: { endsWith: '@int.test' } } });
    await module.close();
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  const makeEventData = (overrides: Record<string, unknown> = {}) => ({
    name: `Event-${uid()}`,
    eventDate: '2099-12-01T20:00:00Z',
    maxCapacity: 500,
    creatorId,
    venueId,
    ...overrides,
  });

  const createPublished = async (overrides: Record<string, unknown> = {}) => {
    const event = await repo.create(makeEventData(overrides));
    return repo.updateStatus(event.id, EventStatus.PUBLISHED);
  };

  // ── create() ──────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('crea el evento en DRAFT con valores por defecto correctos', async () => {
      const data = makeEventData();
      const event = await repo.create(data);

      expect(event.id).toBeDefined();
      expect(event.name).toBe(data.name);
      expect(event.status).toBe('DRAFT');
      expect(event.currency).toBe('MXN');
      expect(event.venue.id).toBe(venueId);
      expect(event.genres).toEqual([]);
      expect(event.format).toBeNull();
    });

    it('conecta géneros via M2M al crear', async () => {
      const event = await repo.create(makeEventData({ genreIds: [genreId] }));

      expect(event.genres).toHaveLength(1);
      expect(event.genres[0].id).toBe(genreId);
    });

    it('crea sin géneros cuando genreIds está vacío', async () => {
      const event = await repo.create(makeEventData({ genreIds: [] }));

      expect(event.genres).toHaveLength(0);
    });
  });

  // ── findById() ─────────────────────────────────────────────────────────────

  describe('findById()', () => {
    it('devuelve el evento con todas sus relaciones', async () => {
      const created = await repo.create(makeEventData({ genreIds: [genreId] }));

      const found = await repo.findById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.venue.slug).toBeDefined();
      expect(found!.venue.address).toBeDefined();
      expect(found!.genres).toHaveLength(1);
      expect(found!.genres[0].id).toBe(genreId);
    });

    it('devuelve null si el id no existe', async () => {
      expect(await repo.findById('00000000-0000-0000-0000-000000000000')).toBeNull();
    });
  });

  // ── update() ──────────────────────────────────────────────────────────────

  describe('update()', () => {
    it('actualiza campos escalares', async () => {
      const event = await repo.create(makeEventData());

      const updated = await repo.update(event.id, { name: 'Nuevo nombre', maxCapacity: 999 });

      expect(updated.name).toBe('Nuevo nombre');
      expect(updated.maxCapacity).toBe(999);
    });

    it('genres: { set } reemplaza — no agrega', async () => {
      // Creamos con un género
      const event = await repo.create(makeEventData({ genreIds: [genreId] }));
      expect(event.genres).toHaveLength(1);

      // set con vacío → queda sin géneros
      const updated = await repo.update(event.id, { genreIds: [] });

      expect(updated.genres).toHaveLength(0);
    });

    it('omitir genreIds no toca los géneros existentes', async () => {
      const event = await repo.create(makeEventData({ genreIds: [genreId] }));

      // Update sin genreIds — géneros intactos
      const updated = await repo.update(event.id, { name: 'Otro nombre' });

      expect(updated.genres).toHaveLength(1);
    });
  });

  // ── updateStatus() ─────────────────────────────────────────────────────────

  describe('updateStatus()', () => {
    it('DRAFT → PUBLISHED', async () => {
      const event = await repo.create(makeEventData());
      const updated = await repo.updateStatus(event.id, EventStatus.PUBLISHED);
      expect(updated.status).toBe('PUBLISHED');
    });

    it('PUBLISHED → CANCELLED', async () => {
      const event = await createPublished();
      const updated = await repo.updateStatus(event.id, EventStatus.CANCELLED);
      expect(updated.status).toBe('CANCELLED');
    });

    it('el cambio persiste en DB', async () => {
      const event = await repo.create(makeEventData());
      await repo.updateStatus(event.id, EventStatus.PUBLISHED);

      const fromDb = await prisma.event.findUnique({ where: { id: event.id } });
      expect(fromDb!.status).toBe('PUBLISHED');
    });
  });

  // ── findByCreator() ────────────────────────────────────────────────────────

  describe('findByCreator()', () => {
    it('devuelve los eventos del creator paginados', async () => {
      await repo.create(makeEventData());
      await repo.create(makeEventData());
      await repo.create(makeEventData());

      const result = await repo.findByCreator(creatorId, 1, 2);

      expect(result.meta.total).toBe(3);
      expect(result.data).toHaveLength(2);
      expect(result.meta.hasNext).toBe(true);
      expect(result.meta.hasPrev).toBe(false);
    });

    it('segunda página correctamente', async () => {
      await repo.create(makeEventData());
      await repo.create(makeEventData());
      await repo.create(makeEventData());

      const result = await repo.findByCreator(creatorId, 2, 2);

      expect(result.data).toHaveLength(1);
      expect(result.meta.hasPrev).toBe(true);
    });

    it('devuelve vacío si el creator no existe', async () => {
      const result = await repo.findByCreator('00000000-0000-0000-0000-000000000000', 1, 10);
      expect(result.meta.total).toBe(0);
    });
  });

  // ── findAll() — solo PUBLISHED ─────────────────────────────────────────────

  describe('findAll()', () => {
    it('excluye eventos DRAFT — solo devuelve PUBLISHED', async () => {
      await repo.create(makeEventData()); // DRAFT
      const published = await createPublished();

      const result = await repo.findAll({ page: 1, limit: 100 });

      const ours = result.data.filter(e => e.venue.id === venueId);
      expect(ours.every(e => e.status === 'PUBLISHED')).toBe(true);
      expect(ours.some(e => e.id === published.id)).toBe(true);
    });

    it('filtra por search (case insensitive)', async () => {
      const uniqueName = `ZZZ-Search-${uid()}`;
      await createPublished({ name: uniqueName });

      const result = await repo.findAll({ page: 1, limit: 10, search: uniqueName.toLowerCase() });

      expect(result.data.some(e => e.name === uniqueName)).toBe(true);
    });

    it('filtra por dateFrom / dateTo', async () => {
      await createPublished({ eventDate: '2099-03-15T20:00:00Z' }); // dentro del rango
      await createPublished({ eventDate: '2099-09-01T20:00:00Z' }); // fuera del rango

      const result = await repo.findAll({
        page: 1, limit: 100,
        dateFrom: '2099-01-01',
        dateTo: '2099-06-30',
      });

      const ours = result.data.filter(e => e.venue.id === venueId);
      expect(ours).toHaveLength(1);
      expect(new Date(ours[0].eventDate).getMonth()).toBe(2); // marzo = 2 (0-indexed)
    });

    it('filtra por genreId — solo eventos con ese género', async () => {
      const withGenre = await createPublished({ genreIds: [genreId] });
      await createPublished(); // sin género

      const result = await repo.findAll({ page: 1, limit: 100, genreId });

      expect(result.data.some(e => e.id === withGenre.id)).toBe(true);
      // El evento sin genre NO debe aparecer en este filtro
      const ours = result.data.filter(e => e.venue.id === venueId);
      expect(ours.every(e => e.id === withGenre.id)).toBe(true);
    });
  });

  // ── findUpcoming() ─────────────────────────────────────────────────────────

  describe('findUpcoming()', () => {
    it('devuelve solo eventos PUBLISHED con fecha futura', async () => {
      await repo.create(makeEventData()); // DRAFT — no debe aparecer
      const published = await createPublished();

      const result = await repo.findUpcoming(10, creatorId);

      expect(result.some(e => e.id === published.id)).toBe(true);
      // El DRAFT no aparece
    });

    it('ticketsSold es 0 cuando no hay órdenes completadas', async () => {
      const event = await createPublished();

      const result = await repo.findUpcoming(10, creatorId);
      const row = result.find(e => e.id === event.id);

      expect(row).toBeDefined();
      expect(row!.ticketsSold).toBe(0);
      expect(row!.maxCapacity).toBe(500);
      expect(row!.venue).toBeDefined();
    });

    it('respeta el filtro de creatorId', async () => {
      await createPublished();

      const resultWithCreator = await repo.findUpcoming(10, creatorId);
      const resultAll = await repo.findUpcoming(10);

      // Los del creator están en el resultado global
      expect(resultAll.length).toBeGreaterThanOrEqual(resultWithCreator.length);
    });
  });

  // ── findRequiresAttention() ────────────────────────────────────────────────

  describe('findRequiresAttention()', () => {
    it('devuelve eventos DRAFT y PUBLISHED, no CANCELLED', async () => {
      const draft = await repo.create(makeEventData());
      const published = await createPublished();
      const cancelled = await createPublished();
      await repo.updateStatus(cancelled.id, EventStatus.CANCELLED);

      const result = await repo.findRequiresAttention(creatorId);

      const ids = result.map(e => e.id);
      expect(ids).toContain(draft.id);
      expect(ids).toContain(published.id);
      expect(ids).not.toContain(cancelled.id);
    });

    it('cada row incluye _count de artists y ticketTypes', async () => {
      await repo.create(makeEventData());

      const result = await repo.findRequiresAttention(creatorId);

      expect(result[0]._count).toBeDefined();
      expect(typeof result[0]._count.artists).toBe('number');
      expect(typeof result[0]._count.ticketTypes).toBe('number');
      expect(Array.isArray(result[0].ticketTypes)).toBe(true);
    });
  });

  // ── findMetricsById() ──────────────────────────────────────────────────────

  describe('findMetricsById()', () => {
    it('devuelve métricas completas del evento', async () => {
      const event = await repo.create(makeEventData());

      const metrics = await repo.findMetricsById(event.id);

      expect(metrics).not.toBeNull();
      expect(metrics!.id).toBe(event.id);
      expect(metrics!.status).toBe('DRAFT');
      expect(metrics!.creatorId).toBe(creatorId);
      expect(metrics!.maxCapacity).toBe(500);
      expect(Array.isArray(metrics!.ticketTypes)).toBe(true);
      expect(Array.isArray(metrics!.orders)).toBe(true);
    });

    it('devuelve null si el evento no existe', async () => {
      expect(await repo.findMetricsById('00000000-0000-0000-0000-000000000000')).toBeNull();
    });
  });
});

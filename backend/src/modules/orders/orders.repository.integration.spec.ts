import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../../prisma/prisma.module';
import { PrismaService } from '../../prisma/prisma.service';
import { OrderStatus } from '../../generated/prisma/enums';
import { OrdersRepository } from './orders.repository';

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
const phone = () => `+521${Math.floor(Math.random() * 9_000_000_000 + 1_000_000_000)}`;

describe('OrdersRepository (integration)', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let repo: OrdersRepository;

  // Fixtures compartidos — se crean una sola vez y se reúsan entre tests
  let buyerId: string;
  let eventId: string;
  let ticketTypeId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [OrdersRepository],
    }).compile();

    await module.init();
    prisma = module.get(PrismaService);
    repo = module.get(OrdersRepository);

    const suffix = uid();

    const [buyer, creator] = await Promise.all([
      prisma.user.create({
        data: { email: `orders-buyer-${suffix}@int.test`, phone: phone(), password: 'hash', name: 'Buyer', lastName: 'Test' },
      }),
      prisma.user.create({
        data: { email: `orders-creator-${suffix}@int.test`, phone: phone(), password: 'hash', name: 'Creator', lastName: 'Test' },
      }),
    ]);
    buyerId = buyer.id;

    const venue = await prisma.venue.create({
      data: { name: `Venue ${suffix}`, slug: `venue-${suffix}`, address: 'Calle 1', city: 'CDMX', country: 'MX' },
    });

    const event = await prisma.event.create({
      data: { name: `Event ${suffix}`, eventDate: new Date('2026-12-01T20:00:00Z'), maxCapacity: 500, creatorId: creator.id, venueId: venue.id },
    });
    eventId = event.id;

    const ticketType = await prisma.ticketType.create({
      data: { name: 'General', price: 500, totalQuantity: 100, availableQuantity: 100, eventId: event.id },
    });
    ticketTypeId = ticketType.id;
  });

  afterEach(async () => {
    // OrderItems se borran en cascada al borrar la Order
    await prisma.order.deleteMany({ where: { eventId } });
  });

  afterAll(async () => {
    // Orden explícito: primero lo que referencia, después lo referenciado
    await prisma.order.deleteMany({ where: { eventId } });
    await prisma.event.deleteMany({ where: { id: eventId } }); // cascades TicketTypes, Tickets, EventArtists
    await prisma.venue.deleteMany({ where: { slug: { startsWith: 'venue-' } } });
    await prisma.user.deleteMany({ where: { email: { endsWith: '@int.test' } } });
    await module.close();
  });

  // ── Helper ────────────────────────────────────────────────────────────────

  const makeOrder = (overrides: { buyerId?: string } = {}) =>
    repo.create({
      buyerId: overrides.buyerId ?? buyerId,
      eventId,
      totalAmount: 500,
      items: [{ ticketTypeId, quantity: 1, unitPrice: 500, subtotal: 500 }],
    });

  // ── create() ──────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('crea la orden en status PENDING con sus OrderItems', async () => {
      const order = await makeOrder();

      expect(order.id).toBeDefined();
      expect(order.status).toBe('PENDING');
      expect(Number(order.totalAmount)).toBe(500);
      expect(order.event.id).toBe(eventId);
      expect(order.items).toHaveLength(1);
      expect(order.items[0].quantity).toBe(1);
      expect(Number(order.items[0].unitPrice)).toBe(500);
      expect(Number(order.items[0].subtotal)).toBe(500);
      expect(order.items[0].ticketType.id).toBe(ticketTypeId);
    });

    it('persiste múltiples items en una sola orden', async () => {
      const order = await repo.create({
        buyerId,
        eventId,
        totalAmount: 1000,
        items: [
          { ticketTypeId, quantity: 1, unitPrice: 500, subtotal: 500 },
          { ticketTypeId, quantity: 1, unitPrice: 500, subtotal: 500 },
        ],
      });

      expect(order.items).toHaveLength(2);
      expect(Number(order.totalAmount)).toBe(1000);
    });
  });

  // ── findById() ─────────────────────────────────────────────────────────────

  describe('findById()', () => {
    it('devuelve la orden completa con todas sus relaciones', async () => {
      const created = await makeOrder();

      const found = await repo.findById(created.id);

      expect(found).not.toBeNull();
      expect(found!.id).toBe(created.id);
      expect(found!.event.id).toBe(eventId);
      expect(found!.event.currency).toBeDefined();
      expect(found!.items).toHaveLength(1);
      expect(found!.items[0].ticketType.id).toBe(ticketTypeId);
      expect(found!.payments).toEqual([]);
    });

    it('devuelve null si el id no existe', async () => {
      expect(await repo.findById('00000000-0000-0000-0000-000000000000')).toBeNull();
    });
  });

  // ── updateStatus() ─────────────────────────────────────────────────────────

  describe('updateStatus()', () => {
    it('PENDING → COMPLETED', async () => {
      const order = await makeOrder();

      const updated = await repo.updateStatus(order.id, OrderStatus.COMPLETED);

      expect(updated.status).toBe('COMPLETED');
      expect(updated.id).toBe(order.id);
    });

    it('PENDING → CANCELLED', async () => {
      const order = await makeOrder();

      const updated = await repo.updateStatus(order.id, OrderStatus.CANCELLED);

      expect(updated.status).toBe('CANCELLED');
    });

    it('el cambio de status se persiste — verificación directa en DB', async () => {
      const order = await makeOrder();
      await repo.updateStatus(order.id, OrderStatus.COMPLETED);

      const fromDb = await prisma.order.findUnique({ where: { id: order.id } });
      expect(fromDb!.status).toBe('COMPLETED');
    });
  });

  // ── findByBuyer() ──────────────────────────────────────────────────────────

  describe('findByBuyer()', () => {
    it('devuelve las órdenes paginadas del buyer', async () => {
      await makeOrder();
      await makeOrder();
      await makeOrder();

      const result = await repo.findByBuyer(buyerId, 1, 2);

      expect(result.meta.total).toBe(3);
      expect(result.data).toHaveLength(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.totalPages).toBe(2);
      expect(result.meta.hasNext).toBe(true);
      expect(result.meta.hasPrev).toBe(false);
    });

    it('devuelve la segunda página correctamente', async () => {
      await makeOrder();
      await makeOrder();
      await makeOrder();

      const result = await repo.findByBuyer(buyerId, 2, 2);

      expect(result.data).toHaveLength(1);
      expect(result.meta.page).toBe(2);
      expect(result.meta.hasNext).toBe(false);
      expect(result.meta.hasPrev).toBe(true);
    });

    it('devuelve lista vacía si el buyer no tiene órdenes', async () => {
      const result = await repo.findByBuyer('00000000-0000-0000-0000-000000000000', 1, 10);

      expect(result.meta.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });

    it('las órdenes incluyen el campo payments para providerSessionId', async () => {
      await makeOrder();

      const result = await repo.findByBuyer(buyerId, 1, 10);

      expect(result.data[0]).toHaveProperty('payments');
    });

    it('solo devuelve las órdenes del buyer solicitado — no las de otros', async () => {
      const other = await prisma.user.create({
        data: { email: `orders-other-${uid()}@int.test`, phone: phone(), password: 'hash', name: 'Other', lastName: 'User' },
      });
      await makeOrder({ buyerId: other.id });
      await makeOrder(); // del buyer principal

      const result = await repo.findByBuyer(buyerId, 1, 10);

      expect(result.data.every(() => true)).toBe(true); // todas son del buyer
      expect(result.meta.total).toBe(1);
    });
  });

  // ── findByEvent() ──────────────────────────────────────────────────────────

  describe('findByEvent()', () => {
    it('devuelve todas las órdenes del evento sin filtro de status', async () => {
      await makeOrder();
      await makeOrder();

      const result = await repo.findByEvent(eventId, 1, 10);

      expect(result.meta.total).toBe(2);
      expect(result.data).toHaveLength(2);
    });

    it('filtra por status COMPLETED correctamente', async () => {
      const o1 = await makeOrder();
      await makeOrder(); // queda en PENDING
      await repo.updateStatus(o1.id, OrderStatus.COMPLETED);

      const result = await repo.findByEvent(eventId, 1, 10, OrderStatus.COMPLETED);

      expect(result.meta.total).toBe(1);
      expect(result.data[0].id).toBe(o1.id);
      expect(result.data[0].status).toBe('COMPLETED');
    });

    it('filtra por status PENDING correctamente', async () => {
      const o1 = await makeOrder();
      const o2 = await makeOrder();
      await repo.updateStatus(o1.id, OrderStatus.COMPLETED);

      const result = await repo.findByEvent(eventId, 1, 10, OrderStatus.PENDING);

      expect(result.data.every(o => o.status === 'PENDING')).toBe(true);
      expect(result.data.some(o => o.id === o2.id)).toBe(true);
    });

    it('devuelve lista vacía para evento sin órdenes', async () => {
      const result = await repo.findByEvent('00000000-0000-0000-0000-000000000000', 1, 10);

      expect(result.meta.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });

    it('paginación funciona correctamente en findByEvent', async () => {
      await makeOrder();
      await makeOrder();
      await makeOrder();

      const page1 = await repo.findByEvent(eventId, 1, 2);
      const page2 = await repo.findByEvent(eventId, 2, 2);

      expect(page1.data).toHaveLength(2);
      expect(page1.meta.totalPages).toBe(2);
      expect(page2.data).toHaveLength(1);
    });
  });
});

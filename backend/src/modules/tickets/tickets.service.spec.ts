import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from '@common/interfaces';
import { Role, TicketStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { TicketsRepository } from './tickets.repository';
import { TicketsService } from './tickets.service';

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockTicketDetail = {
  id: 'uuid-ticket-1',
  hash: 'a'.repeat(64),
  qrPayload: 'a'.repeat(64),
  status: TicketStatus.ACTIVE,
  purchaseDate: new Date('2026-04-07T10:00:00Z'),
  validatedAt: null,
  createdAt: new Date('2026-04-07T10:00:00Z'),
  buyerId: 'uuid-buyer-1',
  ticketType: { name: 'Pista General', price: '75.00' },
  event: { id: 'uuid-event-1', name: 'Granada Indie Night 2026', eventDate: new Date('2026-09-19T21:00:00Z') },
  orderItem: { id: 'uuid-item-1' },
  order: { id: 'uuid-order-1', totalAmount: '150.00' },
  validatedBy: null,
};

const mockTicketListItem = {
  id: 'uuid-ticket-1',
  hash: 'a'.repeat(64),
  status: TicketStatus.ACTIVE,
  purchaseDate: new Date('2026-04-07T10:00:00Z'),
  ticketType: { name: 'Pista General', price: '75.00' },
  event: { id: 'uuid-event-1', name: 'Granada Indie Night 2026', eventDate: new Date('2026-09-19T21:00:00Z') },
  orderItem: { id: 'uuid-item-1' },
};

const mockPaginatedDetail = {
  data: [mockTicketDetail],
  meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
};

const mockPaginatedList = {
  data: [mockTicketListItem],
  meta: { total: 1, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
};

const mockBuyer: JwtPayload = {
  sub: 'uuid-buyer-1',
  email: 'buyer@test.com',
  role: Role.BUYER,
};

const mockAdmin: JwtPayload = {
  sub: 'uuid-admin-1',
  email: 'admin@test.com',
  role: Role.ADMIN,
};

const mockCreator: JwtPayload = {
  sub: 'uuid-creator-1',
  email: 'creator@test.com',
  role: Role.CREATOR,
};

const mockOther: JwtPayload = {
  sub: 'uuid-other-1',
  email: 'other@test.com',
  role: Role.BUYER,
};

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockTicketsRepository = {
  findByBuyer: jest.fn(),
  findByEvent: jest.fn(),
  findById: jest.fn(),
  findByHash: jest.fn(),
  updateStatus: jest.fn(),
};

const mockPrismaService = {
  event: { findUnique: jest.fn() },
  user: { findUniqueOrThrow: jest.fn() },
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('TicketsService', () => {
  let service: TicketsService;
  let repo: typeof mockTicketsRepository;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: TicketsRepository, useValue: mockTicketsRepository },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    repo = module.get(TicketsRepository);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── getMyTickets() ────────────────────────────────────────────────────────

  describe('getMyTickets()', () => {
    it('should return paginated detail tickets with qrPayload for the buyer', async () => {
      repo.findByBuyer.mockResolvedValue(mockPaginatedDetail);

      const result = await service.getMyTickets('uuid-buyer-1', 1, 10);

      expect(repo.findByBuyer).toHaveBeenCalledWith('uuid-buyer-1', 1, 10);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].qrPayload).toBe('a'.repeat(64));
      expect(result.data[0].ticketType.price).toBe(75);
    });

    it('should convert Decimal price with Number()', async () => {
      repo.findByBuyer.mockResolvedValue(mockPaginatedDetail);

      const result = await service.getMyTickets('uuid-buyer-1', 1, 10);

      expect(typeof result.data[0].ticketType.price).toBe('number');
      expect(typeof result.data[0].order.totalAmount).toBe('number');
    });
  });

  // ── getEventTickets() ─────────────────────────────────────────────────────

  describe('getEventTickets()', () => {
    const mockEvent = { id: 'uuid-event-1', creatorId: 'uuid-creator-1' };

    it('should return paginated list tickets for ADMIN (any event)', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findByEvent.mockResolvedValue(mockPaginatedList);

      const result = await service.getEventTickets('uuid-event-1', mockAdmin, 1, 10);

      expect(repo.findByEvent).toHaveBeenCalledWith('uuid-event-1', 1, 10);
      expect(result.data).toHaveLength(1);
    });

    it('should return tickets for CREATOR when it is their event', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findByEvent.mockResolvedValue(mockPaginatedList);

      const result = await service.getEventTickets('uuid-event-1', mockCreator, 1, 10);

      expect(result.data).toHaveLength(1);
    });

    it('should throw ForbiddenException when CREATOR accesses another event', async () => {
      prisma.event.findUnique.mockResolvedValue({
        id: 'uuid-event-1',
        creatorId: 'uuid-other-creator',
      });

      await expect(
        service.getEventTickets('uuid-event-1', mockCreator, 1, 10),
      ).rejects.toThrow(ForbiddenException);

      expect(repo.findByEvent).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when BUYER tries to access event tickets', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);

      await expect(
        service.getEventTickets('uuid-event-1', mockBuyer, 1, 10),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      prisma.event.findUnique.mockResolvedValue(null);

      await expect(
        service.getEventTickets('uuid-not-found', mockAdmin, 1, 10),
      ).rejects.toThrow(NotFoundException);
    });

    it('should NOT include qrPayload in the response (list select)', async () => {
      prisma.event.findUnique.mockResolvedValue(mockEvent);
      repo.findByEvent.mockResolvedValue(mockPaginatedList);

      const result = await service.getEventTickets('uuid-event-1', mockAdmin, 1, 10);

      // TicketListResponseDto no tiene qrPayload
      expect((result.data[0] as any).qrPayload).toBeUndefined();
    });
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    it('should return ticket detail with qrPayload for the owner', async () => {
      repo.findById.mockResolvedValue(mockTicketDetail);

      const result = await service.findOne('uuid-ticket-1', mockBuyer);

      expect(result.id).toBe('uuid-ticket-1');
      expect(result.qrPayload).toBe('a'.repeat(64));
    });

    it('should allow ADMIN to see any ticket', async () => {
      repo.findById.mockResolvedValue(mockTicketDetail);

      const result = await service.findOne('uuid-ticket-1', mockAdmin);

      expect(result.id).toBe('uuid-ticket-1');
    });

    it('should throw NotFoundException when ticket does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne('uuid-not-found', mockBuyer)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      repo.findById.mockResolvedValue(mockTicketDetail); // buyerId: uuid-buyer-1

      await expect(service.findOne('uuid-ticket-1', mockOther)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── validateTicket() ──────────────────────────────────────────────────────

  describe('validateTicket()', () => {
    const mockBuyerUser = { name: 'Ana', lastName: 'García' };

    beforeEach(() => {
      repo.findByHash.mockResolvedValue(mockTicketDetail);
      repo.updateStatus.mockResolvedValue({
        ...mockTicketDetail,
        status: TicketStatus.USED,
        validatedAt: new Date('2026-09-19T21:35:00Z'),
      });
      prisma.user.findUniqueOrThrow.mockResolvedValue(mockBuyerUser);
    });

    it('should validate an ACTIVE ticket and return confirmation data', async () => {
      const result = await service.validateTicket('a'.repeat(64), 'uuid-validator-1');

      expect(repo.updateStatus).toHaveBeenCalledWith(
        'uuid-ticket-1',
        TicketStatus.USED,
        'uuid-validator-1',
      );
      expect(result.ticketId).toBe('uuid-ticket-1');
      expect(result.eventName).toBe('Granada Indie Night 2026');
      expect(result.ticketTypeName).toBe('Pista General');
      expect(result.buyerName).toBe('Ana García');
      expect(result.validatedAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException when hash does not exist', async () => {
      repo.findByHash.mockResolvedValue(null);

      await expect(
        service.validateTicket('nonexistent_hash', 'uuid-validator-1'),
      ).rejects.toThrow(NotFoundException);

      expect(repo.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw ConflictException with specific message when ticket is USED', async () => {
      repo.findByHash.mockResolvedValue({
        ...mockTicketDetail,
        status: TicketStatus.USED,
      });

      await expect(
        service.validateTicket('a'.repeat(64), 'uuid-validator-1'),
      ).rejects.toThrow(new ConflictException('Este ticket ya fue utilizado'));

      expect(repo.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw ConflictException with specific message when ticket is CANCELLED', async () => {
      repo.findByHash.mockResolvedValue({
        ...mockTicketDetail,
        status: TicketStatus.CANCELLED,
      });

      await expect(
        service.validateTicket('a'.repeat(64), 'uuid-validator-1'),
      ).rejects.toThrow(new ConflictException('Este ticket fue cancelado'));

      expect(repo.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw ConflictException with specific message when ticket is REFUNDED', async () => {
      repo.findByHash.mockResolvedValue({
        ...mockTicketDetail,
        status: TicketStatus.REFUNDED,
      });

      await expect(
        service.validateTicket('a'.repeat(64), 'uuid-validator-1'),
      ).rejects.toThrow(new ConflictException('Este ticket fue reembolsado'));

      expect(repo.updateStatus).not.toHaveBeenCalled();
    });

    it('should pass the validatorId to updateStatus', async () => {
      await service.validateTicket('a'.repeat(64), 'uuid-validator-99');

      expect(repo.updateStatus).toHaveBeenCalledWith(
        'uuid-ticket-1',
        TicketStatus.USED,
        'uuid-validator-99',
      );
    });

    it('should compose buyerName as name + lastName', async () => {
      prisma.user.findUniqueOrThrow.mockResolvedValue({
        name: 'Carlos',
        lastName: 'Martínez',
      });

      const result = await service.validateTicket('a'.repeat(64), 'uuid-validator-1');

      expect(result.buyerName).toBe('Carlos Martínez');
    });
  });
});

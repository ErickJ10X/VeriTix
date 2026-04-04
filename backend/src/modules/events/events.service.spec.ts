import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from '@common/interfaces';
import { EventStatus, Role } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEventDto, EventQueryDto, UpdateEventDto } from './dto';
import { EventsRepository } from './events.repository';
import { EventsService } from './events.service';

// ── Mock data ────────────────────────────────────────────────────────────────

const mockVenueRow = { id: 'uuid-venue-1' };

const mockEventDetail = {
  id: 'uuid-event-1',
  name: 'Rock en el Foro',
  description: null,
  eventDate: new Date('2025-12-31T21:00:00Z'),
  doorsOpenTime: null,
  startSale: null,
  endSale: null,
  maxCapacity: 5000,
  status: EventStatus.DRAFT,
  imageUrl: null,
  currency: 'MXN',
  creatorId: 'uuid-creator-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  venue: {
    id: 'uuid-venue-1',
    name: 'Foro Sol',
    slug: 'foro-sol',
    address: 'Av. Viaducto',
    city: 'Ciudad de México',
    state: 'CDMX',
    country: 'MX',
    capacity: 65000,
    type: 'FORO',
    imageUrl: null,
  },
  format: null,
  genres: [],
};

const mockEventListItem = {
  id: 'uuid-event-1',
  name: 'Rock en el Foro',
  eventDate: new Date('2025-12-31T21:00:00Z'),
  status: EventStatus.PUBLISHED,
  imageUrl: null,
  currency: 'MXN',
  venue: { id: 'uuid-venue-1', name: 'Foro Sol', city: 'Ciudad de México' },
  format: null,
};

const mockPaginated = {
  data: [mockEventListItem],
  meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
};

// ── Mocks ────────────────────────────────────────────────────────────────────

const mockEventsRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByCreator: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
};

const mockPrismaService = {
  venue: {
    findUnique: jest.fn(),
  },
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('EventsService', () => {
  let service: EventsService;
  let repo: jest.Mocked<EventsRepository>;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: EventsRepository, useValue: mockEventsRepository },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    repo = module.get(EventsRepository) as jest.Mocked<EventsRepository>;
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── create() ─────────────────────────────────────────────────────────────

  describe('create()', () => {
    const dto: CreateEventDto = {
      name: 'Rock en el Foro',
      eventDate: '2025-12-31T21:00:00Z',
      maxCapacity: 5000,
      venueId: 'uuid-venue-1',
    };

    it('should create an event when venue exists', async () => {
      prisma.venue.findUnique.mockResolvedValue(mockVenueRow);
      repo.create.mockResolvedValue(mockEventDetail);

      const result = await service.create('uuid-creator-1', dto);

      expect(prisma.venue.findUnique).toHaveBeenCalledWith({
        where: { id: 'uuid-venue-1' },
        select: { id: true },
      });
      expect(repo.create).toHaveBeenCalledWith({
        ...dto,
        creatorId: 'uuid-creator-1',
      });
      expect(result).toEqual(mockEventDetail);
    });

    it('should throw NotFoundException when venue does not exist', async () => {
      prisma.venue.findUnique.mockResolvedValue(null);

      await expect(service.create('uuid-creator-1', dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  // ── findAll() ─────────────────────────────────────────────────────────────

  describe('findAll()', () => {
    it('should delegate to repository and return paginated response', async () => {
      const query: EventQueryDto = { page: 1, limit: 10 };
      repo.findAll.mockResolvedValue(mockPaginated as any);

      const result = await service.findAll(query);

      expect(result).toEqual(mockPaginated);
      expect(repo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        city: undefined,
        genreId: undefined,
        formatId: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        search: undefined,
      });
    });

    it('should pass filters to repository', async () => {
      const query: EventQueryDto = {
        page: 1,
        limit: 5,
        city: 'CDMX',
        search: 'Rock',
      };
      repo.findAll.mockResolvedValue(mockPaginated as any);

      await service.findAll(query);

      expect(repo.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 5,
        city: 'CDMX',
        genreId: undefined,
        formatId: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        search: 'Rock',
      });
    });
  });

  // ── findMyEvents() ───────────────────────────────────────────────────────

  describe('findMyEvents()', () => {
    it('should delegate to repository findByCreator', async () => {
      repo.findByCreator.mockResolvedValue(mockPaginated as any);

      const result = await service.findMyEvents('uuid-creator-1', 1, 10);

      expect(result).toEqual(mockPaginated);
      expect(repo.findByCreator).toHaveBeenCalledWith('uuid-creator-1', 1, 10);
    });
  });

  // ── findOne() ─────────────────────────────────────────────────────────────

  describe('findOne()', () => {
    const publishedEvent = { ...mockEventDetail, status: EventStatus.PUBLISHED };

    it('should return the event when found and published', async () => {
      repo.findById.mockResolvedValue(publishedEvent);

      const result = await service.findOne('uuid-event-1');

      expect(result).toEqual(publishedEvent);
      expect(repo.findById).toHaveBeenCalledWith('uuid-event-1');
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne('uuid-not-found')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow creator to see their own DRAFT event', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // status: DRAFT
      const creatorUser: JwtPayload = {
        sub: 'uuid-creator-1',
        email: 'creator@test.com',
        role: Role.CREATOR,
      };

      const result = await service.findOne('uuid-event-1', creatorUser);

      expect(result).toEqual(mockEventDetail);
    });

    it('should throw NotFoundException for non-owner trying to see a DRAFT event', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // status: DRAFT, creatorId: uuid-creator-1
      const otherUser: JwtPayload = {
        sub: 'uuid-other-user',
        email: 'other@test.com',
        role: Role.BUYER,
      };

      await expect(service.findOne('uuid-event-1', otherUser)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should allow ADMIN to see any DRAFT event', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // status: DRAFT
      const adminUser: JwtPayload = {
        sub: 'uuid-admin',
        email: 'admin@test.com',
        role: Role.ADMIN,
      };

      const result = await service.findOne('uuid-event-1', adminUser);

      expect(result).toEqual(mockEventDetail);
    });

    it('should throw NotFoundException when unauthenticated user tries to see a DRAFT event', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // status: DRAFT

      await expect(service.findOne('uuid-event-1', undefined)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── update() ─────────────────────────────────────────────────────────────

  describe('update()', () => {
    const dto: UpdateEventDto = { name: 'Rock en el Foro 2025' };
    const updatedEvent = { ...mockEventDetail, name: 'Rock en el Foro 2025' };

    it('should update event when user is the creator', async () => {
      repo.findById.mockResolvedValue(mockEventDetail);
      repo.update.mockResolvedValue(updatedEvent);

      const result = await service.update(
        'uuid-event-1',
        'uuid-creator-1',
        Role.CREATOR,
        dto,
      );

      expect(result).toEqual(updatedEvent);
      expect(repo.update).toHaveBeenCalledWith('uuid-event-1', dto);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.update('uuid-not-found', 'uuid-creator-1', Role.CREATOR, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // creatorId: uuid-creator-1

      await expect(
        service.update('uuid-event-1', 'uuid-other-user', Role.BUYER, dto),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('should allow ADMIN to update any event', async () => {
      repo.findById.mockResolvedValue(mockEventDetail);
      repo.update.mockResolvedValue(updatedEvent);

      const result = await service.update(
        'uuid-event-1',
        'uuid-admin',
        Role.ADMIN,
        dto,
      );

      expect(result).toEqual(updatedEvent);
    });

    it('should validate venueId exists when venueId is provided', async () => {
      const dtoWithVenue: UpdateEventDto = { venueId: 'uuid-venue-2' };
      repo.findById.mockResolvedValue(mockEventDetail);
      prisma.venue.findUnique.mockResolvedValue(null); // venue not found

      await expect(
        service.update('uuid-event-1', 'uuid-creator-1', Role.CREATOR, dtoWithVenue),
      ).rejects.toThrow(NotFoundException);
      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  // ── cancel() ─────────────────────────────────────────────────────────────

  describe('cancel()', () => {
    it('should cancel the event (set status to CANCELLED)', async () => {
      repo.findById.mockResolvedValue(mockEventDetail);
      repo.updateStatus.mockResolvedValue({
        ...mockEventDetail,
        status: EventStatus.CANCELLED,
      });

      await service.cancel('uuid-event-1');

      expect(repo.updateStatus).toHaveBeenCalledWith(
        'uuid-event-1',
        EventStatus.CANCELLED,
      );
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.cancel('uuid-not-found')).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });
  });

  // ── publish() ─────────────────────────────────────────────────────────────

  describe('publish()', () => {
    const publishedEvent = { ...mockEventDetail, status: EventStatus.PUBLISHED };

    it('should publish a DRAFT event when user is the creator', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // status: DRAFT
      repo.updateStatus.mockResolvedValue(publishedEvent);

      const result = await service.publish(
        'uuid-event-1',
        'uuid-creator-1',
        Role.CREATOR,
      );

      expect(result).toEqual(publishedEvent);
      expect(repo.updateStatus).toHaveBeenCalledWith(
        'uuid-event-1',
        EventStatus.PUBLISHED,
      );
    });

    it('should throw NotFoundException when event does not exist', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.publish('uuid-not-found', 'uuid-creator-1', Role.CREATOR),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when event is not in DRAFT status', async () => {
      const alreadyPublished = {
        ...mockEventDetail,
        status: EventStatus.PUBLISHED,
      };
      repo.findById.mockResolvedValue(alreadyPublished);

      await expect(
        service.publish('uuid-event-1', 'uuid-creator-1', Role.CREATOR),
      ).rejects.toThrow(ConflictException);
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // creatorId: uuid-creator-1

      await expect(
        service.publish('uuid-event-1', 'uuid-other-user', Role.BUYER),
      ).rejects.toThrow(ForbiddenException);
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });

    it('should allow ADMIN to publish any DRAFT event', async () => {
      repo.findById.mockResolvedValue(mockEventDetail); // status: DRAFT
      repo.updateStatus.mockResolvedValue(publishedEvent);

      const result = await service.publish('uuid-event-1', 'uuid-admin', Role.ADMIN);

      expect(result).toEqual(publishedEvent);
    });
  });
});

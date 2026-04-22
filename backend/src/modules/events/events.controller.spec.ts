import { Test, TestingModule } from '@nestjs/testing';
import { JwtPayload } from '@common/interfaces';
import { PaginationQueryDto } from '@common/dto';
import { EventStatus, Role } from '../../generated/prisma/enums';
import {
  CreateEventDto,
  EventQueryDto,
  UpdateEventDto,
} from './dto';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

// ── Mock data ────────────────────────────────────────────────────────────────

const mockCreatorUser: JwtPayload = {
  sub: 'uuid-creator-1',
  email: 'creator@test.com',
  role: Role.CREATOR,
};

const mockAdminUser: JwtPayload = {
  sub: 'uuid-admin',
  email: 'admin@test.com',
  role: Role.ADMIN,
};

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

const mockEventsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findMyEvents: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  cancel: jest.fn(),
  publish: jest.fn(),
};

// ── Suite ────────────────────────────────────────────────────────────────────

describe('EventsController', () => {
  let controller: EventsController;
  let service: typeof mockEventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get(EventsService);

    jest.clearAllMocks();
  });

  // ── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should call service.create with creatorId from user and dto', async () => {
      const dto: CreateEventDto = {
        name: 'Rock en el Foro',
        eventDate: '2025-12-31T21:00:00Z',
        maxCapacity: 5000,
        venueId: 'uuid-venue-1',
      };
      service.create.mockResolvedValue(mockEventDetail);

      const result = await controller.create(mockCreatorUser, dto);

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(service.create).toHaveBeenCalledWith('uuid-creator-1', dto);
      expect(result).toEqual(mockEventDetail);
    });
  });

  // ── findAll ──────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should call service.findAll with query and return paginated result', async () => {
      const query: EventQueryDto = { page: 1, limit: 10 };
      service.findAll.mockResolvedValue(mockPaginated);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockPaginated);
    });
  });

  // ── findMyEvents ─────────────────────────────────────────────────────────

  describe('findMyEvents', () => {
    it('should call service.findMyEvents with creatorId, page, limit', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };
      service.findMyEvents.mockResolvedValue(mockPaginated);

      const result = await controller.findMyEvents(mockCreatorUser, query);

      expect(service.findMyEvents).toHaveBeenCalledTimes(1);
      expect(service.findMyEvents).toHaveBeenCalledWith('uuid-creator-1', 1, 10);
      expect(result).toEqual(mockPaginated);
    });
  });

  // ── findOne ──────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should call service.findOne with id and user', async () => {
      service.findOne.mockResolvedValue(mockEventDetail);

      const result = await controller.findOne('uuid-event-1', mockCreatorUser);

      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith('uuid-event-1', mockCreatorUser);
      expect(result).toEqual(mockEventDetail);
    });
  });

  // ── update ───────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should call service.update with id, userId, userRole, and dto', async () => {
      const dto: UpdateEventDto = { name: 'Rock en el Foro 2025' };
      const updated = { ...mockEventDetail, name: 'Rock en el Foro 2025' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update('uuid-event-1', mockCreatorUser, dto);

      expect(service.update).toHaveBeenCalledTimes(1);
      expect(service.update).toHaveBeenCalledWith(
        'uuid-event-1',
        'uuid-creator-1',
        Role.CREATOR,
        dto,
      );
      expect(result).toEqual(updated);
    });
  });

  // ── cancel ───────────────────────────────────────────────────────────────

  describe('cancel', () => {
    it('should call service.cancel with id and return void', async () => {
      service.cancel.mockResolvedValue(undefined);

      await controller.cancel('uuid-event-1');

      expect(service.cancel).toHaveBeenCalledTimes(1);
      expect(service.cancel).toHaveBeenCalledWith('uuid-event-1');
    });
  });

  // ── publish ──────────────────────────────────────────────────────────────

  describe('publish', () => {
    it('should call service.publish with id, userId, userRole', async () => {
      const published = { ...mockEventDetail, status: EventStatus.PUBLISHED };
      service.publish.mockResolvedValue(published);

      const result = await controller.publish('uuid-event-1', mockAdminUser);

      expect(service.publish).toHaveBeenCalledTimes(1);
      expect(service.publish).toHaveBeenCalledWith(
        'uuid-event-1',
        'uuid-admin',
        Role.ADMIN,
      );
      expect(result).toEqual(published);
    });
  });
});

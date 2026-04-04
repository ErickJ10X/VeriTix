import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginatedResponse } from '@common/dto';
import { JwtPayload } from '@common/interfaces';
import { EventStatus, Role } from '../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateEventDto,
  EventDetailResponseDto,
  EventListResponseDto,
  EventQueryDto,
  UpdateEventDto,
} from './dto';
import {
  EventDetail,
  EventListItem,
  EventsRepository,
} from './events.repository';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ── Private helpers ──────────────────────────────────────────────────────

  private async validateVenueExists(venueId: string): Promise<void> {
    const venue = await this.prisma.venue.findUnique({
      where: { id: venueId },
      select: { id: true },
    });
    if (!venue) throw new NotFoundException('Recinto no encontrado');
  }

  private assertOwnerOrAdmin(
    event: { creatorId: string },
    userId: string,
    userRole: Role,
  ): void {
    if (event.creatorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'No tenés permiso para modificar este evento',
      );
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  async create(
    creatorId: string,
    dto: CreateEventDto,
  ): Promise<EventDetailResponseDto> {
    await this.validateVenueExists(dto.venueId);

    const created = await this.eventsRepository.create({
      ...dto,
      creatorId,
    });

    return created as unknown as EventDetailResponseDto;
  }

  async findAll(
    query: EventQueryDto,
  ): Promise<PaginatedResponse<EventListResponseDto>> {
    return this.eventsRepository.findAll({
      page: query.page,
      limit: query.limit,
      city: query.city,
      genreId: query.genreId,
      formatId: query.formatId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      search: query.search,
    }) as Promise<PaginatedResponse<EventListResponseDto>>;
  }

  async findMyEvents(
    creatorId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<EventListResponseDto>> {
    return this.eventsRepository.findByCreator(
      creatorId,
      page,
      limit,
    ) as Promise<PaginatedResponse<EventListResponseDto>>;
  }

  async findOne(
    id: string,
    requestingUser?: JwtPayload,
  ): Promise<EventDetailResponseDto> {
    const event = await this.eventsRepository.findById(id);
    if (!event) throw new NotFoundException('Evento no encontrado');

    if (event.status === EventStatus.DRAFT) {
      const isCreator = requestingUser?.sub === event.creatorId;
      const isAdmin = requestingUser?.role === Role.ADMIN;
      if (!isCreator && !isAdmin) {
        throw new NotFoundException('Evento no encontrado');
      }
    }

    return event as unknown as EventDetailResponseDto;
  }

  async update(
    id: string,
    userId: string,
    userRole: Role,
    dto: UpdateEventDto,
  ): Promise<EventDetailResponseDto> {
    const event = await this.eventsRepository.findById(id);
    if (!event) throw new NotFoundException('Evento no encontrado');

    this.assertOwnerOrAdmin(event, userId, userRole);

    if (dto.venueId) {
      await this.validateVenueExists(dto.venueId);
    }

    const updated = await this.eventsRepository.update(id, dto);
    return updated as unknown as EventDetailResponseDto;
  }

  async cancel(id: string): Promise<void> {
    const event = await this.eventsRepository.findById(id);
    if (!event) throw new NotFoundException('Evento no encontrado');

    await this.eventsRepository.updateStatus(id, EventStatus.CANCELLED);
  }

  async publish(
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<EventDetailResponseDto> {
    const event = await this.eventsRepository.findById(id);
    if (!event) throw new NotFoundException('Evento no encontrado');

    this.assertOwnerOrAdmin(event, userId, userRole);

    if (event.status !== EventStatus.DRAFT) {
      throw new ConflictException(
        'El evento solo puede publicarse si está en estado DRAFT',
      );
    }

    const published = await this.eventsRepository.updateStatus(
      id,
      EventStatus.PUBLISHED,
    );
    return published as unknown as EventDetailResponseDto;
  }
}

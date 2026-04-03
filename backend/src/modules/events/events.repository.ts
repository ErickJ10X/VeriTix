import { Injectable } from '@nestjs/common';
import { PaginatedResponse, createPaginatedResponse } from '@common/dto';
import { EventStatus } from '../../generated/prisma/enums';
import type { EventWhereInput } from '../../generated/prisma/models';
import { PrismaService } from '../../prisma/prisma.service';

// ── Select constants ──────────────────────────────────────────────────────────

export const EVENT_LIST_SELECT = {
  id: true,
  name: true,
  eventDate: true,
  status: true,
  imageUrl: true,
  currency: true,
  venue: { select: { id: true, name: true, city: true } },
  format: { select: { id: true, name: true } },
} as const;

export const EVENT_DETAIL_SELECT = {
  id: true,
  name: true,
  description: true,
  eventDate: true,
  doorsOpenTime: true,
  startSale: true,
  endSale: true,
  maxCapacity: true,
  status: true,
  imageUrl: true,
  currency: true,
  creatorId: true,
  createdAt: true,
  updatedAt: true,
  venue: {
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      city: true,
      state: true,
      country: true,
      capacity: true,
      type: true,
      imageUrl: true,
    },
  },
  format: {
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
    },
  },
  genres: { select: { id: true, name: true, slug: true } },
} as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export type EventListItem = {
  id: string;
  name: string;
  eventDate: Date;
  status: EventStatus;
  imageUrl: string | null;
  currency: string;
  venue: { id: string; name: string; city: string };
  format: { id: string; name: string } | null;
};

export type EventDetail = {
  id: string;
  name: string;
  description: string | null;
  eventDate: Date;
  doorsOpenTime: Date | null;
  startSale: Date | null;
  endSale: Date | null;
  maxCapacity: number;
  status: EventStatus;
  imageUrl: string | null;
  currency: string;
  creatorId: string;
  createdAt: Date;
  updatedAt: Date;
  venue: {
    id: string;
    name: string;
    slug: string;
    address: string;
    city: string;
    state: string | null;
    country: string;
    capacity: number | null;
    type: string;
    imageUrl: string | null;
  };
  format: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
  } | null;
  genres: { id: string; name: string; slug: string }[];
};

export type CreateEventData = {
  name: string;
  description?: string;
  eventDate: string;
  doorsOpenTime?: string;
  startSale?: string;
  endSale?: string;
  maxCapacity: number;
  imageUrl?: string;
  currency?: string;
  creatorId: string;
  venueId: string;
  formatId?: string;
  genreIds?: string[];
};

export type UpdateEventData = Partial<{
  name: string;
  description: string | null;
  eventDate: string;
  doorsOpenTime: string | null;
  startSale: string | null;
  endSale: string | null;
  maxCapacity: number;
  imageUrl: string | null;
  currency: string;
  venueId: string;
  formatId: string | null;
  genreIds: string[];
}>;

export type FindAllEventsParams = {
  page: number;
  limit: number;
  city?: string;
  genreId?: string;
  formatId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

// ── Repository ────────────────────────────────────────────────────────────────

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── Queries ─────────────────────────────────────────────────────────────

  async findAll(
    params: FindAllEventsParams,
  ): Promise<PaginatedResponse<EventListItem>> {
    const { page, limit, city, genreId, formatId, dateFrom, dateTo, search } =
      params;

    const where: EventWhereInput = {
      status: EventStatus.PUBLISHED,
    };

    if (city !== undefined)
      where.venue = { city: { contains: city, mode: 'insensitive' } };
    if (genreId !== undefined) where.genres = { some: { id: genreId } };
    if (formatId !== undefined) where.formatId = formatId;
    if (dateFrom !== undefined || dateTo !== undefined) {
      where.eventDate = {};
      if (dateFrom !== undefined) where.eventDate.gte = new Date(dateFrom);
      if (dateTo !== undefined) where.eventDate.lte = new Date(dateTo);
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        select: EVENT_LIST_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { eventDate: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return createPaginatedResponse(
      data as EventListItem[],
      total,
      page,
      limit,
    );
  }

  async findByCreator(
    creatorId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<EventListItem>> {
    const where: EventWhereInput = { creatorId };

    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        select: EVENT_LIST_SELECT,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return createPaginatedResponse(
      data as EventListItem[],
      total,
      page,
      limit,
    );
  }

  findById(id: string): Promise<EventDetail | null> {
    return this.prisma.event.findUnique({
      where: { id },
      select: EVENT_DETAIL_SELECT,
    }) as Promise<EventDetail | null>;
  }

  // ── Mutations ────────────────────────────────────────────────────────────

  create(data: CreateEventData): Promise<EventDetail> {
    const { genreIds, ...rest } = data;
    return this.prisma.event.create({
      data: {
        ...rest,
        ...(genreIds && genreIds.length > 0
          ? { genres: { connect: genreIds.map((id) => ({ id })) } }
          : {}),
      },
      select: EVENT_DETAIL_SELECT,
    }) as Promise<EventDetail>;
  }

  update(id: string, data: UpdateEventData): Promise<EventDetail> {
    const { genreIds, ...rest } = data;
    return this.prisma.event.update({
      where: { id },
      data: {
        ...rest,
        ...(genreIds !== undefined
          ? { genres: { set: genreIds.map((gid) => ({ id: gid })) } }
          : {}),
      },
      select: EVENT_DETAIL_SELECT,
    }) as Promise<EventDetail>;
  }

  updateStatus(id: string, status: EventStatus): Promise<EventDetail> {
    return this.prisma.event.update({
      where: { id },
      data: { status },
      select: EVENT_DETAIL_SELECT,
    }) as Promise<EventDetail>;
  }
}

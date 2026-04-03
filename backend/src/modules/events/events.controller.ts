import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, Public, Roles } from '@common/decorators';
import { PaginationQueryDto } from '@common/dto';
import { JwtPayload } from '@common/interfaces';
import { Role } from '../../generated/prisma/enums';
import {
  CreateEventDto,
  EventDetailResponseDto,
  EventListResponseDto,
  EventQueryDto,
  UpdateEventDto,
} from './dto';
import { EventsService } from './events.service';

@ApiTags('Eventos')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.CREATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear evento (creator o admin)' })
  @ApiCreatedResponse({
    description: 'Evento creado exitosamente.',
    type: EventDetailResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Recinto no encontrado.' })
  @ApiForbiddenResponse({ description: 'Acceso restringido a creadores y administradores.' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateEventDto,
  ): Promise<EventDetailResponseDto> {
    return this.eventsService.create(user.sub, dto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar eventos publicados (público, paginado)' })
  @ApiOkResponse({ description: 'Lista paginada de eventos publicados.' })
  findAll(@Query() query: EventQueryDto) {
    return this.eventsService.findAll(query);
  }

  // IMPORTANT: my-events MUST be defined before :id to avoid route conflict
  @Get('my-events')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar mis eventos (todos los estados, autenticado)' })
  @ApiOkResponse({ description: 'Lista paginada de eventos del usuario autenticado.' })
  findMyEvents(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationQueryDto,
  ) {
    return this.eventsService.findMyEvents(user.sub, query.page, query.limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Obtener evento por ID (público)' })
  @ApiOkResponse({
    description: 'Evento encontrado.',
    type: EventDetailResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<EventDetailResponseDto> {
    return this.eventsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.CREATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar evento (propio creator o admin)' })
  @ApiOkResponse({
    description: 'Evento actualizado exitosamente.',
    type: EventDetailResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiForbiddenResponse({ description: 'No tenés permiso para modificar este evento.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateEventDto,
  ): Promise<EventDetailResponseDto> {
    return this.eventsService.update(id, user.sub, user.role, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar evento (solo admin)' })
  @ApiNoContentResponse({ description: 'Evento cancelado exitosamente.' })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiForbiddenResponse({ description: 'Acceso restringido a administradores.' })
  cancel(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.eventsService.cancel(id);
  }

  @Post(':id/publish')
  @Roles(Role.ADMIN, Role.CREATOR)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Publicar evento (propio creator o admin)' })
  @ApiOkResponse({
    description: 'Evento publicado exitosamente.',
    type: EventDetailResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Evento no encontrado.' })
  @ApiConflictResponse({ description: 'El evento debe estar en estado DRAFT para publicarse.' })
  @ApiForbiddenResponse({ description: 'No tenés permiso para publicar este evento.' })
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<EventDetailResponseDto> {
    return this.eventsService.publish(id, user.sub, user.role);
  }
}

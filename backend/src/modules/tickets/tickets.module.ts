import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TicketsController } from './tickets.controller';
import { TicketsGenerator } from './tickets.generator';
import { TicketsRepository } from './tickets.repository';
import { TicketsService } from './tickets.service';

@Module({
  imports: [PrismaModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketsRepository, TicketsGenerator],
  exports: [TicketsGenerator],
})
export class TicketsModule {}

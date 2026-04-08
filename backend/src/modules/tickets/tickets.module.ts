import { Module } from '@nestjs/common';
import { TicketsGenerator } from './tickets.generator';

@Module({
  providers: [TicketsGenerator],
  exports: [TicketsGenerator],
})
export class TicketsModule {}

import { Module } from '@nestjs/common';
import { ConcertFormatsController } from './concert-formats.controller';
import { ConcertFormatsRepository } from './concert-formats.repository';
import { ConcertFormatsService } from './concert-formats.service';

@Module({
  controllers: [ConcertFormatsController],
  providers: [ConcertFormatsService, ConcertFormatsRepository],
  exports: [ConcertFormatsService],
})
export class ConcertFormatsModule {}

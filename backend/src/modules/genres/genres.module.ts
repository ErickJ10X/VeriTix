import { Module } from '@nestjs/common';
import { GenresController } from './genres.controller';
import { GenresRepository } from './genres.repository';
import { GenresService } from './genres.service';

@Module({
  controllers: [GenresController],
  providers: [GenresService, GenresRepository],
  exports: [GenresService],
})
export class GenresModule {}

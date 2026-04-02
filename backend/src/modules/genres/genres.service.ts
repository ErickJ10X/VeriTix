import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGenreDto, GenreResponseDto, UpdateGenreDto } from './dto';
import { GenresRepository } from './genres.repository';

@Injectable()
export class GenresService {
  constructor(private readonly genresRepository: GenresRepository) {}

  async create(dto: CreateGenreDto): Promise<GenreResponseDto> {
    const existingSlug = await this.genresRepository.findBySlug(dto.slug);
    if (existingSlug) {
      throw new ConflictException('El slug ya está en uso por otro género');
    }

    const existingName = await this.genresRepository.findByName(dto.name);
    if (existingName) {
      throw new ConflictException('El nombre ya está en uso por otro género');
    }

    const created = await this.genresRepository.create(dto);
    return created as GenreResponseDto;
  }

  async findAll(): Promise<GenreResponseDto[]> {
    const genres = await this.genresRepository.findAll();
    return genres as GenreResponseDto[];
  }

  async findOne(id: string): Promise<GenreResponseDto> {
    const genre = await this.genresRepository.findById(id);
    if (!genre) throw new NotFoundException('Género no encontrado');
    return genre as GenreResponseDto;
  }

  async update(id: string, dto: UpdateGenreDto): Promise<GenreResponseDto> {
    const current = await this.genresRepository.findById(id);
    if (!current) throw new NotFoundException('Género no encontrado');

    if (dto.slug && dto.slug !== current.slug) {
      const existingSlug = await this.genresRepository.findBySlug(dto.slug);
      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException('El slug ya está en uso por otro género');
      }
    }

    if (dto.name && dto.name !== current.name) {
      const existingName = await this.genresRepository.findByName(dto.name);
      if (existingName && existingName.id !== id) {
        throw new ConflictException('El nombre ya está en uso por otro género');
      }
    }

    const updated = await this.genresRepository.update(id, dto);
    return updated as GenreResponseDto;
  }

  async remove(id: string): Promise<void> {
    const genre = await this.genresRepository.findById(id);
    if (!genre) throw new NotFoundException('Género no encontrado');

    await this.genresRepository.delete(id);
  }
}

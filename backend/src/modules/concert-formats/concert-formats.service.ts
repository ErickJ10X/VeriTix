import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ConcertFormatResponseDto,
  CreateConcertFormatDto,
  UpdateConcertFormatDto,
} from './dto';
import { ConcertFormatsRepository } from './concert-formats.repository';

@Injectable()
export class ConcertFormatsService {
  constructor(
    private readonly concertFormatsRepository: ConcertFormatsRepository,
  ) {}

  async create(dto: CreateConcertFormatDto): Promise<ConcertFormatResponseDto> {
    const existingSlug = await this.concertFormatsRepository.findBySlug(
      dto.slug,
    );
    if (existingSlug) {
      throw new ConflictException(
        'El slug ya está en uso por otro formato de concierto',
      );
    }

    const existingName = await this.concertFormatsRepository.findByName(
      dto.name,
    );
    if (existingName) {
      throw new ConflictException(
        'El nombre ya está en uso por otro formato de concierto',
      );
    }

    const created = await this.concertFormatsRepository.create(dto);
    return created as ConcertFormatResponseDto;
  }

  async findAll(): Promise<ConcertFormatResponseDto[]> {
    const formats = await this.concertFormatsRepository.findAll();
    return formats as ConcertFormatResponseDto[];
  }

  async findOne(id: string): Promise<ConcertFormatResponseDto> {
    const format = await this.concertFormatsRepository.findById(id);
    if (!format) {
      throw new NotFoundException('Formato de concierto no encontrado');
    }
    return format as ConcertFormatResponseDto;
  }

  async update(
    id: string,
    dto: UpdateConcertFormatDto,
  ): Promise<ConcertFormatResponseDto> {
    const current = await this.concertFormatsRepository.findById(id);
    if (!current) {
      throw new NotFoundException('Formato de concierto no encontrado');
    }

    if (dto.slug && dto.slug !== current.slug) {
      const existingSlug = await this.concertFormatsRepository.findBySlug(
        dto.slug,
      );
      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException(
          'El slug ya está en uso por otro formato de concierto',
        );
      }
    }

    if (dto.name && dto.name !== current.name) {
      const existingName = await this.concertFormatsRepository.findByName(
        dto.name,
      );
      if (existingName && existingName.id !== id) {
        throw new ConflictException(
          'El nombre ya está en uso por otro formato de concierto',
        );
      }
    }

    const updated = await this.concertFormatsRepository.update(id, dto);
    return updated as ConcertFormatResponseDto;
  }

  async remove(id: string): Promise<void> {
    const format = await this.concertFormatsRepository.findById(id);
    if (!format) {
      throw new NotFoundException('Formato de concierto no encontrado');
    }

    await this.concertFormatsRepository.delete(id);
  }
}

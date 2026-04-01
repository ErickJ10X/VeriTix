import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class UpdateArtistDto {
  @ApiPropertyOptional({
    example: 'The Rolling Stones',
    description: 'Nombre del artista.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name?: string;

  @ApiPropertyOptional({
    example: 'the-rolling-stones',
    description: 'Slug único del artista. Solo minúsculas, números y guiones.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El slug no puede estar vacío' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'El slug solo puede contener minúsculas, números y guiones (ej: the-rolling-stones)',
  })
  slug?: string;

  @ApiPropertyOptional({
    example: 'Banda de rock británica formada en 1962.',
    description: 'Biografía del artista. Puede ser nula.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  bio?: string | null;

  @ApiPropertyOptional({
    example: 'https://cdn.veritix.com/artists/rolling-stones.jpg',
    description: 'URL de la imagen del artista. Puede ser nula.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @ApiPropertyOptional({
    example: 'GB',
    description: 'País de origen del artista. Puede ser nulo.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  country?: string | null;

  @ApiPropertyOptional({
    example: 'https://www.rollingstones.com',
    description: 'Sitio web del artista. Puede ser nulo.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  website?: string | null;

  @ApiPropertyOptional({
    example: true,
    description:
      'Indica si el artista está activo. Usar para reactivar un artista.',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: ['uuid-genre-1', 'uuid-genre-2'],
    description:
      'IDs de los géneros musicales. Reemplaza completamente la lista actual de géneros.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  genreIds?: string[];
}

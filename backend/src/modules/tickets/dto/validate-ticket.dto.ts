import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ValidateTicketDto {
  @ApiProperty({
    example: 'a3f8e1d2b4c7f9a2e6d1b8f3c5a7e9d4b2f6a1c8e3d7b5f2a9c4e6d8b1f7a3c5',
    description: 'Hash SHA256 del ticket a validar (64 caracteres hexadecimales).',
  })
  @IsString()
  @Length(64, 64, { message: 'El hash debe tener exactamente 64 caracteres' })
  hash: string;
}

export class ValidateTicketResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  ticketId: string;

  @ApiProperty({ example: 'Granada Indie Night 2026' })
  eventName: string;

  @ApiProperty({ example: 'Pista General' })
  ticketTypeName: string;

  @ApiProperty({ example: 'Ana García' })
  buyerName: string;

  @ApiProperty({ example: '2026-09-19T21:35:00.000Z' })
  validatedAt: Date;
}

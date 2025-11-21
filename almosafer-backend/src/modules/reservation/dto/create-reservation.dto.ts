import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus } from '../../../shared/constants/enums';

export class CreateReservationDto {
  @ApiProperty({
    description: 'Name of the guest making the reservation',
    example: 'Jane Doe',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Contact phone number in E.164 format',
    example: '+15551234567',
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/, {
    message: 'phone must be an international number (E.164)',
  })
  phone: string;

  @ApiProperty({
    description: 'Reservation date (ISO 8601)',
    example: '2025-01-15',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Reservation time in 24h HH:mm format',
    example: '18:30',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'time must be HH:mm in 24h format',
  })
  time: string;

  @ApiProperty({
    description: 'Number of guests in the group',
    example: 4,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  seatCount: number;

  @ApiProperty({
    description: 'Identifier of the workflow triggering the request',
    example: 'aRdeiHMOzg8gLuEk',
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  workflow: string;

  @ApiPropertyOptional({
    description: 'Current status of the reservation',
    enum: ReservationStatus,
    example: ReservationStatus.PENDING,
  })
  @IsOptional()
  @IsIn(Object.values(ReservationStatus))
  status?: ReservationStatus;

  @ApiPropertyOptional({
    description: 'Optional notes for special requests',
    example: 'Window seat, celebrating anniversary',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

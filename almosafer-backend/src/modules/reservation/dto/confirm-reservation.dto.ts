import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class ConfirmReservationDto {
  @ApiProperty({
    description: 'Unique identifier of the reservation to confirm',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;

  @ApiProperty({
    description: 'Phone number of the customer requesting confirmation',
    example: '+15551234567',
  })
  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/, {
    message: 'phone must be an international number (E.164)',
  })
  phone: string;

  @ApiProperty({
    description: 'Identifier of the workflow triggering the request',
    example: 'aRdeiHMOzg8gLuEk',
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  workflow: string;
}

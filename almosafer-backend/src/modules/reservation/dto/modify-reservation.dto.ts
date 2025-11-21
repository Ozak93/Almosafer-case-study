import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './create-reservation.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ModifyReservationDto extends PartialType(CreateReservationDto) {
  @ApiProperty({
    description: 'Unique identifier of the reservation being updated',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id: number;
}

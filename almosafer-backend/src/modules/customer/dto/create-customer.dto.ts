import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Sara Hamdan' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({ example: '+962777783723', required: true })
  @IsString()
  @Length(1, 20)
  phone?: string;
}

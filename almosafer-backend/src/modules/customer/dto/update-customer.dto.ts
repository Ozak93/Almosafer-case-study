import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomerDto } from './create-customer.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiProperty({ example: '+962777783723', required: true })
  @IsString()
  @Length(1, 20)
  phone: string;
}

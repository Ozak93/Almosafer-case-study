import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from './customer.service';
import { Customer } from './customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  controllers: [],
  providers: [CustomerService],
  exports: [CustomerService],
})
export class CustomerModule {}

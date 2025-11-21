import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './reservation.entity';
import { CustomerModule } from '../customer/customer.module';

@Module({
  providers: [ReservationService],
  controllers: [ReservationController],
  imports: [TypeOrmModule.forFeature([Reservation]), CustomerModule],
})
export class ReservationModule {}

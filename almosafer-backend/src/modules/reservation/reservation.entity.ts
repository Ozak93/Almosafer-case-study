import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus } from '../../shared/constants/enums';
import { Customer } from '../customer/customer.entity';

@Entity('reservation')
export class Reservation {
  @ApiProperty({
    type: 'number',
    description: 'Unique identifier of the reservation',
    example: '1',
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Name of the customer reserving the table',
    example: 'Jane Doe',
  })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+962777785648',
  })
  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @ApiProperty({
    description: 'Reservation date (ISO 8601)',
    example: '2025-01-15',
  })
  @Column({ type: 'varchar', length: 10 })
  date: string;

  @ApiProperty({
    description: 'Reservation time in HH:mm',
    example: '18:30',
  })
  @Column({ type: 'varchar', length: 5 })
  time: string;

  @ApiProperty({
    description: 'Group size',
    example: 4,
    minimum: 1,
    maximum: 10,
    required: true,
  })
  @Column({ type: 'int', unsigned: true })
  seatCount: number;

  @ApiProperty({
    description: 'Identifier of the workflow that generated the reservation',
    example: 'aRdeiHMOzg8gLuEk',
    maxLength: 64,
  })
  @Column({ type: 'varchar', length: 64 })
  workflow: string;

  @ManyToOne(() => Customer, (customer) => customer.reservations, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({ name: 'customer_id', referencedColumnName: 'id' })
  customer: Customer;

  @ApiProperty({
    description: 'Current reservation status',
    enum: ReservationStatus,
    example: ReservationStatus.PENDING,
    default: ReservationStatus.PENDING,
  })
  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @ApiProperty({
    description: 'Optional notes or requests',
    example: 'Window seat, celebrating anniversary',
    required: false,
  })
  @Column({ type: 'varchar', length: 500, nullable: true })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Optional reason provided when cancelling a reservation',
    example: 'Customer called to cancel due to illness',
    maxLength: 200,
    required: false,
  })
  @Column({ type: 'varchar', length: 200, nullable: true })
  cancellationReason?: string | null;
}

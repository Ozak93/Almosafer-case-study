import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Reservation } from '../reservation/reservation.entity';

@Entity('customers')
export class Customer {
  @ApiProperty({
    description: 'Unique identifier of the customer',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Customer first name',
    example: 'Sara',
  })
  @Column({ type: 'varchar', length: 20 })
  name: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+962777783647',
    required: true,
  })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @OneToMany(() => Reservation, (reservation) => reservation.customer, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  reservations: Reservation[];

  @ApiProperty({
    description: 'Date when the record was created',
    example: '2025-01-01T12:00:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the record was last updated',
    example: '2025-01-05T09:30:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}

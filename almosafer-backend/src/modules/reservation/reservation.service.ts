import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { Reservation } from './reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ReservationStatus } from '../../shared/constants/enums';
import { CustomerService } from '../customer/customer.service';
import { Customer } from '../customer/customer.entity';
import { ModifyReservationDto } from './dto/modify-reservation.dto';
import { ConfirmReservationDto } from './dto/confirm-reservation.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly customerService: CustomerService,
  ) {}

  async create(
    createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    let customer: Customer | null = await this.customerService.findByPhone(
      createReservationDto.phone,
    );

    if (!customer) {
      customer = await this.customerService.create({
        name: createReservationDto.name,
        phone: createReservationDto.phone,
      });
    }
    const reservation = this.reservationRepository.create({
      ...createReservationDto,
      status: createReservationDto.status ?? ReservationStatus.PENDING,
      customer: customer,
    });

    return this.reservationRepository.save(reservation);
  }

  findAll(phone: string, workflow: string): Promise<Reservation[]> {
    return this.reservationRepository.find({
      where: { phone: Equal(phone), workflow: Equal(workflow) },
    });
  }

  async modify(
    modifyReservationDto: ModifyReservationDto,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: modifyReservationDto.id },
      relations: ['customer'],
    });

    if (!reservation) {
      throw new NotFoundException(
        `Reservation with id ${modifyReservationDto.id} not found`,
      );
    }

    if (!modifyReservationDto.workflow) {
      throw new BadRequestException('workflow is required');
    }

    if (reservation.workflow !== modifyReservationDto.workflow) {
      throw new BadRequestException(
        'workflow does not match reservation record',
      );
    }

    const updateFields: Partial<ModifyReservationDto> = {
      ...modifyReservationDto,
    };
    delete updateFields.id;
    delete updateFields.workflow;
    Object.assign(reservation, updateFields);

    return await this.reservationRepository.save(reservation);
  }

  async confirm(
    confirmReservationDto: ConfirmReservationDto,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepository.findOne({
      where: { id: confirmReservationDto.id },
      relations: ['customer'],
    });

    if (!reservation) {
      throw new NotFoundException(
        `Reservation with id ${confirmReservationDto.id} not found`,
      );
    }

    if (reservation.workflow !== confirmReservationDto.workflow) {
      throw new BadRequestException(
        'workflow does not match reservation record',
      );
    }

    if (reservation.customer?.phone !== confirmReservationDto.phone) {
      throw new BadRequestException(
        'Phone number does not match reservation customer',
      );
    }

    reservation.status = ReservationStatus.CONFIRMED;
    reservation.cancellationReason = null;

    return this.reservationRepository.save(reservation);
  }

  async cancel(
    cancelReservationDto: CancelReservationDto,
  ): Promise<Reservation> {
    console.log(
      `got cancelReservationDto: ${JSON.stringify(cancelReservationDto)}`,
    );
    const reservation = await this.reservationRepository.findOne({
      where: { id: cancelReservationDto.id },
      relations: ['customer'],
    });

    console.log(`got reservation: ${JSON.stringify(reservation)}`);

    if (!reservation) {
      throw new NotFoundException(
        `Reservation with id ${cancelReservationDto.id} not found`,
      );
    }

    if (reservation.workflow !== cancelReservationDto.workflow) {
      throw new BadRequestException(
        'workflow does not match reservation record',
      );
    }

    if (reservation.customer?.phone !== cancelReservationDto.phone) {
      throw new BadRequestException(
        'Phone number does not match reservation customer',
      );
    }

    reservation.status = ReservationStatus.CANCELLED;
    reservation.cancellationReason =
      cancelReservationDto.cancellationReason ?? null;

    return this.reservationRepository.save(reservation);
  }
}

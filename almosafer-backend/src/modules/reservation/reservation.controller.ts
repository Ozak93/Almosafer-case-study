import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { Reservation } from './reservation.entity';
import { ApiKeyGuard } from 'src/modules/auth/api-key.guard';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { API_KEY_HEADER } from 'src/shared/constants/api-key.constants';
import { ModifyReservationDto } from './dto/modify-reservation.dto';
import { ConfirmReservationDto } from './dto/confirm-reservation.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';

@ApiTags('reservation')
@ApiSecurity(API_KEY_HEADER)
@Controller('reservation')
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @UseGuards(ApiKeyGuard)
  @ApiCreatedResponse({
    description: 'Successfully created reservation',
    type: Reservation,
  })
  @ApiBody({ type: CreateReservationDto })
  create(
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    return this.reservationService.create(createReservationDto);
  }

  @Get('ByPhone')
  @UseGuards(ApiKeyGuard)
  @ApiOkResponse({
    description: 'List of reservations',
    type: Reservation,
    isArray: true,
  })
  findAll(
    @Query('phone') phone?: string,
    @Query('workflow') workflow?: string,
  ): Promise<Reservation[]> {
    console.log(`got phone: ${phone}`);
    if (!phone) {
      throw new BadRequestException('phone is required');
    }

    if (!workflow) {
      throw new BadRequestException('workflow is required');
    }

    if (!/^\+?[1-9]\d{7,14}$/.test(phone)) {
      throw new BadRequestException(
        'phone must be an international number (E.164)',
      );
    }

    return this.reservationService.findAll(phone, workflow);
  }

  @Patch()
  @UseGuards(ApiKeyGuard)
  @ApiOkResponse({
    description: 'Successfully updated reservation',
    type: Reservation,
  })
  @ApiBody({ type: ModifyReservationDto })
  modify(
    @Body() modifyReservationDto: ModifyReservationDto,
  ): Promise<Reservation> {
    return this.reservationService.modify(modifyReservationDto);
  }

  @Post('confirm')
  @UseGuards(ApiKeyGuard)
  @ApiOkResponse({
    description: 'Reservation confirmation updated',
    type: Reservation,
  })
  @ApiBody({ type: ConfirmReservationDto })
  confirm(
    @Body() confirmReservationDto: ConfirmReservationDto,
  ): Promise<Reservation> {
    return this.reservationService.confirm(confirmReservationDto);
  }
  @Post('cancel')
  @UseGuards(ApiKeyGuard)
  @ApiOkResponse({
    description: 'Reservation cancellation recorded',
    type: Reservation,
  })
  @ApiBody({ type: CancelReservationDto })
  cancel(
    @Body() cancelReservationDto: CancelReservationDto,
  ): Promise<Reservation> {
    return this.reservationService.cancel(cancelReservationDto);
  }
}

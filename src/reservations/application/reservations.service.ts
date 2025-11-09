import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reservation, ReservationStatus } from '../domain/reservation.entity';
import { DataSource, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Restaurant } from 'src/restaurants/domain/restaurant.entity';
import { ReservationsValidatorService } from './reservations-validator.service';
import { NotificationsService } from 'src/notifications/application/notifications.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,

    @InjectRepository(Restaurant)
    private restaurantsRepository: Repository<Restaurant>,
    private reservationsValidatorService: ReservationsValidatorService,
    private notificationsService: NotificationsService,
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async create(dto: CreateReservationDto): Promise<Reservation> {
    const FRONTEND_URL = this.configService.get<string>('FRONTEND_URL');
    if (!FRONTEND_URL) {
      throw new Error('Frontend url not set in enviroment');
    }

    const restaurant = await this.restaurantsRepository.findOne({
      where: {
        id: dto.restaurantId,
      },
    });
    if (!restaurant) throw new NotFoundException('Restauracja nie istnieje');

    const reservationDateTimeString = `${dto.date}T${dto.time}:00`;
    const date = new Date(reservationDateTimeString);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Nieprawidłowy format daty lub czasu');
    }

    this.reservationsValidatorService.validateDate(date);
    this.reservationsValidatorService.validateOpeningHours(
      date,
      restaurant.openHours,
    );
    this.reservationsValidatorService.validateReservationInterval(date);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reservation = queryRunner.manager.create(Reservation, {
        ...dto,
        status: ReservationStatus.PENDING,
        cancelToken: randomUUID(),
      });

      const savedReservation = await queryRunner.manager.save(
        Reservation,
        reservation,
      );

      const cancelUrl = `${FRONTEND_URL}/reservations/cancel/${savedReservation.cancelToken}`;

      await this.notificationsService.sendReservationCreated(
        dto.email,
        dto.name,
        cancelUrl,
      );

      await queryRunner.commitTransaction();
      return savedReservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findStatus(id: string): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
    });
    if (!reservation) {
      throw new NotFoundException('Rezerwacja nie istnieje');
    }
    return reservation;
  }

  async cancelByToken(token: string): Promise<{ message: string }> {
    const reservation = await this.reservationsRepository.findOne({
      where: { cancelToken: token },
    });
    if (!reservation) {
      throw new NotFoundException('Nie znaleziono rezerwacji');
    }
    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Rezerwacja jest już anulowana.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      reservation.status = ReservationStatus.CANCELLED;
      const savedReservation = await queryRunner.manager.save(reservation);

      await this.notificationsService.sendReservationCancelled(
        savedReservation.email,
        savedReservation.name,
      );

      await queryRunner.commitTransaction();
      return { message: 'Rezerwacja została anulowana.' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: string, dto: UpdateStatusDto): Promise<Reservation> {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
    });
    if (!reservation) {
      throw new NotFoundException('Rezerwacja nie istnieje');
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException(
        'Nie można zmienić statusu anulowanej rezerwacji',
      );
    }
    if (reservation.status === dto.status) {
      return reservation;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      reservation.status = dto.status;
      const savedReservation = await queryRunner.manager.save(reservation);

      await this.notificationsService.sendReservationStatusUpdated(
        savedReservation.email,
        savedReservation.name,
        savedReservation.status,
      );

      await queryRunner.commitTransaction();
      return savedReservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

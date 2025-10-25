import { Logger } from '@nestjs/common';
import {
  Reservation,
  ReservationStatus,
} from 'src/reservations/domain/reservation.entity';
import { Restaurant } from 'src/restaurants/domain/restaurant.entity';
import { DataSource } from 'typeorm';

export const seedReservations = async (
  dataSource: DataSource,
  logger: Logger,
) => {
  const reservationRepo = dataSource.getRepository(Reservation);
  const restaurantRepo = dataSource.getRepository(Restaurant);

  const restaurants = await restaurantRepo.find();

  const now = new Date();
  const reservations = restaurants.map((r) => ({
    name: 'Jan Kowalski',
    email: 'jan.kowalski@example.com',
    peopleCount: 4,
    date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
    status: ReservationStatus.PENDING,
    restaurantId: r.id,
  }));

  await reservationRepo.save(reservations);
  logger.log('✅ Seeded reservations');
};

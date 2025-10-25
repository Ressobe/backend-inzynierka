import { INestApplication, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { seedRestaurants } from './restaurants.seed';
import { seedUsers } from './users.seed';
import { seedReservations } from './reservations.seed';
import { DATA_SOURCE } from '../database.providers';

export async function seedDatabase(app: INestApplication) {
  const dataSource = app.get<DataSource>(DATA_SOURCE);
  const logger = new Logger('Seeder');

  const restaurantCount = await dataSource.getRepository('Restaurant').count();

  if (restaurantCount > 0) {
    logger.log('🌱 Seed: database already contains data, skipping seeding.');
    return;
  }

  logger.log('🌱 Seeding database...');
  await seedRestaurants(dataSource, logger);
  await seedUsers(dataSource, logger);
  await seedReservations(dataSource, logger);
  logger.log('✅ Seed completed successfully!');
}

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/domain/user.entity';
import { Restaurant } from 'src/restaurants/domain/restaurant.entity';
import { Logger } from '@nestjs/common';

export const seedUsers = async (dataSource: DataSource, logger: Logger) => {
  const userRepo = dataSource.getRepository(User);
  const restaurantRepo = dataSource.getRepository(Restaurant);

  const restaurants = await restaurantRepo.find();

  for (const restaurant of restaurants) {
    const passwordHash = await bcrypt.hash('admin123', 10);

    const user = userRepo.create({
      email: `${restaurant.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      passwordHash,
      restaurantId: restaurant.id,
    });

    await userRepo.save(user);
  }

  logger.log('✅ Seeded users');
};

import { Logger } from '@nestjs/common';
import { Restaurant } from 'src/restaurants/domain/restaurant.entity';
import { DataSource } from 'typeorm';

export const seedRestaurants = async (
  dataSource: DataSource,
  logger: Logger,
) => {
  const restaurantRepo = dataSource.getRepository(Restaurant);

  const restaurants = [
    {
      name: 'Sushi Zen',
      city: 'Kraków',
      address: 'ul. Długa 12',
      description: 'Nowoczesna restauracja sushi w centrum Krakowa',
      openHours: {
        monday: ['12:00', '22:00'],
        tuesday: ['12:00', '22:00'],
        wednesday: ['12:00', '22:00'],
        thursday: ['12:00', '22:00'],
        friday: ['12:00', '23:00'],
        saturday: ['12:00', '23:00'],
        sunday: ['12:00', '21:00'],
      },
    },
    {
      name: 'Trattoria Bella',
      city: 'Warszawa',
      address: 'ul. Mokotowska 7',
      description: 'Rodzinna restauracja włoska z tradycyjnym menu',
      openHours: {
        monday: ['11:00', '22:00'],
        tuesday: ['11:00', '22:00'],
        wednesday: ['11:00', '22:00'],
        thursday: ['11:00', '22:00'],
        friday: ['11:00', '23:00'],
        saturday: ['11:00', '23:00'],
        sunday: ['11:00', '21:00'],
      },
    },
  ];

  await restaurantRepo.save(restaurants);
  logger.log('✅ Seeded restaurants');
};

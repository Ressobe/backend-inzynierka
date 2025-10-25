import { ConfigService } from '@nestjs/config';
import { DataSource, EntityManager } from 'typeorm';

export const DATA_SOURCE = 'DATA_SOURCE';

export const databaseProviders = [
  {
    provide: DATA_SOURCE,
    useFactory: async (configService: ConfigService) => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: false,
        migrations: [__dirname + '/migrations/**'],
        migrationsTableName: 'custom_migration_table',
      });

      return dataSource.initialize();
    },
    inject: [ConfigService],
  },
  {
    provide: EntityManager,
    useFactory: (dataSource: DataSource) => dataSource.manager,
    inject: [DATA_SOURCE],
  },
];

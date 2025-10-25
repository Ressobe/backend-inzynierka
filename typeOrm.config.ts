import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'app_db',
  entities: ['src/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: ['migrations/*.ts'],
  migrationsTableName: 'custom_migration_table',
});

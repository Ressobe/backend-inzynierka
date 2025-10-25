import { Module } from '@nestjs/common';
import {
  DATA_SOURCE,
  DATA_SOURCE_OPTIONS,
  databaseProviders,
} from './database.providers';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders, DATA_SOURCE_OPTIONS, DATA_SOURCE],
})
export class DatabaseModule {}

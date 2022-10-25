import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
require('dotenv').config();

const dataSourceOptions: DataSourceOptions = {
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT || 3306,
  username: process.env.DB_USERNAME || '',
  password: process.env.DB_PASSWORD || '',
  type: process.env.DB_CONNECTION as any || 'postgres',
  database: process.env.DB_DATABASE || '',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  namingStrategy: new SnakeNamingStrategy(),
  timezone: 'local',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/src/database/migrations/tenanted/*.js'],
};

export const TenantsDataSource = new DataSource(dataSourceOptions);

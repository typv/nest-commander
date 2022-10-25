import {registerAs} from "@nestjs/config";
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
require('dotenv').config();

export default registerAs('database', () => {
  return {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || '5432',
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    type: process.env.DB_CONNECTION || 'postgres',
    database: process.env.DB_DATABASE || '',
    entities: ['dist/**/*.entity{.ts,.js}'],
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    migrations: ['dist/database/migrations/public/*.js'],
    /*factories: ['dist/database/factories/!*.factory{.ts,.js}'],
    seeds: ['dist/database/seeders/!*.js'],*/
    namingStrategy: new SnakeNamingStrategy(),
    autoLoadEntities: true,
    /*cli: {
      entitiesDir: 'src',
      subscribersDir: 'src',
      migrationsDir: 'src/common/database/migrations',
    },*/
    migrationsTableName: "migrations",
    timezone: 'local',
  }
})
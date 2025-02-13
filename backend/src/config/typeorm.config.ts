import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env file
config();

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get('POSTGRES_HOST', 'localhost'),
  port: configService.get('POSTGRES_PORT', 5432),
  username: configService.get('POSTGRES_USER', 'postgres'),
  password: configService.get('POSTGRES_PASSWORD', 'postgres'),
  database: configService.get('POSTGRES_DB', 'debattle'),
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
  migrationsRun: false, // Let our service handle migrations
  synchronize: false, // Disabled for safety
  ssl: configService.get('NODE_ENV') === 'production' ? {
    rejectUnauthorized: false,
    ca: configService.get('POSTGRES_CA_CERT'),
  } : false,
  logging: configService.get('NODE_ENV') === 'development',
  maxQueryExecutionTime: 1000, // Log slow queries
  cache: {
    type: 'redis',
    options: {
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get('REDIS_PORT', 6379),
      password: configService.get('REDIS_PASSWORD'),
      db: 0,
    },
    duration: 60000, // Cache duration in milliseconds
  },
  extra: {
    max: 30, // Maximum number of clients in the pool
    ssl: configService.get('NODE_ENV') === 'production',
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource; 
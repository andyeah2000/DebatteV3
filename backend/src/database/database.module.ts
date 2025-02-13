import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { join } from 'path';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST', 'localhost'),
        port: configService.get('POSTGRES_PORT', 5432),
        username: configService.get('POSTGRES_USER', 'postgres'),
        password: configService.get('POSTGRES_PASSWORD', 'postgres'),
        database: configService.get('POSTGRES_DB', 'debattle'),
        entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
        migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
        migrationsRun: false,
        synchronize: false,
        logging: configService.get('NODE_ENV', 'development') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? {
          rejectUnauthorized: false,
          ca: configService.get('POSTGRES_CA_CERT'),
        } : undefined,
        cache: {
          type: 'redis',
          options: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
            password: configService.get('REDIS_PASSWORD'),
            db: 0,
            duration: 60000, // Cache for 1 minute
          },
        },
        extra: {
          max: 30, // Maximum number of clients in the pool
          ssl: configService.get('NODE_ENV') === 'production',
          keepAlive: true,
          keepAliveInitialDelayMillis: 10000,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
          maxQueryExecutionTime: 1000, // Log queries that take more than 1 second
          application_name: 'debattle_backend',
        },
      }),
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {} 
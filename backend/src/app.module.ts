import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';
import { join } from 'path';
import configuration from './config/configuration';
import { UsersModule } from './users/users.module';
import { DebatesModule } from './debates/debates.module';
import { AuthModule } from './auth/auth.module';
import { WebsocketModule } from './websocket/websocket.module';
import { AdminModule } from './admin/admin.module';
import { AIModule } from './ai/ai.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { GqlThrottlerGuard } from './common/guards/gql-throttler.guard';
import { MetricsInterceptor } from './metrics/metrics.interceptor';
import { SecurityModule } from './security/security.module';
import { GraphQLContextBuilder } from './common/builders/graphql-context.builder';
import { TopicsModule } from './topics/topics.module';
import { EmailModule } from './email/email.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    // Rate Limiter
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([
        {
          ttl: config.get('THROTTLE_TTL', 60),
          limit: config.get('THROTTLE_LIMIT', 100),
        },
      ]),
    }),
    // Redis Cache
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: 'redis',
        host: config.get('REDIS_HOST', 'localhost'),
        port: config.get('REDIS_PORT', 6379),
        password: config.get('REDIS_PASSWORD'),
        ttl: config.get('CACHE_TTL', 60), // seconds
        max: config.get('CACHE_MAX', 100), // maximum number of items in cache
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      context: ({ req, res }) => {
        try {
          return GraphQLContextBuilder.build(req, res);
        } catch (error) {
          console.error('Error building GraphQL context:', error);
          return GraphQLContextBuilder.createDefaultContext('unknown');
        }
      },
      cache: 'bounded',
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return error;
      },
    }),
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
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
        synchronize: false,
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? {
          rejectUnauthorized: false,
          ca: configService.get('POSTGRES_CA_CERT'),
        } : false,
        cache: {
          type: 'redis',
          options: {
            host: configService.get('REDIS_HOST', 'localhost'),
            port: configService.get('REDIS_PORT', 6379),
            password: configService.get('REDIS_PASSWORD'),
            db: 0,
          },
          duration: 60000,
        },
      }),
    }),
    SecurityModule,
    DatabaseModule,
    UsersModule,
    DebatesModule,
    AuthModule,
    WebsocketModule,
    AdminModule,
    AIModule,
    HealthModule,
    MetricsModule,
    TopicsModule,
    EmailModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    }
  ],
})
export class AppModule {}

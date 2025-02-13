import { Module, CacheModule as NestCacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        ttl: 300, // 5 minutes default TTL
        max: 100, // maximum number of items in cache
        isGlobal: true
      }),
    }),
  ],
  exports: [NestCacheModule],
})
export class CacheModule {} 
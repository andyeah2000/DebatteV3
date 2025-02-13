import { Module, Global } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { XssFilter } from '../common/filters/xss.filter';
import { GqlThrottlerGuard } from '../common/guards/throttler.guard';
import { SecurityInterceptor } from '../common/interceptors/security.interceptor';
import { SqlInjectionMiddleware } from '../common/middleware/sql-injection.middleware';
import { GraphQLExceptionFilter } from '../common/filters/graphql-exception.filter';

@Global()
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([{
        ttl: config.get('THROTTLE_TTL', 60),
        limit: config.get('THROTTLE_LIMIT', 100),
      }]),
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GraphQLExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: XssFilter,
    },
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SecurityInterceptor,
    },
    SqlInjectionMiddleware,
  ],
  exports: [SqlInjectionMiddleware],
})
export class SecurityModule {} 
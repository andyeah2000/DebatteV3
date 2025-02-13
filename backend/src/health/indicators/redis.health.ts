import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // Try to set and get a test value
      const testKey = 'health-check-test';
      await this.cacheManager.set(testKey, 'test', { ttl: 10 });
      const testValue = await this.cacheManager.get(testKey);
      
      const isHealthy = testValue === 'test';

      return this.getStatus(key, isHealthy, {
        testValue: testValue === 'test' ? 'ok' : 'failed',
      });
    } catch (error) {
      throw new HealthCheckError(
        'Redis health check failed',
        this.getStatus(key, false, {
          error: error.message,
        })
      );
    }
  }
} 
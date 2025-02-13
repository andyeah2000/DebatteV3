import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DatabaseService } from '../database/database.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RedisHealthIndicator } from './indicators/redis.health';
import { WebSocketHealthIndicator } from './indicators/websocket.health';

@ApiTags('Health')
@Controller('health')
@UseGuards(ThrottlerGuard)
export class HealthController {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisHealthIndicator: RedisHealthIndicator,
    private readonly websocketHealthIndicator: WebSocketHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({
    status: 200,
    description: 'System health information',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string' },
        database: {
          type: 'object',
          properties: {
            isHealthy: { type: 'boolean' },
            details: {
              type: 'object',
              properties: {
                connected: { type: 'boolean' },
                size: { type: 'string' },
                activeConnections: { type: 'number' },
                uptime: { type: 'string' },
              },
            },
          },
        },
        redis: {
          type: 'object',
          properties: {
            isHealthy: { type: 'boolean' },
            details: {
              type: 'object',
              properties: {
                connected: { type: 'boolean' },
                testValue: { type: 'string' },
              },
            },
          },
        },
        websocket: {
          type: 'object',
          properties: {
            isHealthy: { type: 'boolean' },
            details: {
              type: 'object',
              properties: {
                connectedClients: { type: 'number' },
              },
            },
          },
        },
      },
    },
  })
  async check() {
    const [dbHealth, redisHealth, wsHealth] = await Promise.all([
      this.databaseService.checkDatabaseHealth(),
      this.redisHealthIndicator.isHealthy('redis'),
      this.websocketHealthIndicator.isHealthy('websocket'),
    ]);

    const isHealthy = dbHealth.isHealthy && 
                     redisHealth.redis.status === 'up' && 
                     wsHealth.websocket.status === 'up';

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      redis: redisHealth.redis,
      websocket: wsHealth.websocket,
    };
  }

  @Get('database')
  @ApiOperation({ summary: 'Get detailed database health information' })
  @ApiResponse({
    status: 200,
    description: 'Database health information',
    schema: {
      type: 'object',
      properties: {
        isHealthy: { type: 'boolean' },
        details: {
          type: 'object',
          properties: {
            connected: { type: 'boolean' },
            size: { type: 'string' },
            activeConnections: { type: 'number' },
            uptime: { type: 'string' },
          },
        },
      },
    },
  })
  async checkDatabase() {
    return this.databaseService.checkDatabaseHealth();
  }

  @Get('redis')
  @ApiOperation({ summary: 'Get Redis health information' })
  @ApiResponse({
    status: 200,
    description: 'Redis health information',
    schema: {
      type: 'object',
      properties: {
        isHealthy: { type: 'boolean' },
        details: {
          type: 'object',
          properties: {
            connected: { type: 'boolean' },
            testValue: { type: 'string' },
          },
        },
      },
    },
  })
  async checkRedis() {
    return this.redisHealthIndicator.isHealthy('redis');
  }

  @Get('websocket')
  @ApiOperation({ summary: 'Get WebSocket health information' })
  @ApiResponse({
    status: 200,
    description: 'WebSocket health information',
    schema: {
      type: 'object',
      properties: {
        isHealthy: { type: 'boolean' },
        details: {
          type: 'object',
          properties: {
            connectedClients: { type: 'number' },
          },
        },
      },
    },
  })
  async checkWebSocket() {
    return this.websocketHealthIndicator.isHealthy('websocket');
  }
} 
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './indicators/redis.health';
import { WebSocketHealthIndicator } from './indicators/websocket.health';
import { DatabaseService } from '../database/database.service';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TerminusModule,
    HttpModule,
    WebsocketModule,
  ],
  controllers: [HealthController],
  providers: [
    DatabaseService,
    RedisHealthIndicator,
    WebSocketHealthIndicator,
  ],
})
export class HealthModule {} 
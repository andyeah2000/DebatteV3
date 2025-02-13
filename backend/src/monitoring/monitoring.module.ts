import { Module, Global } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider, makeGaugeProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MonitoringService } from './monitoring.service';
import { MetricsController } from './metrics.controller';

@Global()
@Module({
  imports: [
    PrometheusModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        path: configService.get('METRICS_PATH', '/metrics'),
        defaultLabels: {
          app: 'debattle',
          env: configService.get('NODE_ENV', 'development'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [MetricsController],
  providers: [
    MonitoringService,
    makeCounterProvider({
      name: 'debattle_debate_created_total',
      help: 'Total number of debates created',
      labelNames: ['category'],
    }),
    makeCounterProvider({
      name: 'debattle_debate_votes_total',
      help: 'Total number of votes cast in debates',
      labelNames: ['debate_id', 'vote_type'],
    }),
    makeGaugeProvider({
      name: 'debattle_active_users_total',
      help: 'Current number of active users',
    }),
    makeHistogramProvider({
      name: 'debattle_request_duration_seconds',
      help: 'Duration of HTTP requests',
      labelNames: ['path', 'method', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5],
    }),
  ],
  exports: [MonitoringService],
})
export class MonitoringModule {} 
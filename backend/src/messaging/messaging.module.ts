import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessagingService } from './messaging.service';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'EVENTS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: 'debattle_events_queue',
            queueOptions: {
              durable: true,
            },
            prefetchCount: 1,
            persistent: true,
            noAck: false,
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {} 
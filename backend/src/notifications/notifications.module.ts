import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationsResolver } from './notifications.resolver';
import { Notification } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { WebsocketModule } from '../websocket/websocket.module';
import { EmailModule } from '../email/email.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User]),
    WebsocketModule,
    EmailModule
  ],
  providers: [NotificationsService, NotificationsResolver],
  exports: [NotificationsService],
})
export class NotificationsModule {} 
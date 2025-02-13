import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Badge } from './entities/badge.entity';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { ReputationService } from './reputation.service';
import { ReputationResolver } from './reputation.resolver';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Badge]),
    WebsocketModule
  ],
  providers: [
    UsersService,
    UsersResolver,
    ReputationService,
    ReputationResolver
  ],
  exports: [UsersService, ReputationService],
})
export class UsersModule {} 
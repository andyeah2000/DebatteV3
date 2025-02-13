import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminResolver } from './admin.resolver';
import { ReportedContent } from './entities/reported-content.entity';
import { UsersModule } from '../users/users.module';
import { DebatesModule } from '../debates/debates.module';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportedContent]),
    UsersModule,
    DebatesModule,
    AIModule,
  ],
  providers: [AdminService, AdminResolver],
  exports: [AdminService],
})
export class AdminModule {} 
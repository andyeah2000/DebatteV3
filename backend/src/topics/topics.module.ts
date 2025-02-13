import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicsService } from './topics.service';
import { TopicsResolver } from './topics.resolver';
import { Topic } from './entities/topic.entity';
import { Debate } from '../debates/entities/debate.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([Topic, Debate]),
    ScheduleModule.forRoot()
  ],
  providers: [TopicsService, TopicsResolver],
  exports: [TopicsService]
})
export class TopicsModule {} 
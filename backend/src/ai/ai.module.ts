import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIService } from './ai.service';
import { AIResolver } from './ai.resolver';

@Module({
  imports: [ConfigModule],
  providers: [AIService, AIResolver],
  exports: [AIService],
})
export class AIModule {} 
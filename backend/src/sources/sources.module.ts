import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Source } from './entities/source.entity';
import { SourcesService } from './sources.service';
import { SourcesResolver } from './sources.resolver';
import { UsersModule } from '../users/users.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Source]),
    UsersModule,
    MetricsModule,
  ],
  providers: [SourcesService, SourcesResolver],
  exports: [SourcesService],
})
export class SourcesModule {} 
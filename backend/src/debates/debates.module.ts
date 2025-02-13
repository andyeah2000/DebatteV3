import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Debate } from './entities/debate.entity';
import { Vote } from './entities/vote.entity';
import { DebatesService } from './debates.service';
import { CommentsService } from './services/comments.service';
import { VotesService } from './votes.service';
import { DebatesResolver, VoteStatisticsResolver } from './debates.resolver';
import { CommentsResolver } from './comments.resolver';
import { VotesResolver } from './votes.resolver';
import { UsersModule } from '../users/users.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { AIModule } from '../ai/ai.module';
import { Source } from './entities/source.entity';
import { Media } from './entities/media.entity';
import { ArgumentTemplateService } from './services/argument-template.service';
import { ArgumentTemplateResolver } from './resolvers/argument-template.resolver';
import { ArgumentTemplate } from './entities/argument-template.entity';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Debate,
      Comment,
      Source,
      Media,
      Vote,
      ArgumentTemplate
    ]),
    UsersModule,
    WebsocketModule,
    AIModule,
    MetricsModule,
  ],
  providers: [
    DebatesService,
    DebatesResolver,
    VoteStatisticsResolver,
    CommentsService,
    CommentsResolver,
    VotesService,
    VotesResolver,
    ArgumentTemplateService,
    ArgumentTemplateResolver,
  ],
  exports: [DebatesService, CommentsService, VotesService, ArgumentTemplateService],
})
export class DebatesModule {} 
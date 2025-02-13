import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Comment } from '../debates/entities/comment.entity'
import { CommentsService } from './comments.service'
import { CommentsResolver } from './comments.resolver'
import { UsersModule } from '../users/users.module'
import { DebatesModule } from '../debates/debates.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    UsersModule,
    DebatesModule,
  ],
  providers: [CommentsService, CommentsResolver],
  exports: [CommentsService],
})
export class CommentsModule {} 
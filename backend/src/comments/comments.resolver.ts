import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql'
import { UseGuards } from '@nestjs/common'
import { CommentsService } from './comments.service'
import { Comment } from '../debates/entities/comment.entity'
import { CreateCommentInput } from './dto/create-comment.input'
import { UpdateCommentInput } from './dto/update-comment.input'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { User } from '../users/entities/user.entity'
import { DebatesService } from '../debates/debates.service'

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly debatesService: DebatesService,
  ) {}

  @Mutation(() => Comment)
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Args('input') createCommentInput: CreateCommentInput,
    @CurrentUser() user: User,
  ): Promise<Comment> {
    const debate = await this.debatesService.findOne(createCommentInput.debateId)
    return this.commentsService.create(createCommentInput, user, debate)
  }

  @Query(() => [Comment])
  async comments(): Promise<Comment[]> {
    return this.commentsService.findAll()
  }

  @Query(() => Comment)
  async comment(@Args('id', { type: () => ID }) id: string): Promise<Comment> {
    return this.commentsService.findOne(id)
  }

  @Query(() => [Comment])
  async debateComments(
    @Args('debateId', { type: () => ID }) debateId: string,
  ): Promise<Comment[]> {
    return this.commentsService.findByDebate(debateId)
  }

  @Mutation(() => Comment)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Args('input') updateCommentInput: UpdateCommentInput,
    @CurrentUser() user: User,
  ): Promise<Comment> {
    const comment = await this.commentsService.findOne(updateCommentInput.id)
    if (comment.author.id !== user.id) {
      throw new Error('You can only edit your own comments')
    }
    return this.commentsService.update(updateCommentInput.id, updateCommentInput)
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    const comment = await this.commentsService.findOne(id)
    if (comment.author.id !== user.id) {
      throw new Error('You can only delete your own comments')
    }
    return this.commentsService.softDelete(id)
  }

  @Mutation(() => Comment)
  @UseGuards(JwtAuthGuard)
  async upvoteComment(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Comment> {
    return this.commentsService.upvote(id)
  }

  @Mutation(() => Comment)
  @UseGuards(JwtAuthGuard)
  async downvoteComment(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Comment> {
    return this.commentsService.downvote(id)
  }

  @ResolveField('replies', () => [Comment])
  async getReplies(@Parent() comment: Comment): Promise<Comment[]> {
    return this.commentsService.findReplies(comment.id)
  }
} 
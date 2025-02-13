import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { Debate } from './entities/debate.entity';
import { CommentsService } from './comments.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DebatesService } from './debates.service';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly debatesService: DebatesService,
  ) {}

  @Query(() => [Comment])
  async comments(): Promise<Comment[]> {
    return this.commentsService.findAll();
  }

  @Query(() => Comment)
  async comment(@Args('id', { type: () => ID }) id: string): Promise<Comment> {
    return this.commentsService.findOne(id);
  }

  @Query(() => [Comment])
  async debateComments(
    @Args('debateId', { type: () => ID }) debateId: string,
  ): Promise<Comment[]> {
    return this.commentsService.findByDebate(debateId);
  }

  @Mutation(() => Comment)
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Args('input') createCommentInput: CreateCommentInput,
    @CurrentUser() user: User,
  ): Promise<Comment> {
    const debate = await this.debatesService.findOne(createCommentInput.debateId);
    return this.commentsService.create(createCommentInput, user, debate);
  }

  @Mutation(() => Comment)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Args('updateCommentInput') updateCommentInput: UpdateCommentInput,
    @CurrentUser() user: User,
  ): Promise<Comment> {
    return this.commentsService.update(updateCommentInput.id, updateCommentInput, user);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async removeComment(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.commentsService.remove(id, user);
  }

  @Mutation(() => Comment)
  @UseGuards(JwtAuthGuard)
  async upvoteComment(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Comment> {
    return this.commentsService.upvote(id);
  }

  @Mutation(() => Comment)
  @UseGuards(JwtAuthGuard)
  async downvoteComment(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Comment> {
    return this.commentsService.downvote(id);
  }

  @Mutation(() => Comment)
  @UseGuards(JwtAuthGuard)
  async verifyComment(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Comment> {
    return this.commentsService.verifyComment(id);
  }

  @ResolveField('author', () => User)
  getAuthor(@Parent() comment: Comment): User {
    return comment.author;
  }

  @ResolveField('debate', () => Debate)
  getDebate(@Parent() comment: Comment): Debate {
    return comment.debate;
  }

  @ResolveField('replyTo', () => Comment, { nullable: true })
  getReplyTo(@Parent() comment: Comment): Comment | null {
    return comment.replyTo || null;
  }
} 
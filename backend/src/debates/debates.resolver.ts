import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Comment } from './entities/comment.entity';
import { Debate } from './entities/debate.entity';
import { Vote } from './entities/vote.entity';
import { User } from '../users/entities/user.entity';
import { DebatesService } from './debates.service';
import { CommentsService } from './comments.service';
import { VotesService } from './votes.service';
import { CreateDebateInput } from './dto/create-debate.input';
import { UpdateDebateInput } from './dto/update-debate.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DebatesInput } from './dto/debates.input';
import { DebateSummaryResponse } from '../ai/models/ai-responses.model';
import { VoteStatistics } from '../common/types/vote-statistics.type';
import { GraphQLContext } from '../common/builders/graphql-context.builder';

@Resolver(() => Debate)
export class DebatesResolver {
  constructor(
    private readonly debatesService: DebatesService,
    private readonly commentsService: CommentsService,
    private readonly votesService: VotesService,
  ) {}

  @Query(() => [Debate])
  async debates(@Args('input') input: DebatesInput): Promise<Debate[]> {
    return this.debatesService.findAll(input);
  }

  @Query(() => Debate)
  async debate(@Args('id', { type: () => ID }) id: string): Promise<Debate> {
    return this.debatesService.findOne(id);
  }

  @Query(() => [Debate])
  async featuredDebates(@Context() context: GraphQLContext): Promise<Debate[]> {
    try {
      if (!context?.req) {
        console.warn('No context available in featuredDebates query');
        return this.debatesService.findFeatured();
      }

      console.log('FeaturedDebates context:', {
        ip: context.req.ip,
        userAgent: context.req.headers['user-agent'],
        origin: context.req.headers.origin,
        referer: context.req.headers.referer,
      });
      
      const debates = await this.debatesService.findFeatured();
      return debates;
    } catch (error) {
      console.error('Error fetching featured debates:', error);
      throw error;
    }
  }

  @Query(() => [Debate])
  async debatesByCategory(@Args('category') category: string): Promise<Debate[]> {
    return this.debatesService.findByCategory(category);
  }

  @Mutation(() => Debate)
  @UseGuards(JwtAuthGuard)
  async createDebate(
    @Args('createDebateInput') createDebateInput: CreateDebateInput,
    @CurrentUser() user: User,
  ): Promise<Debate> {
    return this.debatesService.create(createDebateInput, user);
  }

  @Mutation(() => Debate)
  @UseGuards(JwtAuthGuard)
  async updateDebate(
    @Args('updateDebateInput') updateDebateInput: UpdateDebateInput,
    @CurrentUser() user: User,
  ): Promise<Debate> {
    return this.debatesService.update(updateDebateInput.id, updateDebateInput, user);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async removeDebate(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.debatesService.remove(id, user);
  }

  @Query(() => DebateSummaryResponse)
  @UseGuards(JwtAuthGuard)
  async debateSummary(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DebateSummaryResponse> {
    return this.debatesService.generateSummary(id);
  }

  @ResolveField('comments', () => [Comment])
  async getComments(@Parent() debate: Debate): Promise<Comment[]> {
    return this.commentsService.findByDebate(debate.id);
  }

  @ResolveField('votes', () => [Vote])
  async getVotes(@Parent() debate: Debate): Promise<Vote[]> {
    return this.votesService.findByDebate(debate.id);
  }

  @ResolveField('voteStatistics', () => VoteStatistics)
  async getVoteStatistics(@Parent() debate: Debate): Promise<VoteStatistics> {
    return this.votesService.getVoteStatistics(debate.id);
  }

  @Mutation(() => Debate)
  async incrementViewCount(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Debate> {
    return this.debatesService.incrementViewCount(id);
  }
}

@Resolver(() => VoteStatistics)
export class VoteStatisticsResolver {
  @ResolveField('totalVotes', () => Number)
  getTotalVotes(@Parent() stats: VoteStatistics): number {
    return stats.totalVotes;
  }

  @ResolveField('proVotes', () => Number)
  getProVotes(@Parent() stats: VoteStatistics): number {
    return stats.proVotes;
  }

  @ResolveField('conVotes', () => Number)
  getConVotes(@Parent() stats: VoteStatistics): number {
    return stats.conVotes;
  }

  @ResolveField('proPercentage', () => Number)
  getProPercentage(@Parent() stats: VoteStatistics): number {
    return stats.proPercentage;
  }

  @ResolveField('conPercentage', () => Number)
  getConPercentage(@Parent() stats: VoteStatistics): number {
    return stats.conPercentage;
  }
}

@Resolver(() => Vote)
export class VotesResolver {
  constructor(private readonly votesService: VotesService) {}
} 
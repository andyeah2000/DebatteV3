import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Vote } from './entities/vote.entity';
import { User } from '../users/entities/user.entity';
import { Debate } from './entities/debate.entity';
import { VotesService } from './votes.service';
import { CreateVoteInput } from './dto/create-vote.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VoteStatistics } from '../common/types/vote-statistics.type';

@Resolver(() => Vote)
export class VotesResolver {
  constructor(private readonly votesService: VotesService) {}

  @Query(() => [Vote])
  @UseGuards(JwtAuthGuard)
  async votes(): Promise<Vote[]> {
    return this.votesService.findAll();
  }

  @Query(() => Vote)
  @UseGuards(JwtAuthGuard)
  async vote(@Args('id', { type: () => ID }) id: string): Promise<Vote> {
    return this.votesService.findOne(id);
  }

  @Query(() => [Vote])
  @UseGuards(JwtAuthGuard)
  async debateVotes(
    @Args('debateId', { type: () => ID }) debateId: string,
  ): Promise<Vote[]> {
    return this.votesService.findByDebate(debateId);
  }

  @Query(() => [Vote])
  @UseGuards(JwtAuthGuard)
  async userVotes(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<Vote[]> {
    return this.votesService.findByUser(userId);
  }

  @Query(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async hasUserVoted(
    @Args('debateId', { type: () => ID }) debateId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.votesService.hasUserVoted(debateId, user.id);
  }

  @Mutation(() => Vote)
  @UseGuards(JwtAuthGuard)
  async createVote(
    @Args('createVoteInput') createVoteInput: CreateVoteInput,
    @CurrentUser() user: User,
  ): Promise<Vote> {
    return this.votesService.create(createVoteInput, user);
  }

  @ResolveField('user', () => User)
  getUser(@Parent() vote: Vote): User {
    return vote.user;
  }

  @ResolveField('debate', () => Debate)
  getDebate(@Parent() vote: Vote): Debate {
    return vote.debate;
  }

  @Query(() => VoteStatistics)
  @UseGuards(JwtAuthGuard)
  async voteStatistics(
    @Args('debateId', { type: () => ID }) debateId: string,
  ): Promise<VoteStatistics> {
    return this.votesService.getVoteStatistics(debateId);
  }
} 
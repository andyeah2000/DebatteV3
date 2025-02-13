import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Badge } from './entities/badge.entity';
import { ReputationService, ReputationAction } from './reputation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateReputationInput, AwardSpecialBadgeInput } from './dto/reputation.input';
import { 
  LeaderboardEntry,
  CategoryLeaderboard,
  UserBadgesResponse,
  ReputationUpdateResponse
} from './models/reputation.model';

@Resolver()
@UseGuards(JwtAuthGuard)
export class ReputationResolver {
  constructor(private readonly reputationService: ReputationService) {}

  @Query(() => [LeaderboardEntry])
  async leaderboard(
    @Args('category', { nullable: true }) category?: string
  ): Promise<LeaderboardEntry[]> {
    const users = await this.reputationService.getLeaderboard(category);
    return users.map((user, index) => ({
      user,
      rank: index + 1,
      score: category === 'debate' ? user.debateScore :
             category === 'comment' ? user.commentScore :
             category === 'source' ? user.sourceScore :
             user.reputationScore
    }));
  }

  @Query(() => [CategoryLeaderboard])
  async allLeaderboards(): Promise<CategoryLeaderboard[]> {
    const categories = ['overall', 'debate', 'comment', 'source'];
    const leaderboards = await Promise.all(
      categories.map(async category => {
        const users = await this.reputationService.getLeaderboard(category);
        return {
          category,
          entries: users.map((user, index) => ({
            user,
            rank: index + 1,
            score: category === 'debate' ? user.debateScore :
                   category === 'comment' ? user.commentScore :
                   category === 'source' ? user.sourceScore :
                   user.reputationScore
          }))
        };
      })
    );
    return leaderboards;
  }

  @Query(() => UserBadgesResponse)
  async userBadges(
    @Args('userId', { type: () => ID }) userId: string
  ): Promise<UserBadgesResponse> {
    const user = await this.reputationService.getUserWithBadges(userId);
    const availableBadges = await this.reputationService.getAvailableBadges(user);
    
    return {
      user,
      badges: user.badges,
      availableBadges,
      totalBadges: user.badges.length,
      specialBadges: user.badges.filter(b => b.isSpecial).length
    };
  }

  @Mutation(() => ReputationUpdateResponse)
  async updateReputation(
    @Args('input') input: UpdateReputationInput
  ): Promise<ReputationUpdateResponse> {
    const result = await this.reputationService.updateReputation(
      input.userId,
      input.action,
      input.context
    );

    return {
      user: result.user,
      pointsEarned: result.pointsEarned,
      newTotal: result.user.reputationScore,
      newBadges: result.newBadges
    };
  }

  @Mutation(() => User)
  async awardSpecialBadge(
    @CurrentUser() user: User,
    @Args('input') input: AwardSpecialBadgeInput
  ): Promise<User> {
    if (!user.roles.includes('admin')) {
      throw new Error('Unauthorized: Only admins can award special badges');
    }
    return this.reputationService.awardSpecialBadge(input.userId, input.badgeId);
  }
} 
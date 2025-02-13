import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Cache } from 'cache-manager';
import { User } from './entities/user.entity';
import { Badge } from './entities/badge.entity';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { MetricsService } from '../metrics/metrics.service';
import { EmailService } from '../email/email.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

export enum ReputationAction {
  CREATE_DEBATE = 'create_debate',
  RECEIVE_UPVOTE = 'receive_upvote',
  RECEIVE_DOWNVOTE = 'receive_downvote',
  COMMENT_UPVOTED = 'comment_upvoted',
  COMMENT_DOWNVOTED = 'comment_downvoted',
  SOURCE_VERIFIED = 'source_verified',
  DEBATE_WON = 'debate_won',
  QUALITY_CONTRIBUTION = 'quality_contribution'
}

export const REPUTATION_POINTS = {
  [ReputationAction.CREATE_DEBATE]: 5,
  [ReputationAction.RECEIVE_UPVOTE]: 2,
  [ReputationAction.RECEIVE_DOWNVOTE]: -1,
  [ReputationAction.COMMENT_UPVOTED]: 1,
  [ReputationAction.COMMENT_DOWNVOTED]: -1,
  [ReputationAction.SOURCE_VERIFIED]: 3,
  [ReputationAction.DEBATE_WON]: 10,
  [ReputationAction.QUALITY_CONTRIBUTION]: 5
};

interface ReputationUpdateResult {
  user: User;
  pointsEarned: number;
  newBadges: Badge[];
}

@Injectable()
export class ReputationService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Badge)
    private readonly badgesRepository: Repository<Badge>,
    private readonly websocketGateway: WebsocketGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly metricsService: MetricsService,
    private readonly emailService: EmailService,
  ) {}

  private getCacheKey(type: string, id?: string): string {
    return `reputation:${type}${id ? `:${id}` : ''}`;
  }

  async getUserWithBadges(userId: string): Promise<User> {
    const startTime = process.hrtime();
    
    try {
      const cacheKey = this.getCacheKey('user', userId);
      const cached = await this.cacheManager.get<User>(cacheKey);
      
      if (cached) {
        this.metricsService.setCacheHitRatio(1);
        return cached;
      }

      this.metricsService.setCacheHitRatio(0);

      const user = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['badges']
      });

      if (!user) {
        throw new Error('User not found');
      }

      await this.cacheManager.set(cacheKey, user, 300);
      
      const [seconds, nanoseconds] = process.hrtime(startTime);
      this.metricsService.observeDatabaseQueryDuration(
        'get_user_with_badges',
        seconds + nanoseconds / 1e9
      );

      return user;
    } catch (error) {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      this.metricsService.observeDatabaseQueryDuration(
        'get_user_with_badges_error',
        seconds + nanoseconds / 1e9
      );
      throw error;
    }
  }

  async getAvailableBadges(user: User): Promise<Badge[]> {
    const cacheKey = this.getCacheKey('available_badges', user.id);
    const cached = await this.cacheManager.get<Badge[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const userBadgeIds = user.badges.map(b => b.id);
    const badges = await this.badgesRepository.find({
      where: {
        requiredScore: user.reputationScore,
        isSpecial: false,
        ...(userBadgeIds.length > 0 ? { id: Not(In(userBadgeIds)) } : {})
      }
    });

    await this.cacheManager.set(cacheKey, badges, 300); // Cache for 5 minutes
    return badges;
  }

  async updateReputation(
    userId: string,
    action: ReputationAction,
    context?: { debateId?: string; commentId?: string }
  ): Promise<ReputationUpdateResult> {
    const startTime = process.hrtime();
    
    try {
      const user = await this.getUserWithBadges(userId);
      const points = REPUTATION_POINTS[action];
      user.reputationScore += points;

      // Update specific scores based on action
      switch (action) {
        case ReputationAction.CREATE_DEBATE:
        case ReputationAction.DEBATE_WON:
          user.debateScore += points;
          break;
        case ReputationAction.COMMENT_UPVOTED:
        case ReputationAction.COMMENT_DOWNVOTED:
          user.commentScore += points;
          break;
        case ReputationAction.SOURCE_VERIFIED:
          user.sourceScore += points;
          break;
      }

      // Track reputation points awarded
      this.metricsService.incrementReputationPoints(action, points);

      // Check for new badges
      const newBadges = await this.checkAndAwardBadges(user);

      // Save user
      const updatedUser = await this.usersRepository.save(user);

      // Invalidate caches
      await this.cacheManager.del(this.getCacheKey('user', userId));
      await this.cacheManager.del(this.getCacheKey('available_badges', userId));
      await this.cacheManager.del(this.getCacheKey('leaderboard'));
      await this.cacheManager.del(this.getCacheKey('leaderboard', 'debate'));
      await this.cacheManager.del(this.getCacheKey('leaderboard', 'comment'));
      await this.cacheManager.del(this.getCacheKey('leaderboard', 'source'));

      // Emit websocket event
      this.websocketGateway.server.to(`user:${userId}`).emit('reputationUpdated', {
        action,
        points,
        newScore: updatedUser.reputationScore,
        context
      });

      const [seconds, nanoseconds] = process.hrtime(startTime);
      this.metricsService.observeDatabaseQueryDuration(
        'update_reputation',
        seconds + nanoseconds / 1e9
      );

      return {
        user: updatedUser,
        pointsEarned: points,
        newBadges
      };
    } catch (error) {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      this.metricsService.observeDatabaseQueryDuration(
        'update_reputation_error',
        seconds + nanoseconds / 1e9
      );
      throw error;
    }
  }

  private async checkAndAwardBadges(user: User): Promise<Badge[]> {
    const startTime = process.hrtime();
    
    try {
      const availableBadges = await this.badgesRepository.find({
        where: {
          requiredScore: user.reputationScore,
          isSpecial: false
        }
      });

      const newBadges: Badge[] = [];

      for (const badge of availableBadges) {
        if (!user.badges.some(b => b.id === badge.id)) {
          user.badges.push(badge);
          newBadges.push(badge);
          
          // Track badge awarded
          this.metricsService.incrementBadgesAwarded(badge.category);
          
          // Emit websocket event for new badge
          this.websocketGateway.server.to(`user:${user.id}`).emit('badgeAwarded', {
            badgeId: badge.id,
            badgeName: badge.name,
            badgeIcon: badge.icon
          });

          // Send email notification if user has email notifications enabled
          if (user.settings?.emailNotifications) {
            await this.emailService.sendEmail(
              user.email,
              'badge_earned',
              {
                badgeName: badge.name,
                badgeDescription: badge.description,
                badgeIcon: badge.icon,
              }
            );
          }
        }
      }

      const [seconds, nanoseconds] = process.hrtime(startTime);
      this.metricsService.observeDatabaseQueryDuration(
        'check_and_award_badges',
        seconds + nanoseconds / 1e9
      );

      return newBadges;
    } catch (error) {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      this.metricsService.observeDatabaseQueryDuration(
        'check_and_award_badges_error',
        seconds + nanoseconds / 1e9
      );
      throw error;
    }
  }

  async awardSpecialBadge(userId: string, badgeId: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['badges', 'settings']
    });

    const badge = await this.badgesRepository.findOne({
      where: { id: badgeId, isSpecial: true }
    });

    if (!user || !badge) {
      throw new Error('User or badge not found');
    }

    if (!user.badges.some(b => b.id === badge.id)) {
      user.badges.push(badge);
      
      // Emit websocket event for new special badge
      this.websocketGateway.server.to(`user:${user.id}`).emit('specialBadgeAwarded', {
        badgeId: badge.id,
        badgeName: badge.name,
        badgeIcon: badge.icon
      });

      // Send email notification if user has email notifications enabled
      if (user.settings?.emailNotifications) {
        await this.emailService.sendEmail(
          user.email,
          'badge_earned',
          {
            badgeName: badge.name,
            badgeDescription: badge.description,
            badgeIcon: badge.icon,
          }
        );
      }
    }

    return this.usersRepository.save(user);
  }

  async getLeaderboard(category?: string): Promise<User[]> {
    const cacheKey = this.getCacheKey('leaderboard', category);
    const cached = await this.cacheManager.get<User[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (category === 'debate') {
      queryBuilder.orderBy('user.debateScore', 'DESC');
    } else if (category === 'comment') {
      queryBuilder.orderBy('user.commentScore', 'DESC');
    } else if (category === 'source') {
      queryBuilder.orderBy('user.sourceScore', 'DESC');
    } else {
      queryBuilder.orderBy('user.reputationScore', 'DESC');
    }

    const users = await queryBuilder
      .select(['user.id', 'user.username', 'user.avatarUrl', 'user.reputationScore', 'user.debateScore', 'user.commentScore', 'user.sourceScore'])
      .take(10)
      .getMany();

    await this.cacheManager.set(cacheKey, users, 300); // Cache for 5 minutes
    return users;
  }
} 
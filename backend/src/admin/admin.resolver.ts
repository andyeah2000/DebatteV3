import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ReportedContent } from './entities/reported-content.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ModerateContentInput } from './dto/moderate-content.input';
import { SystemHealth } from './entities/system-health.entity';
import { Analytics } from './entities/analytics.entity';

@Resolver()
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminResolver {
  constructor(private readonly adminService: AdminService) {}

  @Query(() => [ReportedContent])
  async getReportedContent(): Promise<ReportedContent[]> {
    return this.adminService.getReportedContent();
  }

  @Mutation(() => ReportedContent)
  async moderateContent(
    @Args('input') input: ModerateContentInput,
    @CurrentUser() moderator: User,
  ): Promise<ReportedContent> {
    return this.adminService.moderateContent(input, moderator);
  }

  @Query(() => Analytics)
  async getAnalytics(
    @Args('period', { type: () => String, defaultValue: 'daily' }) period: string,
  ): Promise<Analytics> {
    return this.adminService.getAnalytics(period);
  }

  @Mutation(() => Analytics)
  async generateAnalytics(
    @Args('period', { type: () => String, defaultValue: 'daily' }) period: string,
  ): Promise<Analytics> {
    return this.adminService.generateAnalytics(period);
  }

  @Query(() => SystemHealth)
  async getSystemHealth(): Promise<SystemHealth> {
    return this.adminService.getSystemHealth();
  }

  @Query(() => Analytics)
  async getUserAnalytics(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<Analytics> {
    return this.adminService.getUserAnalytics(userId);
  }
} 
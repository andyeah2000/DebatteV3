import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Source } from './entities/source.entity';
import { SourcesService } from './sources.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { VerifySourceInput } from './dto/verify-source.input';
import { SourceVerificationResult } from './models/source-verification.model';
import { SourceStats } from './models/source-stats.model';

@Resolver(() => Source)
export class SourcesResolver {
  constructor(private readonly sourcesService: SourcesService) {}

  @Query(() => SourceVerificationResult)
  @UseGuards(JwtAuthGuard)
  async verifySource(
    @Args('input') input: VerifySourceInput,
    @CurrentUser() user: User,
  ): Promise<SourceVerificationResult> {
    return this.sourcesService.verifySource(input.url, user.id);
  }

  @Query(() => SourceStats)
  @UseGuards(JwtAuthGuard)
  async getSourceStats(): Promise<SourceStats> {
    return this.sourcesService.getSourceStats();
  }

  @Query(() => [Source])
  @UseGuards(JwtAuthGuard)
  async getUserSources(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<Source[]> {
    return this.sourcesService.getUserSources(userId);
  }

  @Query(() => [Source])
  @UseGuards(JwtAuthGuard)
  async getDebateSources(
    @Args('debateId', { type: () => ID }) debateId: string,
  ): Promise<Source[]> {
    return this.sourcesService.getDebateSources(debateId);
  }
} 
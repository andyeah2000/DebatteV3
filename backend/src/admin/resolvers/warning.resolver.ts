import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Warning } from '../entities/warning.entity';
import { WarningService } from '../services/warning.service';
import { CreateWarningInput } from '../dto/create-warning.input';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { User } from '../../users/entities/user.entity';

@Resolver(() => Warning)
@UseGuards(JwtAuthGuard, AdminGuard)
export class WarningResolver {
  constructor(private readonly warningService: WarningService) {}

  @Query(() => [Warning])
  async warnings(): Promise<Warning[]> {
    return this.warningService.findAll();
  }

  @Query(() => [Warning])
  async userWarnings(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<Warning[]> {
    return this.warningService.findByUser(userId);
  }

  @Query(() => [Warning])
  async activeWarnings(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<Warning[]> {
    return this.warningService.findActiveWarnings(userId);
  }

  @Query(() => Number)
  async userStrikesCount(
    @Args('userId', { type: () => ID }) userId: string,
  ): Promise<number> {
    return this.warningService.getUserStrikesCount(userId);
  }

  @Mutation(() => Warning)
  async createWarning(
    @Args('input') input: CreateWarningInput,
    @CurrentUser() moderator: User,
  ): Promise<Warning> {
    return this.warningService.create(input, moderator);
  }

  @Mutation(() => Warning)
  async acknowledgeWarning(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ): Promise<Warning> {
    return this.warningService.acknowledge(id, user.id);
  }

  @Mutation(() => Warning)
  async resolveWarning(
    @Args('id', { type: () => ID }) id: string,
    @Args('note', { nullable: true }) note: string,
    @CurrentUser() moderator: User,
  ): Promise<Warning> {
    return this.warningService.resolve(id, moderator, note);
  }
} 
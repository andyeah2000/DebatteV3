import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Notification)
@UseGuards(GqlAuthGuard)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => [Notification])
  async getUserNotifications(
    @CurrentUser() user: User,
    @Args('limit', { type: () => Number, nullable: true }) limit?: number,
    @Args('offset', { type: () => Number, nullable: true }) offset?: number,
  ) {
    return this.notificationsService.getUserNotifications(user.id, { limit, offset });
  }

  @Query(() => Number)
  async getUnreadNotificationsCount(@CurrentUser() user: User) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Mutation(() => Boolean)
  async markNotificationAsRead(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Mutation(() => Boolean)
  async markAllNotificationsAsRead(@CurrentUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Mutation(() => Boolean)
  async deleteNotification(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.notificationsService.deleteNotification(user.id, id);
  }

  @Mutation(() => Boolean)
  async clearAllNotifications(@CurrentUser() user: User) {
    return this.notificationsService.clearAllNotifications(user.id);
  }
} 
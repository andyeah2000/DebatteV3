import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { EmailService } from '../email/email.service';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { Notification, NotificationPriority, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly notificationGroups: Map<string, NotificationGroup> = new Map();

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly websocketGateway: WebsocketGateway,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  private getNotificationPriority(type: NotificationType): NotificationPriority {
    switch (type) {
      case NotificationType.DEBATE_ENDED:
      case NotificationType.MODERATION_ACTION:
        return NotificationPriority.URGENT;
      case NotificationType.BADGE_EARNED:
      case NotificationType.DEBATE_FEATURED:
        return NotificationPriority.HIGH;
      case NotificationType.DEBATE_REPLY:
      case NotificationType.COMMENT_REPLY:
        return NotificationPriority.MEDIUM;
      default:
        return NotificationPriority.LOW;
    }
  }

  async sendNotification(
    userId: string,
    type: NotificationType,
    data: any,
    options: {
      priority?: NotificationPriority;
      groupId?: string;
    } = {}
  ): Promise<void> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ['settings']
      });

      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      const priority = options.priority || this.getNotificationPriority(type);
      const notification = this.notificationRepository.create({
        userId,
        type,
        priority,
        title: this.getNotificationTitle(type, data),
        message: this.getNotificationMessage(type, data),
        data,
        isRead: false,
        groupId: options.groupId
      });

      await this.notificationRepository.save(notification);

      // Send real-time notification via WebSocket
      if (user.settings?.pushNotifications) {
        this.websocketGateway.server.to(`user:${userId}`).emit('notification', notification);
      }

      // Send email notification if enabled and priority is high enough
      if (
        user.settings?.emailNotifications &&
        [NotificationPriority.HIGH, NotificationPriority.URGENT].includes(priority)
      ) {
        await this.emailService.sendEmail(user.email, type, data);
      }

      this.logger.log(`Notification sent to user ${userId} of type ${type}`);
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}:`, error);
      throw error;
    }
  }

  async getUserNotifications(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<Notification[]> {
    const { limit = 20, offset = 0 } = options;

    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    const result = await this.notificationRepository.update(
      { id: notificationId, userId },
      { isRead: true }
    );
    return result.affected > 0;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const result = await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true }
    );
    return result.affected > 0;
  }

  async deleteNotification(userId: string, notificationId: string): Promise<boolean> {
    const result = await this.notificationRepository.delete({
      id: notificationId,
      userId,
    });
    return result.affected > 0;
  }

  async clearAllNotifications(userId: string): Promise<boolean> {
    const result = await this.notificationRepository.delete({ userId });
    return result.affected > 0;
  }

  private getNotificationTitle(type: NotificationType, data: any): string {
    switch (type) {
      case NotificationType.DEBATE_REPLY:
        return 'New Reply to Your Debate';
      case NotificationType.BADGE_EARNED:
        return `New Badge Earned: ${data.badgeName}`;
      case NotificationType.DEBATE_FEATURED:
        return 'Your Debate Has Been Featured!';
      case NotificationType.VOTE_RECEIVED:
        return 'New Vote on Your Content';
      case NotificationType.COMMENT_REPLY:
        return 'Someone Replied to Your Comment';
      case NotificationType.DEBATE_ENDED:
        return 'Debate Has Ended';
      case NotificationType.SOURCE_VERIFIED:
        return 'Source Verification Update';
      case NotificationType.MODERATION_ACTION:
        return 'Moderation Action Required';
      default:
        return 'New Notification';
    }
  }

  private getNotificationMessage(type: NotificationType, data: any): string {
    switch (type) {
      case NotificationType.DEBATE_REPLY:
        return `${data.commenterName} has replied to your debate "${data.debateTitle}"`;
      case NotificationType.BADGE_EARNED:
        return `Congratulations! You've earned the ${data.badgeName} badge!`;
      case NotificationType.DEBATE_FEATURED:
        return `Your debate "${data.debateTitle}" has been featured on the platform!`;
      case NotificationType.VOTE_RECEIVED:
        return `Your ${data.contentType} received a new ${data.voteType} vote`;
      case NotificationType.COMMENT_REPLY:
        return `${data.commenterName} replied to your comment in "${data.debateTitle}"`;
      case NotificationType.DEBATE_ENDED:
        return `The debate "${data.debateTitle}" has concluded`;
      case NotificationType.SOURCE_VERIFIED:
        return `Your source "${data.sourceUrl}" has been ${data.status}`;
      case NotificationType.MODERATION_ACTION:
        return `Moderation action required for ${data.contentType}: ${data.reason}`;
      default:
        return 'You have a new notification';
    }
  }
}

interface NotificationGroup {
  type: NotificationType;
  items: Notification[];
  count: number;
  lastUpdated: Date;
} 
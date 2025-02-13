import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Warning, WarningLevel, WarningStatus } from '../entities/warning.entity';
import { CreateWarningInput } from '../dto/create-warning.input';
import { User } from '../../users/entities/user.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/entities/notification.entity';
import { WebsocketGateway } from '../../websocket/websocket.gateway';

@Injectable()
export class WarningService {
  constructor(
    @InjectRepository(Warning)
    private readonly warningRepository: Repository<Warning>,
    private readonly notificationsService: NotificationsService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async create(input: CreateWarningInput, moderator: User): Promise<Warning> {
    const warning = this.warningRepository.create({
      ...input,
      issuedBy: moderator,
      status: WarningStatus.ACTIVE,
    });

    const savedWarning = await this.warningRepository.save(warning);

    // Calculate strikes based on warning level
    const strikes = this.calculateStrikes(input.level);
    warning.strikes = strikes;

    // Send notification to user
    await this.notificationsService.sendNotification(
      input.userId,
      NotificationType.MODERATION_ACTION,
      {
        warningId: savedWarning.id,
        level: savedWarning.level,
        reason: savedWarning.reason,
        strikes,
      },
      {
        priority: this.getNotificationPriority(input.level),
      }
    );

    // Emit websocket event
    this.websocketGateway.server.to(`user:${input.userId}`).emit('warningReceived', {
      id: savedWarning.id,
      level: savedWarning.level,
      reason: savedWarning.reason,
      strikes,
    });

    return savedWarning;
  }

  async findAll(): Promise<Warning[]> {
    return this.warningRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Warning[]> {
    return this.warningRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveWarnings(userId: string): Promise<Warning[]> {
    return this.warningRepository.find({
      where: {
        user: { id: userId },
        status: WarningStatus.ACTIVE,
        expiresAt: LessThan(new Date()),
      },
    });
  }

  async acknowledge(id: string, userId: string): Promise<Warning> {
    const warning = await this.warningRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!warning) {
      throw new NotFoundException('Warning not found');
    }

    warning.status = WarningStatus.ACKNOWLEDGED;
    return this.warningRepository.save(warning);
  }

  async resolve(id: string, moderator: User, note?: string): Promise<Warning> {
    const warning = await this.warningRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!warning) {
      throw new NotFoundException('Warning not found');
    }

    warning.status = WarningStatus.RESOLVED;
    if (note) {
      warning.details = `${warning.details || ''}\nResolved by ${moderator.username}: ${note}`;
    }

    const resolvedWarning = await this.warningRepository.save(warning);

    // Notify user about resolved warning
    await this.notificationsService.sendNotification(
      warning.user.id,
      NotificationType.MODERATION_ACTION,
      {
        warningId: warning.id,
        status: WarningStatus.RESOLVED,
        note,
      }
    );

    return resolvedWarning;
  }

  async getUserStrikesCount(userId: string): Promise<number> {
    const activeWarnings = await this.findActiveWarnings(userId);
    return activeWarnings.reduce((total, warning) => total + warning.strikes, 0);
  }

  private calculateStrikes(level: WarningLevel): number {
    switch (level) {
      case WarningLevel.NOTICE:
        return 0;
      case WarningLevel.WARNING:
        return 1;
      case WarningLevel.SEVERE:
        return 2;
      case WarningLevel.CRITICAL:
        return 3;
      default:
        return 0;
    }
  }

  private getNotificationPriority(level: WarningLevel): 'low' | 'medium' | 'high' | 'urgent' {
    switch (level) {
      case WarningLevel.NOTICE:
        return 'low';
      case WarningLevel.WARNING:
        return 'medium';
      case WarningLevel.SEVERE:
        return 'high';
      case WarningLevel.CRITICAL:
        return 'urgent';
      default:
        return 'medium';
    }
  }
} 
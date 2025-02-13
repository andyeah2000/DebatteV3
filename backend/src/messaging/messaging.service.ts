import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export enum EventType {
  DEBATE_CREATED = 'debate.created',
  DEBATE_UPDATED = 'debate.updated',
  DEBATE_DELETED = 'debate.deleted',
  COMMENT_CREATED = 'comment.created',
  COMMENT_UPDATED = 'comment.updated',
  COMMENT_DELETED = 'comment.deleted',
  VOTE_CAST = 'vote.cast',
  USER_REGISTERED = 'user.registered',
  USER_UPDATED = 'user.updated',
  MODERATION_ACTION = 'moderation.action',
  REPORT_CREATED = 'report.created',
}

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @Inject('EVENTS_SERVICE') private readonly eventsClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      await this.eventsClient.connect();
      this.logger.log('Successfully connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
    }
  }

  async emitEvent<T>(eventType: EventType, payload: T) {
    try {
      await this.eventsClient.emit(eventType, payload).toPromise();
      this.logger.debug(`Event emitted: ${eventType}`);
    } catch (error) {
      this.logger.error(`Failed to emit event ${eventType}:`, error);
      throw error;
    }
  }

  async emitDebateEvent<T>(eventType: EventType, debateId: string, payload: T) {
    await this.emitEvent(eventType, {
      debateId,
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }

  async emitUserEvent<T>(eventType: EventType, userId: string, payload: T) {
    await this.emitEvent(eventType, {
      userId,
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }

  async emitModerationEvent<T>(eventType: EventType, moderatorId: string, payload: T) {
    await this.emitEvent(eventType, {
      moderatorId,
      timestamp: new Date().toISOString(),
      ...payload,
    });
  }
} 
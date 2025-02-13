export enum NotificationType {
  DEBATE_REPLY = 'debate_reply',
  BADGE_EARNED = 'badge_earned',
  DEBATE_FEATURED = 'debate_featured',
  VOTE_RECEIVED = 'vote_received',
  COMMENT_REPLY = 'comment_reply',
  DEBATE_ENDED = 'debate_ended',
  SOURCE_VERIFIED = 'source_verified',
  MODERATION_ACTION = 'moderation_action'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: string;
}

export interface NotificationGroup {
  type: NotificationType;
  items: Notification[];
  count: number;
  lastUpdated: Date;
} 
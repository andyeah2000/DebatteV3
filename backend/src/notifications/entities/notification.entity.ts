import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

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

@ObjectType()
@Entity('notifications')
export class Notification {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.LOW
  })
  priority: NotificationPriority;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column('text')
  message: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isRead: boolean;

  @Field(() => String, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  data?: any;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  groupId?: string;

  @Field(() => User)
  @ManyToOne(() => User, user => user.notifications)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
} 
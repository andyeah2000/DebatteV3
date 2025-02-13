import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable, OneToOne } from 'typeorm';
import { Debate } from '../../debates/entities/debate.entity';
import { Comment } from '../../debates/entities/comment.entity';
import { Vote } from '../../debates/entities/vote.entity';
import { Badge } from './badge.entity';
import { Source } from '../../sources/entities/source.entity';
import { UserSettings } from './user-settings.entity';
import { Notification } from '../../notifications/entities/notification.entity';

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Field()
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Field(() => [String])
  @Column('simple-array', { default: ['user'] })
  roles: string[];

  @Field(() => Boolean)
  @Column({ default: false })
  isVerified: boolean;

  @Field(() => Number)
  @Column({ default: 0 })
  reputationScore: number;

  @Field(() => Number)
  @Column({ default: 0 })
  debateScore: number;

  @Field(() => Number)
  @Column({ default: 0 })
  commentScore: number;

  @Field(() => Number)
  @Column({ default: 0 })
  sourceScore: number;

  @Field(() => [Badge])
  @ManyToMany(() => Badge, badge => badge.users)
  @JoinTable({
    name: 'user_badges',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'badgeId', referencedColumnName: 'id' }
  })
  badges: Badge[];

  @Field(() => UserSettings, { nullable: true })
  @OneToOne(() => UserSettings, settings => settings.user)
  settings?: UserSettings;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  avatarUrl?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  bio?: string;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Boolean)
  @Column({ default: false })
  isDeleted: boolean;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  refreshToken?: string;

  @Field(() => [Debate], { nullable: true })
  @OneToMany(() => Debate, debate => debate.author)
  debates?: Debate[];

  @Field(() => [Comment])
  @OneToMany(() => Comment, comment => comment.author)
  comments: Comment[];

  @Field(() => [Vote])
  @OneToMany(() => Vote, vote => vote.user)
  votes: Vote[];

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  googleId?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  githubId?: string;

  @Field(() => [Source])
  @OneToMany(() => Source, source => source.submittedBy)
  sources: Source[];

  @Field(() => [Notification])
  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];
} 
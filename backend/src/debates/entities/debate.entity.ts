import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, ManyToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Comment } from './comment.entity';
import { Vote } from './vote.entity';
import { AIAnalysis } from '../../common/types/ai-analysis.type';
import { Topic } from '../../topics/entities/topic.entity';
import { Source } from '../../sources/entities/source.entity';

@ObjectType()
class TimelineEvent {
  @Field()
  id: string;

  @Field()
  type: 'comment' | 'vote' | 'status_change' | 'milestone';

  @Field()
  timestamp: Date;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => String, { nullable: true })
  metadata?: string;
}

@ObjectType()
class DebatePhase {
  @Field()
  name: string;

  @Field()
  startTime: Date;

  @Field(() => Date, { nullable: true })
  endTime?: Date;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => [String])
  requirements: string[];
}

@ObjectType()
class DebateMetadata {
  @Field(() => AIAnalysis)
  aiAnalysis: AIAnalysis;

  @Field(() => [String])
  biasTypes: string[];

  @Field(() => [String])
  argumentStrengths: string[];

  @Field(() => [String])
  argumentWeaknesses: string[];

  @Field(() => [String])
  suggestions: string[];

  @Field(() => [TimelineEvent])
  timeline: TimelineEvent[];

  @Field(() => [DebatePhase])
  phases: DebatePhase[];
}

@ObjectType()
@Entity('debates')
export class Debate {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column('text')
  description: string;

  @Field(() => User)
  @ManyToOne(() => User, user => user.debates)
  author: User;

  @Field(() => String)
  @Column()
  category: string;

  @Field(() => [String])
  @Column('simple-array', { default: [] })
  tags: string[];

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  scheduledEndTime: Date;

  @Field(() => Boolean)
  @Column({ default: false })
  isEnded: boolean;

  @Field(() => Boolean)
  @Column({ default: false })
  isFeatured: boolean;

  @Field(() => Number)
  @Column({ default: 0 })
  viewCount: number;

  @Field(() => Number)
  @Column({ default: 0 })
  participantsCount: number;

  @Field(() => Number)
  @Column({ default: 0 })
  proVotes: number;

  @Field(() => Number)
  @Column({ default: 0 })
  conVotes: number;

  @Field(() => [Vote])
  @OneToMany(() => Vote, vote => vote.debate)
  votes: Vote[];

  @Field(() => [Comment])
  @OneToMany(() => Comment, comment => comment.debate)
  comments: Comment[];

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Boolean)
  @Column({ default: false })
  isDeleted: boolean;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  winningPosition?: string;

  @Field(() => String, { nullable: true })
  @Column('text', { nullable: true })
  summary?: string;

  @Field(() => DebateMetadata, { nullable: true })
  @Column('jsonb', { nullable: true })
  metadata?: DebateMetadata;

  @Field(() => [TimelineEvent])
  @Column('jsonb', { default: [] })
  timeline: TimelineEvent[];

  @Field(() => [DebatePhase])
  @Column('jsonb', { default: [] })
  phases: DebatePhase[];

  @Field(() => String)
  @Column({ default: 'opening' })
  currentPhase: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isModerated: boolean;

  @Field(() => Number)
  @Column({ default: 0 })
  qualityScore: number;

  @Field(() => [String])
  @Column('simple-array', { default: [] })
  requiredSources: string[];

  @Field(() => Number)
  @Column({ default: 0 })
  sourceQualityScore: number;

  @Field(() => Boolean)
  get isActive(): boolean {
    return !this.isEnded && (!this.scheduledEndTime || new Date(this.scheduledEndTime) > new Date());
  }

  @ManyToMany(() => Topic, topic => topic.debates)
  @Field(() => [Topic])
  topics: Topic[];

  @Field(() => [Source])
  @OneToMany(() => Source, source => source.debate)
  sources: Source[];
} 
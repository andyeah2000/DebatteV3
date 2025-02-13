import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Debate } from '../../debates/entities/debate.entity';

@ObjectType()
class ContentAnalysis {
  @Field()
  category: string;

  @Field(() => [String])
  topics: string[];

  @Field(() => Float)
  sentimentScore: number;

  @Field(() => Float)
  readabilityScore: number;

  @Field(() => Float)
  sentimentLabel: 'positive' | 'neutral' | 'negative';

  @Field(() => Float)
  credibilityIndicators: {
    hasReferences: boolean;
    hasDates: boolean;
    hasAuthor: boolean;
    hasStatistics: boolean;
    contentLength: number;
    languageQuality: number;
  };

  @Field(() => Float)
  biasIndicators: {
    emotionalLanguage: number;
    subjectivity: number;
    controversialTerms: string[];
  };
}

@ObjectType()
@Entity('sources')
export class Source {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  url: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => Float)
  @Column('float')
  trustScore: number;

  @Field()
  @Column({ default: false })
  isVerified: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  archiveUrl?: string;

  @Field(() => User)
  @ManyToOne(() => User, user => user.sources)
  submittedBy: User;

  @Field(() => Debate, { nullable: true })
  @ManyToOne(() => Debate, debate => debate.sources, { nullable: true })
  debate?: Debate;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  domain?: string;

  @Field(() => Boolean)
  @Column({ default: false })
  isDomainTrusted: boolean;

  @Field(() => Boolean)
  @Column({ default: true })
  isActive: boolean;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { nullable: true })
  tags?: string[];

  @Field(() => Number)
  @Column({ default: 0 })
  citationCount: number;

  @Field(() => ContentAnalysis, { nullable: true })
  @Column('jsonb', { nullable: true })
  analysis?: ContentAnalysis;

  @Field(() => String)
  @Column({ default: 'pending' })
  analysisStatus: 'pending' | 'completed' | 'failed';

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  lastAnalyzedAt?: Date;

  @Field(() => Number)
  @Column({ default: 0 })
  analysisVersion: number;
} 
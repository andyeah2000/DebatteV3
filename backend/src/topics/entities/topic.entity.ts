import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Debate } from '../../debates/entities/debate.entity';

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  NEUTRAL = 'neutral'
}

@Entity()
@ObjectType()
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  title: string;

  @Column({ type: 'text', nullable: true })
  @Field({ nullable: true })
  description?: string;

  @Column()
  @Field()
  category: string;

  @Column({
    type: 'enum',
    enum: TrendDirection,
    default: TrendDirection.NEUTRAL
  })
  @Field()
  trend: TrendDirection;

  @Column({ default: 0 })
  @Field()
  debateCount: number;

  @Column({ type: 'float', default: 0 })
  @Field()
  trendScore: number;

  @ManyToMany(() => Debate, debate => debate.topics)
  @JoinTable()
  @Field(() => [Debate])
  debates: Debate[];

  @ManyToMany(() => Topic, topic => topic.relatedTo)
  @JoinTable()
  @Field(() => [Topic])
  relatedTopics: Topic[];

  @ManyToMany(() => Topic, topic => topic.relatedTopics)
  relatedTo: Topic[];

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
} 
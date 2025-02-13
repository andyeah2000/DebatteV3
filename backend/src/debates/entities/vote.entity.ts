import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Debate } from './debate.entity';

@ObjectType()
@Entity()
export class Vote {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => Boolean)
  @Column()
  isProVote: boolean;

  @Field(() => User)
  @ManyToOne(() => User, user => user.votes)
  user: User;

  @Field(() => Debate)
  @ManyToOne(() => Debate, debate => debate.votes)
  debate: Debate;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Boolean)
  @Column({ default: false })
  isDeleted: boolean;
} 
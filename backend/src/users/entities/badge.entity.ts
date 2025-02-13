import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToMany } from 'typeorm';
import { User } from './user.entity';

@ObjectType()
@Entity('badges')
export class Badge {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field()
  @Column()
  icon: string;

  @Field()
  @Column()
  category: string;

  @Field(() => Number)
  @Column()
  requiredScore: number;

  @Field(() => Boolean)
  @Column({ default: false })
  isSpecial: boolean;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => [User])
  @ManyToMany(() => User, user => user.badges)
  users: User[];
} 
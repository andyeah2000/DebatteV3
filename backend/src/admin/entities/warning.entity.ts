import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum WarningLevel {
  NOTICE = 'notice',
  WARNING = 'warning',
  SEVERE = 'severe',
  CRITICAL = 'critical'
}

export enum WarningStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  EXPIRED = 'expired'
}

@ObjectType()
@Entity('warnings')
export class Warning {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User)
  @ManyToOne(() => User, { eager: true })
  user: User;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: WarningLevel,
    default: WarningLevel.NOTICE
  })
  level: WarningLevel;

  @Field(() => String)
  @Column({
    type: 'enum',
    enum: WarningStatus,
    default: WarningStatus.ACTIVE
  })
  status: WarningStatus;

  @Field(() => String)
  @Column()
  reason: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  details: string;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  expiresAt: Date;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, { eager: true, nullable: true })
  issuedBy: User;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => [String])
  @Column('simple-array', { default: '' })
  relatedContentIds: string[];

  @Field(() => Number)
  @Column({ default: 0 })
  strikes: number;
} 
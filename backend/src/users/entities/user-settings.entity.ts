import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@ObjectType()
@Entity('user_settings')
export class UserSettings {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.settings)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field()
  @Column({ default: true })
  emailNotifications: boolean;

  @Field()
  @Column({ default: true })
  pushNotifications: boolean;

  @Field()
  @Column({ default: 'light' })
  theme: string;

  @Field()
  @Column({ default: 'en' })
  language: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
} 
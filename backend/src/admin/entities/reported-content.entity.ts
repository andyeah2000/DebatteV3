import { ObjectType, Field, ID } from '@nestjs/graphql'
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Debate } from '../../debates/entities/debate.entity'
import { Comment } from '../../debates/entities/comment.entity'

@ObjectType()
@Entity()
export class ReportedContent {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Field()
  @Column()
  type: 'debate' | 'comment'

  @Field()
  @Column()
  reason: string

  @Field()
  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected'

  @Field(() => User)
  @ManyToOne(() => User)
  reportedBy: User

  @Field(() => User)
  @ManyToOne(() => User)
  moderatedBy: User

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  moderatedAt: Date

  @ManyToOne(() => Debate, { nullable: true })
  debate: Debate

  @ManyToOne(() => Comment, { nullable: true })
  comment: Comment

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  moderationNote: string
} 
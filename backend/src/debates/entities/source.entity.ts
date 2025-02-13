import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Comment } from './comment.entity';

@ObjectType()
@Entity('source')
export class Source {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  url: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ type: 'float', nullable: true })
  credibilityScore?: number;

  @Field()
  @Column({
    type: 'enum',
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  })
  verificationStatus: 'pending' | 'verified' | 'rejected';

  @ManyToOne(() => Comment, comment => comment.sources)
  comment: Comment;
} 
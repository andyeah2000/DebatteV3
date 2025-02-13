import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Debate } from './debate.entity';
import { Source } from './source.entity';
import { Media } from './media.entity';

@ObjectType()
class CommentCorrection {
  @Field()
  claim: string;

  @Field()
  correction: string;
}

@ObjectType()
class CommentFactCheck {
  @Field(() => [String])
  suggestedSources: string[];

  @Field()
  isFactual: boolean;

  @Field(() => [CommentCorrection], { nullable: true })
  corrections?: CommentCorrection[];
}

@ObjectType()
class CommentAIAnalysis {
  @Field()
  argumentQuality: number;

  @Field({ nullable: true })
  biasLevel?: number;

  @Field({ nullable: true })
  factualAccuracy?: number;

  @Field()
  moderationConfidence: number;
}

@ObjectType()
class CommentArgumentAnalysis {
  @Field()
  hasThesis: boolean;

  @Field()
  hasLogicalFlow: boolean;

  @Field()
  hasEvidence: boolean;

  @Field()
  counterArgumentsAddressed: boolean;
}

@ObjectType()
class CommentMetadata {
  @Field(() => CommentFactCheck)
  factCheck: CommentFactCheck;

  @Field(() => CommentAIAnalysis)
  aiAnalysis: CommentAIAnalysis;

  @Field(() => CommentArgumentAnalysis)
  argumentAnalysis: CommentArgumentAnalysis;
}

@ObjectType()
@Entity('comment')
export class Comment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('text')
  content: string;

  @Field()
  @Column()
  isProArgument: boolean;

  @Field()
  @Column({ default: false })
  isVerified: boolean;

  @Field()
  @Column({ default: false })
  isDeleted: boolean;

  @Field()
  @Column({ default: false })
  isEdited: boolean;

  @Field()
  @Column({ default: 0 })
  upvotes: number;

  @Field()
  @Column({ default: 0 })
  downvotes: number;

  @Field(() => [Source])
  @OneToMany(() => Source, source => source.comment, { eager: true, cascade: true })
  sources: Source[];

  @Field(() => [Media])
  @OneToMany(() => Media, media => media.comment, { eager: true, cascade: true })
  media: Media[];

  @Field(() => CommentMetadata)
  @Column('jsonb', {
    default: {
      factCheck: {
        suggestedSources: [],
        isFactual: true,
        corrections: []
      },
      aiAnalysis: {
        argumentQuality: 0,
        biasLevel: 0,
        factualAccuracy: 0,
        moderationConfidence: 0
      },
      argumentAnalysis: {
        hasThesis: false,
        hasLogicalFlow: false,
        hasEvidence: false,
        counterArgumentsAddressed: false
      }
    }
  })
  metadata: CommentMetadata;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => User)
  @ManyToOne(() => User, { eager: true })
  author: User;

  @Column()
  authorId: string;

  @Field(() => Debate)
  @ManyToOne(() => Debate, debate => debate.comments)
  debate: Debate;

  @Column()
  debateId: string;

  @Field(() => Comment, { nullable: true })
  @ManyToOne(() => Comment, { nullable: true })
  replyTo?: Comment;

  @Column({ nullable: true })
  replyToId?: string;
} 
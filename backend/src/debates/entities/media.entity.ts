import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Comment } from './comment.entity';

@ObjectType()
@Entity('media')
export class Media {
  @Field()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({
    type: 'enum',
    enum: ['image', 'video', 'infographic'],
    default: 'image'
  })
  type: 'image' | 'video' | 'infographic';

  @Field()
  @Column()
  url: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Comment, comment => comment.media)
  comment: Comment;
} 
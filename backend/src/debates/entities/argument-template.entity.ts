import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@ObjectType()
@Entity('argument_templates')
export class ArgumentTemplate {
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
  category: string;

  @Field(() => [String])
  @Column('simple-array')
  requiredSections: string[];

  @Field(() => [String])
  @Column('simple-array')
  optionalSections: string[];

  @Field(() => String)
  @Column('jsonb')
  validationRules: {
    minLength?: number;
    maxLength?: number;
    requiredKeywords?: string[];
    bannedKeywords?: string[];
    sourceRequirements?: {
      minSources: number;
      allowedDomains?: string[];
    };
  };

  @Field(() => String)
  @Column('jsonb')
  structure: {
    introduction: {
      required: boolean;
      minLength?: number;
      maxLength?: number;
      guidelines: string[];
    };
    mainPoints: {
      required: boolean;
      minPoints: number;
      maxPoints: number;
      guidelines: string[];
    };
    evidence: {
      required: boolean;
      minSources: number;
      guidelines: string[];
    };
    counterArguments: {
      required: boolean;
      minCounter: number;
      guidelines: string[];
    };
    conclusion: {
      required: boolean;
      minLength?: number;
      maxLength?: number;
      guidelines: string[];
    };
  };

  @Field(() => [String])
  @Column('simple-array')
  suggestedTransitions: string[];

  @Field(() => [String])
  @Column('simple-array')
  examplePhrases: string[];

  @Field()
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
} 
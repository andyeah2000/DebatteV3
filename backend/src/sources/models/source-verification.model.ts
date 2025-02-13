import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class SourceVerificationResult {
  @Field()
  isValid: boolean;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  trustScore: number;

  @Field(() => [String], { nullable: true })
  errors?: string[];

  @Field({ nullable: true })
  archiveUrl?: string;

  @Field(() => Boolean)
  isDomainTrusted: boolean;

  @Field()
  domain: string;
} 
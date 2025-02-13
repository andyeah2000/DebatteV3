import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class AIAnalysis {
  @Field(() => Float, { nullable: true })
  biasLevel?: number;

  @Field(() => Float)
  argumentQuality: number;

  @Field(() => Float)
  moderationConfidence: number;

  @Field(() => Float, { nullable: true })
  factualAccuracy?: number;
} 
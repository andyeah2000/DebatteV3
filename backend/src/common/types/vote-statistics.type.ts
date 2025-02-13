import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class VoteStatistics {
  @Field(() => Int)
  totalVotes: number;

  @Field(() => Int)
  proVotes: number;

  @Field(() => Int)
  conVotes: number;

  @Field(() => Float)
  proPercentage: number;

  @Field(() => Float)
  conPercentage: number;
} 
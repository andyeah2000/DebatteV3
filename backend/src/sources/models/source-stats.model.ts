import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class SourceStats {
  @Field(() => Int)
  totalSources: number;

  @Field(() => Int)
  verifiedSources: number;

  @Field(() => Float)
  averageTrustScore: number;
} 
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Correction {
  @Field()
  claim: string;

  @Field()
  correction: string;
} 
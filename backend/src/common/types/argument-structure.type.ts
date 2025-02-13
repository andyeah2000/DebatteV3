import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ArgumentStructure {
  @Field()
  hasThesis: boolean;

  @Field()
  hasEvidence: boolean;

  @Field()
  hasLogicalFlow: boolean;

  @Field()
  counterArgumentsAddressed: boolean;
} 
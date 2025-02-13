import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ReputationAction } from '../reputation.service';

@InputType()
export class UpdateReputationInput {
  @Field(() => ID)
  @IsUUID()
  userId: string;

  @Field(() => ReputationAction)
  @IsEnum(ReputationAction)
  action: ReputationAction;

  @Field(() => ReputationContextInput, { nullable: true })
  @IsOptional()
  context?: ReputationContextInput;
}

@InputType()
class ReputationContextInput {
  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  debateId?: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  commentId?: string;
}

@InputType()
export class AwardSpecialBadgeInput {
  @Field(() => ID)
  @IsUUID()
  userId: string;

  @Field(() => ID)
  @IsUUID()
  badgeId: string;
} 
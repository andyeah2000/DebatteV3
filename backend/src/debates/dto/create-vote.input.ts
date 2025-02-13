import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsUUID, IsBoolean, IsOptional, MaxLength } from 'class-validator';

@InputType()
export class CreateVoteInput {
  @Field(() => ID)
  @IsUUID()
  debateId: string;

  @Field()
  @IsBoolean()
  isProVote: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
} 
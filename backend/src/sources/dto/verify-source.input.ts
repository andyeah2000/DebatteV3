import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUrl, IsOptional, IsUUID } from 'class-validator';

@InputType()
export class VerifySourceInput {
  @Field()
  @IsUrl({ require_protocol: true })
  url: string;

  @Field(() => ID, { nullable: true })
  @IsUUID()
  @IsOptional()
  debateId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];
} 
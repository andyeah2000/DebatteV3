import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, MinLength, MaxLength, IsUUID, IsBoolean, IsArray, IsOptional } from 'class-validator';

@InputType()
class ArgumentSectionInput {
  @Field()
  @IsString()
  type: string;

  @Field()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  content: string;
}

@InputType()
export class CreateCommentInput {
  @Field()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  content: string;

  @Field(() => ID)
  @IsUUID()
  debateId: string;

  @Field()
  @IsBoolean()
  isProArgument: boolean;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  sources: string[];

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  replyToId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @Field(() => [ArgumentSectionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  sections?: ArgumentSectionInput[];
} 
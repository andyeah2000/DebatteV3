import { InputType, Field, ID } from '@nestjs/graphql'
import { IsNotEmpty, IsString, IsUUID, IsOptional, IsBoolean, IsArray } from 'class-validator'

@InputType()
export class CreateCommentInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  content: string

  @Field(() => ID)
  @IsUUID()
  debateId: string

  @Field(() => Boolean)
  @IsBoolean()
  isProArgument: boolean

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  sources: string[]

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  replyToId?: string
} 
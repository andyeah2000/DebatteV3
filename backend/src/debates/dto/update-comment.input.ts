import { InputType, Field, ID, PartialType, OmitType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { CreateCommentInput } from './create-comment.input';

@InputType()
export class UpdateCommentInput extends PartialType(
  OmitType(CreateCommentInput, ['debateId'] as const),
) {
  @Field(() => ID)
  @IsUUID()
  id: string;
} 
import { InputType, Field, PartialType, OmitType } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';

@InputType()
export class UpdateUserInput extends PartialType(
  OmitType(CreateUserInput, ['email'] as const),
) {
  @Field({ nullable: true })
  currentPassword?: string;
} 
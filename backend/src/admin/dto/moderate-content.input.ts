import { InputType, Field, ID, registerEnumType } from '@nestjs/graphql'
import { IsNotEmpty, IsString, IsUUID, IsEnum } from 'class-validator'

export enum ModerateAction {
  PENDING = 'pending',
  APPROVE = 'approved',
  REJECT = 'rejected',
}

registerEnumType(ModerateAction, {
  name: 'ModerateAction',
  description: 'The action to take on reported content',
});

@InputType()
export class ModerateContentInput {
  @Field(() => ID)
  @IsUUID()
  contentId: string

  @Field(() => ModerateAction)
  @IsNotEmpty()
  @IsEnum(ModerateAction)
  action: ModerateAction

  @Field(() => String, { nullable: true })
  @IsString()
  note?: string
} 
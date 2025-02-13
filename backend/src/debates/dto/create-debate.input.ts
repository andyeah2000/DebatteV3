import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength, MaxLength, IsArray, IsOptional, IsDate } from 'class-validator';

@InputType()
export class CreateDebateInput {
  @Field()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @Field()
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @Field()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  category: string;

  @Field(() => [String], { defaultValue: [] })
  @IsArray()
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags: string[];

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  scheduledEndTime?: Date;
} 
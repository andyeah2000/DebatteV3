import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsUUID, IsEnum, IsOptional, IsArray, IsDate } from 'class-validator';
import { WarningLevel } from '../entities/warning.entity';

@InputType()
export class CreateWarningInput {
  @Field(() => ID)
  @IsUUID()
  userId: string;

  @Field(() => String)
  @IsEnum(WarningLevel)
  level: WarningLevel;

  @Field()
  @IsString()
  @IsNotEmpty()
  reason: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  details?: string;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  expiresAt?: Date;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  relatedContentIds?: string[];
} 
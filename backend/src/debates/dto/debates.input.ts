import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum SortBy {
  RECENT = 'recent',
  POPULAR = 'popular',
  ACTIVE = 'active',
}

@InputType()
export class DebatesInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field(() => String)
  @IsEnum(SortBy)
  sortBy: SortBy = SortBy.RECENT;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  limit: number = 10;
} 
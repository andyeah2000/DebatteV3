import { InputType, Field, ID } from '@nestjs/graphql';
import { IsString, IsUUID, IsOptional, IsArray, IsBoolean, IsDate, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
class TimelineEventInput {
  @Field()
  @IsString()
  type: 'comment' | 'vote' | 'status_change' | 'milestone';

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  content?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metadata?: string;
}

@InputType()
class DebatePhaseInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => Date)
  @IsDate()
  startTime: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  endTime?: Date;

  @Field()
  @IsBoolean()
  isActive: boolean;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  requirements: string[];
}

@InputType()
export class UpdateDebateInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  scheduledEndTime?: Date;

  @Field(() => [TimelineEventInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimelineEventInput)
  timeline?: TimelineEventInput[];

  @Field(() => [DebatePhaseInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DebatePhaseInput)
  phases?: DebatePhaseInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  currentPhase?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isModerated?: boolean;
} 
import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsArray, IsBoolean, IsOptional, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
class ValidationRulesInput {
  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minLength?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxLength?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredKeywords?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bannedKeywords?: string[];

  @Field(() => SourceRequirementsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => SourceRequirementsInput)
  sourceRequirements?: SourceRequirementsInput;
}

@InputType()
class SourceRequirementsInput {
  @Field(() => Number)
  @IsNumber()
  @Min(0)
  minSources: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedDomains?: string[];
}

@InputType()
class SectionStructureInput {
  @Field(() => Boolean)
  @IsBoolean()
  required: boolean;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minLength?: number;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxLength?: number;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  guidelines: string[];
}

@InputType()
class MainPointsStructureInput {
  @Field(() => Boolean)
  @IsBoolean()
  required: boolean;

  @Field(() => Number)
  @IsNumber()
  @Min(1)
  minPoints: number;

  @Field(() => Number)
  @IsNumber()
  @Min(1)
  maxPoints: number;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  guidelines: string[];
}

@InputType()
class EvidenceStructureInput {
  @Field(() => Boolean)
  @IsBoolean()
  required: boolean;

  @Field(() => Number)
  @IsNumber()
  @Min(0)
  minSources: number;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  guidelines: string[];
}

@InputType()
class CounterArgumentsStructureInput {
  @Field(() => Boolean)
  @IsBoolean()
  required: boolean;

  @Field(() => Number)
  @IsNumber()
  @Min(0)
  minCounter: number;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  guidelines: string[];
}

@InputType()
class TemplateStructureInput {
  @Field(() => SectionStructureInput)
  @ValidateNested()
  @Type(() => SectionStructureInput)
  introduction: SectionStructureInput;

  @Field(() => MainPointsStructureInput)
  @ValidateNested()
  @Type(() => MainPointsStructureInput)
  mainPoints: MainPointsStructureInput;

  @Field(() => EvidenceStructureInput)
  @ValidateNested()
  @Type(() => EvidenceStructureInput)
  evidence: EvidenceStructureInput;

  @Field(() => CounterArgumentsStructureInput)
  @ValidateNested()
  @Type(() => CounterArgumentsStructureInput)
  counterArguments: CounterArgumentsStructureInput;

  @Field(() => SectionStructureInput)
  @ValidateNested()
  @Type(() => SectionStructureInput)
  conclusion: SectionStructureInput;
}

@InputType()
export class CreateArgumentTemplateInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @Field()
  @IsString()
  category: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  requiredSections: string[];

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  optionalSections: string[];

  @Field(() => ValidationRulesInput)
  @ValidateNested()
  @Type(() => ValidationRulesInput)
  validationRules: ValidationRulesInput;

  @Field(() => TemplateStructureInput)
  @ValidateNested()
  @Type(() => TemplateStructureInput)
  structure: TemplateStructureInput;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  suggestedTransitions: string[];

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  examplePhrases: string[];
} 
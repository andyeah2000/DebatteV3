import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Correction } from '../../common/types/correction.type';
import { ArgumentStructure } from '../../common/types/argument-structure.type';

@ObjectType()
export class ModerationResponse {
  @Field()
  isSafe: boolean;

  @Field(() => [String])
  reasons: string[];

  @Field(() => Float)
  confidence: number;
}

@ObjectType()
export class FactCheckResponse {
  @Field()
  isFactual: boolean;

  @Field(() => Float)
  confidence: number;

  @Field(() => [String], { nullable: true })
  suggestedSources?: string[];

  @Field(() => [Correction], { nullable: true })
  corrections?: Correction[];

  @Field({ nullable: true })
  verificationMethod?: string;
}

@ObjectType()
export class ArgumentQualityResponse {
  @Field(() => Int)
  score: number;

  @Field(() => [String])
  strengths: string[];

  @Field(() => [String])
  weaknesses: string[];

  @Field(() => [String])
  suggestions: string[];

  @Field(() => ArgumentStructure)
  structure: ArgumentStructure;
}

@ObjectType()
class BiasExample {
  @Field()
  text: string;

  @Field()
  biasType: string;
}

@ObjectType()
export class BiasAnalysisResponse {
  @Field(() => Float)
  biasLevel: number;

  @Field(() => [String])
  biasTypes: string[];

  @Field(() => [BiasExample])
  examples: BiasExample[];

  @Field(() => [String])
  suggestions: string[];
}

@ObjectType()
class CredibilityScore {
  @Field()
  source: string;

  @Field(() => Float)
  score: number;
}

@ObjectType()
export class SourceCredibilityResponse {
  @Field(() => [CredibilityScore])
  credibilityScores: CredibilityScore[];

  @Field(() => [String])
  analysis: string[];

  @Field(() => [String])
  recommendations: string[];
}

@ObjectType()
class DebateKeyPoints {
  @Field(() => [String])
  pro: string[];

  @Field(() => [String])
  con: string[];
}

@ObjectType()
class QualityMetrics {
  @Field(() => Float)
  overallQuality: number;

  @Field(() => Float)
  civilityScore: number;

  @Field(() => Float)
  factualAccuracy: number;
}

@ObjectType()
export class DebateSummaryResponse {
  @Field()
  summary: string;

  @Field(() => DebateKeyPoints)
  keyPoints: DebateKeyPoints;

  @Field(() => [String])
  mainConclusions: string[];

  @Field(() => QualityMetrics)
  qualityMetrics: QualityMetrics;
} 
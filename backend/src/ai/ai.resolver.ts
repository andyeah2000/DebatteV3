import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AIService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ModerationResponse,
  FactCheckResponse,
  ArgumentQualityResponse,
  BiasAnalysisResponse,
  SourceCredibilityResponse,
  DebateSummaryResponse,
} from './models/ai-responses.model';

@Resolver()
@UseGuards(JwtAuthGuard)
export class AIResolver {
  constructor(private readonly aiService: AIService) {}

  @Query(() => ModerationResponse)
  async moderateContent(
    @Args('content') content: string,
  ): Promise<ModerationResponse> {
    return this.aiService.moderateContent(content);
  }

  @Query(() => FactCheckResponse)
  async factCheck(
    @Args('content') content: string,
  ): Promise<FactCheckResponse> {
    return this.aiService.factCheck(content);
  }

  @Query(() => ArgumentQualityResponse)
  async assessArgumentQuality(
    @Args('content') content: string,
  ): Promise<ArgumentQualityResponse> {
    return this.aiService.assessArgumentQuality(content);
  }

  @Query(() => BiasAnalysisResponse)
  async detectBias(
    @Args('content') content: string,
  ): Promise<BiasAnalysisResponse> {
    return this.aiService.detectBias(content);
  }

  @Query(() => SourceCredibilityResponse)
  async assessSourceCredibility(
    @Args('sources', { type: () => [String] }) sources: string[],
  ): Promise<SourceCredibilityResponse> {
    return this.aiService.assessSourceCredibility(sources);
  }

  @Query(() => DebateSummaryResponse)
  async generateDebateSummary(
    @Args('title') title: string,
    @Args('description') description: string,
    @Args('proArguments', { type: () => [String] }) proArguments: string[],
    @Args('conArguments', { type: () => [String] }) conArguments: string[],
  ): Promise<DebateSummaryResponse> {
    return this.aiService.generateDebateSummary({
      title,
      description,
      proArguments,
      conArguments,
    });
  }
} 
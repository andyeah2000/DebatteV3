import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  ModerationResult,
  FactCheckResult,
  ArgumentQualityResult,
  BiasAnalysisResult,
  SourceCredibilityResult,
  DebateSummaryResult,
  DebateSummaryInput,
} from './interfaces/ai-responses.interface';

@Injectable()
export class AIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async moderateContent(content: string): Promise<ModerationResult> {
    try {
      const response = await this.openai.moderations.create({
        input: content,
      });

      const result = response.results[0];
      const isSafe = !result.flagged;
      const reasons = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category);

      return {
        isSafe,
        reasons,
        confidence: Math.max(...Object.values(result.category_scores)),
      };
    } catch (error) {
      console.error('AI moderation error:', error);
      return { isSafe: true, reasons: [], confidence: 0 };
    }
  }

  async factCheck(content: string): Promise<FactCheckResult> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get('OPENAI_MODEL') || "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a fact-checking assistant with expertise in verification and source credibility assessment. 
                     Analyze the following content for factual accuracy using multiple verification methods:
                     1. Primary source verification
                     2. Cross-reference checking
                     3. Expert consensus analysis
                     4. Statistical data validation
                     Return a detailed JSON object with your findings.`
          },
          {
            role: "user",
            content
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('AI fact-checking error:', error);
      return { isFactual: true, confidence: 0 };
    }
  }

  async assessArgumentQuality(content: string): Promise<ArgumentQualityResult> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get('OPENAI_MODEL') || "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert argument analysis assistant. Evaluate the following argument based on:
                     1. Logical structure and flow
                     2. Evidence quality and relevance
                     3. Counter-argument consideration
                     4. Rhetorical effectiveness
                     5. Clarity and coherence
                     Provide a detailed JSON response with scores and specific feedback.`
          },
          {
            role: "user",
            content
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('AI argument assessment error:', error);
      return {
        score: 0,
        strengths: [],
        weaknesses: ['Could not assess argument quality'],
        suggestions: ['Try again later'],
        structure: {
          hasThesis: false,
          hasEvidence: false,
          hasLogicalFlow: false,
          counterArgumentsAddressed: false,
        },
      };
    }
  }

  async detectBias(content: string): Promise<BiasAnalysisResult> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get('OPENAI_MODEL') || "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a bias detection specialist. Analyze the following content for various types of bias:
                     1. Cognitive biases
                     2. Political bias
                     3. Cultural bias
                     4. Confirmation bias
                     5. Selection bias
                     Provide specific examples and suggestions for improvement.`
          },
          {
            role: "user",
            content
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('AI bias detection error:', error);
      return {
        biasLevel: 0,
        biasTypes: [],
        examples: [],
        suggestions: ['Could not analyze bias'],
      };
    }
  }

  async assessSourceCredibility(sources: string[]): Promise<SourceCredibilityResult> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get('OPENAI_MODEL') || "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a source credibility assessment expert. Evaluate the following sources based on:
                     1. Authority and expertise
                     2. Currency and timeliness
                     3. Accuracy and fact-checking
                     4. Objectivity and bias
                     5. Coverage and depth
                     Provide detailed credibility scores and analysis.`
          },
          {
            role: "user",
            content: JSON.stringify(sources)
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('AI source credibility assessment error:', error);
      return {
        credibilityScores: [],
        analysis: ['Could not assess source credibility'],
        recommendations: ['Try again later'],
      };
    }
  }

  async generateDebateSummary(debate: DebateSummaryInput): Promise<DebateSummaryResult> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.configService.get('OPENAI_MODEL') || "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a debate analysis and summary expert. Create a comprehensive summary of the debate that includes:
                     1. Main arguments from both sides
                     2. Key points and evidence presented
                     3. Quality of discourse analysis
                     4. Factual accuracy assessment
                     5. Overall debate effectiveness
                     Provide a balanced and objective analysis.`
          },
          {
            role: "user",
            content: JSON.stringify(debate)
          }
        ],
        response_format: { type: "json_object" }
      });

      return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
      console.error('AI debate summary generation error:', error);
      return {
        summary: 'Could not generate summary',
        keyPoints: { pro: [], con: [] },
        mainConclusions: [],
        qualityMetrics: {
          overallQuality: 0,
          civilityScore: 0,
          factualAccuracy: 0,
        },
      };
    }
  }
} 
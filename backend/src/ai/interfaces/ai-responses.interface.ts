export interface ModerationResult {
  isSafe: boolean;
  reasons: string[];
  confidence: number;
}

export interface FactCheckResult {
  isFactual: boolean;
  confidence: number;
  suggestedSources?: string[];
  corrections?: { claim: string; correction: string }[];
  verificationMethod?: string;
}

export interface ArgumentQualityResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  structure: {
    hasThesis: boolean;
    hasEvidence: boolean;
    hasLogicalFlow: boolean;
    counterArgumentsAddressed: boolean;
  };
}

export interface BiasAnalysisResult {
  biasLevel: number;
  biasTypes: string[];
  examples: { text: string; biasType: string }[];
  suggestions: string[];
}

export interface SourceCredibilityResult {
  credibilityScores: { source: string; score: number }[];
  analysis: string[];
  recommendations: string[];
}

export interface DebateSummaryResult {
  summary: string;
  keyPoints: {
    pro: string[];
    con: string[];
  };
  mainConclusions: string[];
  qualityMetrics: {
    overallQuality: number;
    civilityScore: number;
    factualAccuracy: number;
  };
}

export interface DebateSummaryInput {
  title: string;
  description: string;
  proArguments: string[];
  conArguments: string[];
} 
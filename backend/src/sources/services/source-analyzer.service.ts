import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MetricsService } from '../../metrics/metrics.service';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import * as natural from 'natural';
import { readFileSync } from 'fs';
import { join } from 'path';

interface ContentAnalysis {
  category: string;
  topics: string[];
  sentiment: {
    score: number;
    label: 'positive' | 'neutral' | 'negative';
  };
  readabilityScore: number;
  credibilityIndicators: {
    hasReferences: boolean;
    hasDates: boolean;
    hasAuthor: boolean;
    hasStatistics: boolean;
    contentLength: number;
    languageQuality: number;
  };
  biasIndicators: {
    emotionalLanguage: number;
    subjectivity: number;
    controversialTerms: string[];
  };
}

@Injectable()
export class SourceAnalyzerService {
  private readonly tokenizer = new natural.WordTokenizer();
  private readonly tfidf = new natural.TfIdf();
  private readonly categories: string[];
  private readonly biasTerms: string[];
  private readonly credibilityPatterns: RegExp[];

  constructor(
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService,
  ) {
    // Load predefined categories and bias terms
    this.categories = JSON.parse(
      readFileSync(join(__dirname, '../data/categories.json'), 'utf-8')
    );
    this.biasTerms = JSON.parse(
      readFileSync(join(__dirname, '../data/bias-terms.json'), 'utf-8')
    );
    
    // Compile regex patterns for credibility indicators
    this.credibilityPatterns = [
      /\[\d+\]|\((?:\w+\s*)?et al\.,\s*\d{4}\)/i, // References
      /(?:\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})/i, // Dates
      /by\s+[A-Z][a-z]+\s+[A-Z][a-z]+|Author:\s*[A-Z][a-z]+/i, // Author
      /\d+(?:\.\d+)?%|\d+\s+(?:million|billion|trillion)|(?:\$|€|£)\d+/i, // Statistics
    ];
  }

  async analyzeContent(url: string): Promise<ContentAnalysis> {
    const startTime = process.hrtime();
    
    try {
      // Fetch content
      const content = await this.fetchContent(url);
      
      // Perform analysis
      const [category, topics] = await Promise.all([
        this.categorizeContent(content),
        this.extractTopics(content),
      ]);

      const analysis: ContentAnalysis = {
        category,
        topics,
        sentiment: this.analyzeSentiment(content),
        readabilityScore: this.calculateReadability(content),
        credibilityIndicators: this.analyzeCredibility(content),
        biasIndicators: this.analyzeBias(content),
      };

      // Track metrics
      const [seconds, nanoseconds] = process.hrtime(startTime);
      this.metricsService.observeDatabaseQueryDuration(
        'content_analysis',
        seconds + nanoseconds / 1e9
      );

      return analysis;
    } catch (error) {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      this.metricsService.observeDatabaseQueryDuration(
        'content_analysis_error',
        seconds + nanoseconds / 1e9
      );
      throw error;
    }
  }

  private async fetchContent(url: string): Promise<string> {
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Debattle Content Analyzer/1.0',
      },
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Remove unwanted elements
    ['script', 'style', 'nav', 'footer', 'header', 'aside'].forEach(tag => {
      document.querySelectorAll(tag).forEach(el => el.remove());
    });

    // Extract main content
    const mainContent = document.querySelector('main, article, .content, #content');
    return mainContent ? mainContent.textContent : document.body.textContent;
  }

  private async categorizeContent(content: string): Promise<string> {
    const tokens = this.tokenizer.tokenize(content.toLowerCase());
    
    // Calculate TF-IDF scores for each category
    const scores = this.categories.map(category => {
      const keywords = JSON.parse(
        readFileSync(join(__dirname, `../data/categories/${category}.json`), 'utf-8')
      );
      
      return {
        category,
        score: keywords.reduce((score: number, keyword: string) => {
          return score + tokens.filter(token => token === keyword).length;
        }, 0) / tokens.length,
      };
    });

    // Return category with highest score
    return scores.reduce((a, b) => a.score > b.score ? a : b).category;
  }

  private async extractTopics(content: string): Promise<string[]> {
    const tokens = this.tokenizer.tokenize(content.toLowerCase());
    this.tfidf.addDocument(tokens);

    // Get top 5 terms by TF-IDF score
    return this.tfidf
      .listTerms(0)
      .slice(0, 5)
      .map(item => item.term);
  }

  private analyzeSentiment(content: string): {
    score: number;
    label: 'positive' | 'neutral' | 'negative';
  } {
    const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
    const score = analyzer.getSentiment(this.tokenizer.tokenize(content));

    return {
      score,
      label: score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral',
    };
  }

  private calculateReadability(content: string): number {
    const words = content.split(/\s+/).length;
    const sentences = content.split(/[.!?]+/).length;
    const syllables = this.countSyllables(content);

    // Flesch-Kincaid Grade Level
    return 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  }

  private countSyllables(text: string): number {
    return text.toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/[^aeiou]+/g, ' ')
      .trim()
      .split(/\s+/).length;
  }

  private analyzeCredibility(content: string): {
    hasReferences: boolean;
    hasDates: boolean;
    hasAuthor: boolean;
    hasStatistics: boolean;
    contentLength: number;
    languageQuality: number;
  } {
    return {
      hasReferences: this.credibilityPatterns[0].test(content),
      hasDates: this.credibilityPatterns[1].test(content),
      hasAuthor: this.credibilityPatterns[2].test(content),
      hasStatistics: this.credibilityPatterns[3].test(content),
      contentLength: content.length,
      languageQuality: this.assessLanguageQuality(content),
    };
  }

  private assessLanguageQuality(content: string): number {
    const sentences = content.split(/[.!?]+/);
    let score = 1.0;

    // Penalize very short or very long sentences
    const avgLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    if (avgLength < 50 || avgLength > 200) score -= 0.2;

    // Check for common writing issues
    if (/!{2,}|\?{2,}|\.{4,}/.test(content)) score -= 0.1; // Multiple punctuation
    if (/[A-Z]{3,}/.test(content)) score -= 0.1; // All caps
    if (/\b(very|really|basically|literally)\b/gi.test(content)) score -= 0.1; // Weak modifiers

    return Math.max(0, score);
  }

  private analyzeBias(content: string): {
    emotionalLanguage: number;
    subjectivity: number;
    controversialTerms: string[];
  } {
    const tokens = this.tokenizer.tokenize(content.toLowerCase());
    
    // Check for emotional language
    const emotionalTerms = tokens.filter(token => 
      this.biasTerms.some(term => token.includes(term))
    );

    // Check for subjective indicators
    const subjectivePatterns = [
      /\b(I|we|my|our|myself|ourselves)\b/i,
      /\b(think|believe|feel|suggest|assume)\b/i,
      /\b(probably|maybe|perhaps|possibly)\b/i,
    ];

    const subjectivityScore = subjectivePatterns.reduce((score, pattern) => 
      score + (pattern.test(content) ? 0.2 : 0), 0
    );

    return {
      emotionalLanguage: emotionalTerms.length / tokens.length,
      subjectivity: Math.min(1, subjectivityScore),
      controversialTerms: emotionalTerms,
    };
  }
} 
import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Source } from './entities/source.entity';
import { MetricsService } from '../metrics/metrics.service';
import { ReputationService, ReputationAction } from '../users/reputation.service';
import { ConfigService } from '@nestjs/config';
import { SourceAnalyzerService } from './services/source-analyzer.service';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

interface SourceVerificationResult {
  isValid: boolean;
  title?: string;
  description?: string;
  trustScore: number;
  errors?: string[];
  archiveUrl?: string;
  isDomainTrusted: boolean;
  domain: string;
  analysis?: {
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
  };
}

@Injectable()
export class SourcesService {
  private readonly trustedDomains: string[];
  private readonly archiveApiKey: string;

  constructor(
    @InjectRepository(Source)
    private readonly sourcesRepository: Repository<Source>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly metricsService: MetricsService,
    private readonly reputationService: ReputationService,
    private readonly configService: ConfigService,
    private readonly sourceAnalyzer: SourceAnalyzerService,
  ) {
    this.trustedDomains = this.configService.get<string[]>('TRUSTED_DOMAINS', []);
    this.archiveApiKey = this.configService.get<string>('ARCHIVE_API_KEY', '');
  }

  private getCacheKey(type: string, id?: string): string {
    return `source:${type}${id ? `:${id}` : ''}`;
  }

  async verifySource(url: string, userId: string): Promise<SourceVerificationResult> {
    const startTime = process.hrtime();
    
    try {
      // Check cache first
      const cached = await this.cacheManager.get<SourceVerificationResult>(this.getCacheKey('verification', url));
      if (cached) {
        this.metricsService.setCacheHitRatio(1);
        return cached;
      }
      this.metricsService.setCacheHitRatio(0);

      // Basic URL validation
      if (!this.isValidUrl(url)) {
        throw new HttpException('Invalid URL format', HttpStatus.BAD_REQUEST);
      }

      const domain = new URL(url).hostname;
      const isDomainTrusted = this.trustedDomains.some(trusted => 
        domain === trusted || domain.endsWith(`.${trusted}`)
      );

      // Fetch and analyze the URL
      const { title, description } = await this.fetchUrlMetadata(url);

      // Perform AI analysis
      const analysis = await this.sourceAnalyzer.analyzeContent(url);

      // Calculate trust score with AI insights
      const trustScore = this.calculateTrustScore({
        isDomainTrusted,
        hasTitle: !!title,
        hasDescription: !!description,
        isHttps: url.startsWith('https'),
        analysis,
      });

      // Archive the URL if it's valid
      let archiveUrl: string | undefined;
      if (trustScore >= 0.5) {
        archiveUrl = await this.archiveUrl(url);
      }

      const result: SourceVerificationResult = {
        isValid: trustScore >= 0.5,
        title,
        description,
        trustScore,
        archiveUrl,
        isDomainTrusted,
        domain,
        analysis,
      };

      // Cache the result
      await this.cacheManager.set(this.getCacheKey('verification', url), result, 3600);

      // Award reputation points if the source is valid
      if (result.isValid) {
        await this.reputationService.updateReputation(userId, ReputationAction.SOURCE_VERIFIED);
      }

      const [seconds, nanoseconds] = process.hrtime(startTime);
      this.metricsService.observeDatabaseQueryDuration(
        'verify_source',
        seconds + nanoseconds / 1e9
      );

      return result;
    } catch (error) {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      this.metricsService.observeDatabaseQueryDuration(
        'verify_source_error',
        seconds + nanoseconds / 1e9
      );
      
      throw new HttpException(
        error.message || 'Failed to verify source',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUserSources(userId: string): Promise<Source[]> {
    const cacheKey = this.getCacheKey('user_sources', userId);
    const cached = await this.cacheManager.get<Source[]>(cacheKey);
    
    if (cached) {
      this.metricsService.setCacheHitRatio(1);
      return cached;
    }
    this.metricsService.setCacheHitRatio(0);

    const sources = await this.sourcesRepository.find({
      where: { submittedBy: { id: userId }, isActive: true },
      order: { createdAt: 'DESC' },
      relations: ['submittedBy', 'debate'],
    });

    await this.cacheManager.set(cacheKey, sources, 300); // Cache for 5 minutes
    return sources;
  }

  async getDebateSources(debateId: string): Promise<Source[]> {
    const cacheKey = this.getCacheKey('debate_sources', debateId);
    const cached = await this.cacheManager.get<Source[]>(cacheKey);
    
    if (cached) {
      this.metricsService.setCacheHitRatio(1);
      return cached;
    }
    this.metricsService.setCacheHitRatio(0);

    const sources = await this.sourcesRepository.find({
      where: { debate: { id: debateId }, isActive: true },
      order: { trustScore: 'DESC' },
      relations: ['submittedBy', 'debate'],
    });

    await this.cacheManager.set(cacheKey, sources, 300); // Cache for 5 minutes
    return sources;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private async fetchUrlMetadata(url: string): Promise<{ title?: string; description?: string }> {
    try {
      const response = await axios.get(url, {
        timeout: 5000,
        maxRedirects: 3,
        headers: {
          'User-Agent': 'Debattle Source Validator/1.0',
        },
      });

      const dom = new JSDOM(response.data);
      const document = dom.window.document;

      return {
        title: document.querySelector('title')?.textContent?.trim(),
        description: document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim(),
      };
    } catch (error) {
      throw new HttpException('Failed to fetch URL metadata', HttpStatus.BAD_REQUEST);
    }
  }

  private calculateTrustScore(params: {
    isDomainTrusted: boolean;
    hasTitle: boolean;
    hasDescription: boolean;
    isHttps: boolean;
    analysis: any;
  }): number {
    let score = 0;

    // Domain trust is important
    if (params.isDomainTrusted) score += 0.3;

    // HTTPS is required for security
    if (params.isHttps) score += 0.1;

    // Metadata indicates legitimate content
    if (params.hasTitle) score += 0.05;
    if (params.hasDescription) score += 0.05;

    // AI Analysis factors
    if (params.analysis) {
      // Credibility indicators
      const { credibilityIndicators } = params.analysis;
      if (credibilityIndicators.hasReferences) score += 0.1;
      if (credibilityIndicators.hasDates) score += 0.05;
      if (credibilityIndicators.hasAuthor) score += 0.05;
      if (credibilityIndicators.hasStatistics) score += 0.05;
      score += Math.min(0.1, credibilityIndicators.languageQuality * 0.1);

      // Bias indicators (penalize high bias)
      const { biasIndicators } = params.analysis;
      score -= Math.min(0.1, biasIndicators.emotionalLanguage * 0.2);
      score -= Math.min(0.1, biasIndicators.subjectivity * 0.2);

      // Content quality
      if (params.analysis.readabilityScore >= 8 && params.analysis.readabilityScore <= 14) {
        score += 0.05; // Reward appropriate reading level
      }
    }

    return Math.min(1, Math.max(0, score));
  }

  private async archiveUrl(url: string): Promise<string | undefined> {
    if (!this.archiveApiKey) return undefined;

    try {
      const response = await axios.post(
        'https://web.archive.org/save',
        { url },
        {
          headers: {
            'Authorization': `Bearer ${this.archiveApiKey}`,
          },
        }
      );

      return response.data.archive_url;
    } catch {
      // Archive failure shouldn't fail the whole verification
      return undefined;
    }
  }

  async getSourceStats(): Promise<{
    totalSources: number;
    verifiedSources: number;
    averageTrustScore: number;
  }> {
    const cacheKey = this.getCacheKey('stats');
    const cached = await this.cacheManager.get<{
      totalSources: number;
      verifiedSources: number;
      averageTrustScore: number;
    }>(cacheKey);
    
    if (cached) {
      this.metricsService.setCacheHitRatio(1);
      return cached;
    }
    this.metricsService.setCacheHitRatio(0);

    const [totalSources, verifiedSources, avgScore] = await Promise.all([
      this.sourcesRepository.count({ where: { isActive: true } }),
      this.sourcesRepository.count({ where: { isVerified: true, isActive: true } }),
      this.sourcesRepository
        .createQueryBuilder('source')
        .where('source.isActive = :isActive', { isActive: true })
        .select('AVG(source.trustScore)', 'avg')
        .getRawOne()
        .then(result => result.avg || 0),
    ]);

    const stats = {
      totalSources,
      verifiedSources,
      averageTrustScore: Number(avgScore),
    };

    await this.cacheManager.set(cacheKey, stats, 300); // Cache for 5 minutes
    return stats;
  }
} 
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Analytics } from './entities/analytics.entity';
import { UsersService } from '../users/users.service';
import { DebatesService } from '../debates/debates.service';
import { CommentsService } from '../debates/comments.service';
import { VotesService } from '../debates/votes.service';
import { ReportedContent } from './entities/reported-content.entity';
import { SystemHealth } from './entities/system-health.entity';
import { ModerateContentInput, ModerateAction } from './dto/moderate-content.input';
import { User } from '../users/entities/user.entity';
import { AIService } from '../ai/ai.service';
import * as os from 'os';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(ReportedContent)
    private reportedContentRepository: Repository<ReportedContent>,
    private readonly usersService: UsersService,
    private readonly debatesService: DebatesService,
    private readonly commentsService: CommentsService,
    private readonly votesService: VotesService,
    private readonly aiService: AIService,
  ) {}

  async getReportedContent(): Promise<ReportedContent[]> {
    return this.reportedContentRepository.find({
      relations: ['reportedBy', 'moderatedBy', 'debate', 'comment'],
      order: { createdAt: 'DESC' },
    });
  }

  async moderateContent(input: ModerateContentInput, moderator: User): Promise<ReportedContent> {
    const reportedContent = await this.reportedContentRepository.findOne({
      where: { id: input.contentId },
      relations: ['debate', 'comment'],
    });

    if (!reportedContent) {
      throw new NotFoundException('Reported content not found');
    }

    // Get the content to moderate
    const contentToModerate = reportedContent.type === 'debate' 
      ? reportedContent.debate.description
      : reportedContent.comment.content;

    // Use AI to assess content
    const [moderationResult, factCheckResult, qualityResult] = await Promise.all([
      this.aiService.moderateContent(contentToModerate),
      this.aiService.factCheck(contentToModerate),
      this.aiService.assessArgumentQuality(contentToModerate),
    ]);

    // Automatically determine action based on AI analysis
    let suggestedAction = ModerateAction.PENDING;
    const moderationNote = [];

    // Check content safety
    if (!moderationResult.isSafe) {
      suggestedAction = ModerateAction.REJECT;
      moderationNote.push(`Content flagged as unsafe: ${moderationResult.reasons.join(', ')}`);
    }

    // Check factual accuracy
    if (!factCheckResult.isFactual) {
      if (factCheckResult.confidence > 0.8) {
        suggestedAction = ModerateAction.REJECT;
      }
      moderationNote.push('Factual inaccuracies detected:');
      factCheckResult.corrections?.forEach(({ claim, correction }) => {
        moderationNote.push(`- ${claim}: ${correction}`);
      });
    }

    // Consider argument quality
    if (qualityResult.score < 30) {
      suggestedAction = ModerateAction.REJECT;
      moderationNote.push('Low quality argument:');
      qualityResult.weaknesses.forEach(weakness => {
        moderationNote.push(`- ${weakness}`);
      });
    }

    // Allow manual override
    const finalAction = input.action || suggestedAction;
    reportedContent.status = finalAction;
    reportedContent.moderatedBy = moderator;
    reportedContent.moderatedAt = new Date();
    reportedContent.moderationNote = [
      input.note,
      ...moderationNote,
      `AI Confidence Scores:`,
      `- Content Safety: ${moderationResult.confidence}`,
      `- Factual Accuracy: ${factCheckResult.confidence}`,
      `- Argument Quality: ${qualityResult.score}`,
    ].filter(Boolean).join('\n');

    // Handle the moderation action
    if (finalAction === ModerateAction.REJECT) {
      if (reportedContent.type === 'debate' && reportedContent.debate) {
        await this.debatesService.softDelete(reportedContent.debate.id);
      } else if (reportedContent.type === 'comment' && reportedContent.comment) {
        await this.commentsService.softDelete(reportedContent.comment.id);
      }
    }

    return this.reportedContentRepository.save(reportedContent);
  }

  async getAnalytics(period: string): Promise<Analytics> {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }

    const [
      totalUsers,
      activeUsers,
      newUsers,
      totalDebates,
      activeDebates,
      completedDebates,
      rawCategories,
      rawDebates,
      totalComments,
      totalReplies,
      totalVotes,
      proVotes,
      conVotes,
    ] = await Promise.all([
      this.usersService.countTotal(),
      this.usersService.countActive(startDate),
      this.usersService.countNew(startDate),
      this.debatesService.countTotal(),
      this.debatesService.countActive(),
      this.debatesService.countCompleted(),
      this.debatesService.getTopCategories(),
      this.debatesService.getPopularDebates(),
      this.commentsService.countTotal(),
      this.commentsService.countReplies(),
      this.votesService.countTotal(),
      this.votesService.countPro(),
      this.votesService.countCon(),
    ]);

    // Transform raw categories to CategoryMetric[]
    const totalCategoryCount = rawCategories.reduce((sum, cat) => sum + cat.count, 0);
    const topCategories = rawCategories.map(cat => ({
      name: cat.category,
      count: cat.count,
      percentage: (cat.count / totalCategoryCount) * 100,
    }));

    // Transform raw debates to DebateMetric[]
    const popularDebates = await Promise.all(
      rawDebates.map(async debate => ({
        id: debate.id,
        title: debate.title,
        participantsCount: debate.participantsCount,
        commentsCount: debate.comments?.length || 0,
        votesCount: debate.votes?.length || 0,
      }))
    );

    return {
      period,
      startDate,
      endDate: new Date(),
      users: {
        totalUsers,
        activeUsers,
        newUsers,
      },
      debates: {
        totalDebates,
        activeDebates,
        completedDebates,
        averageParticipants: totalUsers > 0 ? totalDebates / totalUsers : 0,
        topCategories,
        popularDebates,
      },
      comments: {
        totalComments,
        averageCommentsPerDebate: totalDebates > 0 ? totalComments / totalDebates : 0,
        totalReplies,
      },
      votes: {
        totalVotes,
        proVotes,
        conVotes,
        averageVotesPerDebate: totalDebates > 0 ? totalVotes / totalDebates : 0,
      },
    };
  }

  async generateAnalytics(period: string): Promise<Analytics> {
    return this.getAnalytics(period);
  }

  async getSystemHealth(): Promise<SystemHealth> {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const cpuUsage = os.loadavg()[0]; // 1 minute load average

    const services = [
      { name: 'Database', status: 'OK', latency: 0 },
      { name: 'Authentication', status: 'OK', latency: 0 },
      { name: 'File Storage', status: 'OK', latency: 0 },
    ];

    return {
      status: 'healthy',
      uptime,
      databaseStatus: 'connected',
      memoryUsage,
      cpuUsage,
      activeServices: services.map(s => s.name),
      services,
    };
  }

  async getUserAnalytics(userId: string): Promise<Analytics> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return this.getAnalytics('monthly'); // For now, return general monthly analytics
  }
} 
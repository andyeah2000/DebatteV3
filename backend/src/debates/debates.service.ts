import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Debate } from './entities/debate.entity';
import { User } from '../users/entities/user.entity';
import { CreateDebateInput } from './dto/create-debate.input';
import { UpdateDebateInput } from './dto/update-debate.input';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { DebatesInput } from './dto/debates.input';
import { AIService } from '../ai/ai.service';

type TimelineEventType = 'comment' | 'vote' | 'status_change' | 'milestone';

@Injectable()
export class DebatesService {
  constructor(
    @InjectRepository(Debate)
    private readonly debatesRepository: Repository<Debate>,
    private readonly websocketGateway: WebsocketGateway,
    private readonly aiService: AIService,
  ) {}

  private async addTimelineEvent(
    debate: Debate, 
    type: TimelineEventType, 
    userId?: string, 
    content?: string, 
    metadata?: string
  ) {
    const event = {
      id: uuidv4(),
      type,
      timestamp: new Date(),
      userId,
      content,
      metadata,
    };

    debate.timeline = [...(debate.timeline || []), event];
    await this.debatesRepository.save(debate);
    
    this.websocketGateway.server.emit('debateTimelineUpdated', {
      debateId: debate.id,
      event,
    });

    return event;
  }

  private async updateDebatePhase(debate: Debate, newPhase: string): Promise<void> {
    const currentPhaseIndex = debate.phases.findIndex(p => p.name === debate.currentPhase);
    if (currentPhaseIndex === -1) return;

    // End current phase
    debate.phases[currentPhaseIndex].endTime = new Date();
    debate.phases[currentPhaseIndex].isActive = false;

    // Start new phase
    const newPhaseIndex = debate.phases.findIndex(p => p.name === newPhase);
    if (newPhaseIndex === -1) return;

    debate.phases[newPhaseIndex].startTime = new Date();
    debate.phases[newPhaseIndex].isActive = true;
    debate.currentPhase = newPhase;

    await this.addTimelineEvent(
      debate,
      'status_change',
      undefined,
      `Phase changed from ${debate.currentPhase} to ${newPhase}`
    );

    await this.debatesRepository.save(debate);
    
    this.websocketGateway.server.emit('debatePhaseUpdated', {
      debateId: debate.id,
      currentPhase: newPhase,
    });
  }

  async findAll(input: DebatesInput): Promise<Debate[]> {
    const queryBuilder = this.debatesRepository.createQueryBuilder('debate')
      .leftJoinAndSelect('debate.author', 'author')
      .leftJoinAndSelect('debate.comments', 'comments')
      .leftJoinAndSelect('debate.votes', 'votes');

    // Apply search filter
    if (input.search) {
      queryBuilder.andWhere(
        '(LOWER(debate.title) LIKE LOWER(:search) OR LOWER(debate.description) LIKE LOWER(:search))',
        { search: `%${input.search}%` }
      );
    }

    // Apply category filter
    if (input.category) {
      queryBuilder.andWhere('debate.category = :category', { category: input.category });
    }

    // Apply sorting
    switch (input.sortBy) {
      case 'popular':
        queryBuilder.orderBy('debate.viewCount', 'DESC');
        break;
      case 'active':
        queryBuilder.orderBy('debate.participantsCount', 'DESC');
        break;
      case 'recent':
      default:
        queryBuilder.orderBy('debate.createdAt', 'DESC');
        break;
    }

    // Apply pagination
    const skip = (input.page - 1) * input.limit;
    queryBuilder.skip(skip).take(input.limit);

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Debate> {
    const debate = await this.debatesRepository.findOne({
      where: { id },
      relations: ['author', 'comments', 'votes'],
    });

    if (!debate) {
      throw new NotFoundException(`Debate with ID ${id} not found`);
    }

    return debate;
  }

  async create(createDebateInput: CreateDebateInput, author: User): Promise<Debate> {
    // Analyze debate content with AI
    const [moderationResult, biasResult, qualityResult] = await Promise.all([
      this.aiService.moderateContent(createDebateInput.description),
      this.aiService.detectBias(createDebateInput.description),
      this.aiService.assessArgumentQuality(createDebateInput.description),
    ]);

    // Check if content is safe
    if (!moderationResult.isSafe) {
      throw new ForbiddenException(
        `Content flagged as unsafe: ${moderationResult.reasons.join(', ')}`
      );
    }

    // Add AI analysis results to metadata
    const debate = this.debatesRepository.create({
      ...createDebateInput,
      author,
      metadata: {
        aiAnalysis: {
          biasLevel: biasResult.biasLevel,
          argumentQuality: qualityResult.score,
          moderationConfidence: moderationResult.confidence,
        },
        biasTypes: biasResult.biasTypes,
        argumentStrengths: qualityResult.strengths,
        argumentWeaknesses: qualityResult.weaknesses,
        suggestions: [
          ...biasResult.suggestions,
          ...qualityResult.suggestions,
        ],
      },
    });

    const savedDebate = await this.debatesRepository.save(debate);
    this.websocketGateway.server.emit('debateCreated', savedDebate);
    
    return savedDebate;
  }

  async update(id: string, updateDebateInput: UpdateDebateInput, user: User): Promise<Debate> {
    const debate = await this.findOne(id);

    if (debate.author.id !== user.id) {
      throw new ForbiddenException('You can only update your own debates');
    }

    if (updateDebateInput.description) {
      // Re-analyze updated content
      const [moderationResult, biasResult, qualityResult] = await Promise.all([
        this.aiService.moderateContent(updateDebateInput.description),
        this.aiService.detectBias(updateDebateInput.description),
        this.aiService.assessArgumentQuality(updateDebateInput.description),
      ]);

      if (!moderationResult.isSafe) {
        throw new ForbiddenException(
          `Content flagged as unsafe: ${moderationResult.reasons.join(', ')}`
        );
      }
    }

    // Update debate properties
    if (updateDebateInput.title) {
      debate.title = updateDebateInput.title;
    }
    if (updateDebateInput.description) {
      debate.description = updateDebateInput.description;
    }
    if (updateDebateInput.category) {
      debate.category = updateDebateInput.category;
    }
    if (updateDebateInput.phases) {
      debate.phases = updateDebateInput.phases;
    }
    if (updateDebateInput.currentPhase) {
      await this.updateDebatePhase(debate, updateDebateInput.currentPhase);
    }

    const updatedDebate = await this.debatesRepository.save(debate);
    this.websocketGateway.server.emit('debateUpdated', updatedDebate);
    
    return updatedDebate;
  }

  async findFeatured(): Promise<Debate[]> {
    try {
      const debates = await this.debatesRepository.find({
        where: { 
          isFeatured: true,
          isDeleted: false 
        },
        relations: {
          author: true,
          comments: true,
          votes: true
        },
        take: 10,
        order: {
          createdAt: 'DESC'
        }
      });

      return debates;
    } catch (error) {
      console.error('Error in findFeatured:', error);
      throw error;
    }
  }

  async findByCategory(category: string): Promise<Debate[]> {
    return this.debatesRepository.find({
      where: { category },
      relations: ['author', 'comments', 'votes'],
    });
  }

  async remove(id: string, user: User): Promise<boolean> {
    const debate = await this.findOne(id);
    if (debate.author.id !== user.id) {
      throw new ForbiddenException('You can only remove your own debates');
    }
    await this.debatesRepository.softDelete(id);
    return true;
  }

  async generateSummary(id: string): Promise<any> {
    const debate = await this.findOne(id);
    
    // Transform debate data into DebateSummaryInput format
    const summaryInput = {
      title: debate.title,
      description: debate.description,
      proArguments: debate.comments
        .filter(comment => comment.isProArgument)
        .map(comment => comment.content),
      conArguments: debate.comments
        .filter(comment => !comment.isProArgument)
        .map(comment => comment.content)
    };

    return this.aiService.generateDebateSummary(summaryInput);
  }

  async incrementViewCount(id: string): Promise<Debate> {
    const debate = await this.findOne(id);
    debate.viewCount += 1;
    return this.debatesRepository.save(debate);
  }

  async updateParticipantsCount(id: string): Promise<void> {
    const debate = await this.findOne(id);
    const participantsCount = await this.debatesRepository
      .createQueryBuilder('debate')
      .leftJoin('debate.votes', 'vote')
      .where('debate.id = :id', { id })
      .select('COUNT(DISTINCT vote.userId)', 'count')
      .getRawOne();
    
    debate.participantsCount = parseInt(participantsCount.count) || 0;
    await this.debatesRepository.save(debate);
  }

  async softDelete(id: string): Promise<void> {
    await this.debatesRepository.softDelete(id);
  }

  async countTotal(): Promise<number> {
    return this.debatesRepository.count();
  }

  async countActive(): Promise<number> {
    return this.debatesRepository.count({
      where: { isEnded: false },
    });
  }

  async countCompleted(): Promise<number> {
    return this.debatesRepository.count({
      where: { isEnded: true },
    });
  }

  async getTopCategories(): Promise<{ category: string; count: number }[]> {
    return this.debatesRepository
      .createQueryBuilder('debate')
      .select('debate.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('debate.category')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getPopularDebates(): Promise<Debate[]> {
    return this.debatesRepository.find({
      order: { viewCount: 'DESC' },
      take: 5,
      relations: ['author'],
    });
  }

  async save(debate: Debate): Promise<Debate> {
    return this.debatesRepository.save(debate);
  }
}
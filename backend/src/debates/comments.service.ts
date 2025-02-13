import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { Debate } from './entities/debate.entity';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { AIService } from '../ai/ai.service';
import { Not, IsNull } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly websocketGateway: WebsocketGateway,
    private readonly aiService: AIService,
  ) {}

  async create(createCommentInput: CreateCommentInput, author: User, debate: Debate): Promise<Comment> {
    let aiAnalysis = {
      factualAccuracy: 0,
      argumentQuality: 0,
      moderationConfidence: 0,
    };
    let factCheck = {
      isFactual: true,
      corrections: [],
      suggestedSources: createCommentInput.sources || [],
    };
    let qualityResult = {
      score: 0,
      structure: {
        hasThesis: false,
        hasLogicalFlow: false,
        hasEvidence: false,
        counterArgumentsAddressed: false,
      },
    };

    try {
      // Only perform AI analysis if AIService is properly configured
      if (this.aiService && process.env.OPENAI_API_KEY) {
        const [moderationResult, factCheckResult, qualityAnalysis] = await Promise.all([
          this.aiService.moderateContent(createCommentInput.content),
          this.aiService.factCheck(createCommentInput.content),
          this.aiService.assessArgumentQuality(createCommentInput.content),
        ]);

        // Check if content is safe
        if (!moderationResult.isSafe) {
          throw new ForbiddenException(
            `Content flagged as unsafe: ${moderationResult.reasons.join(', ')}`
          );
        }

        aiAnalysis = {
          factualAccuracy: factCheckResult.confidence,
          argumentQuality: qualityAnalysis.score,
          moderationConfidence: moderationResult.confidence,
        };
        factCheck = {
          isFactual: factCheckResult.isFactual,
          corrections: factCheckResult.corrections || [],
          suggestedSources: factCheckResult.suggestedSources || [],
        };
        qualityResult = qualityAnalysis;
      }
    } catch (error) {
      console.warn('AI analysis failed, proceeding without it:', error);
    }

    // Create comment with all fields from input
    const newComment = new Comment();
    newComment.content = createCommentInput.content;
    newComment.isProArgument = createCommentInput.isProArgument;
    newComment.author = author;
    newComment.debate = debate;
    newComment.metadata = {
      aiAnalysis,
      factCheck,
      argumentAnalysis: qualityResult.structure,
    };

    // Handle reply if replyToId is provided
    if (createCommentInput.replyToId) {
      const replyTo = await this.findOne(createCommentInput.replyToId);
      if (replyTo) {
        newComment.replyTo = replyTo;
      }
    }

    const savedComment = await this.commentsRepository.save(newComment);
    
    if (savedComment.debate?.id) {
      this.websocketGateway.server.to(`debate:${savedComment.debate.id}`).emit('commentAdded', savedComment);
    }

    return savedComment;
  }

  async update(id: string, updateCommentInput: UpdateCommentInput, user: User): Promise<Comment> {
    const comment = await this.findOne(id);

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    if (comment.author.id !== user.id) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    // Re-analyze updated content if content is provided
    if (updateCommentInput.content) {
      const [moderationResult, factCheckResult, qualityResult] = await Promise.all([
        this.aiService.moderateContent(updateCommentInput.content),
        this.aiService.factCheck(updateCommentInput.content),
        this.aiService.assessArgumentQuality(updateCommentInput.content),
      ]);

      if (!moderationResult.isSafe) {
        throw new ForbiddenException(
          `Content flagged as unsafe: ${moderationResult.reasons.join(', ')}`
        );
      }

      // Update metadata only if content is changed
      comment.metadata = {
        aiAnalysis: {
          factualAccuracy: factCheckResult.confidence,
          argumentQuality: qualityResult.score,
          moderationConfidence: moderationResult.confidence,
        },
        factCheck: {
          isFactual: factCheckResult.isFactual,
          corrections: factCheckResult.corrections || [],
          suggestedSources: factCheckResult.suggestedSources || [],
        },
        argumentAnalysis: qualityResult.structure,
      };
    }

    // Update allowed fields
    if (updateCommentInput.content) {
      comment.content = updateCommentInput.content;
    }
    if (typeof updateCommentInput.isProArgument !== 'undefined') {
      comment.isProArgument = updateCommentInput.isProArgument;
    }

    const updated = await this.commentsRepository.save(comment);
    
    if (updated.debate?.id) {
      this.websocketGateway.server.to(`debate:${updated.debate.id}`).emit('commentUpdated', updated);
    }

    return updated;
  }

  async findAll(): Promise<Comment[]> {
    return this.commentsRepository.find({
      relations: ['author', 'debate', 'replyTo'],
      where: { isDeleted: false },
    });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['author', 'debate', 'replyTo'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async findByDebate(debateId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { debate: { id: debateId }, isDeleted: false },
      relations: ['author', 'replyTo'],
      order: { createdAt: 'ASC' },
    });
  }

  async remove(id: string, user: User): Promise<boolean> {
    const comment = await this.findOne(id);

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    if (comment.author.id !== user.id) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    comment.isDeleted = true;
    await this.commentsRepository.save(comment);

    if (comment.debate?.id) {
      this.websocketGateway.server.to(`debate:${comment.debate.id}`).emit('commentDeleted', { id });
    }

    return true;
  }

  async findReplies(parentCommentId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { replyTo: { id: parentCommentId }, isDeleted: false },
      relations: ['author', 'debate'],
      order: { createdAt: 'ASC' },
    });
  }

  async verifyComment(id: string): Promise<Comment> {
    const comment = await this.findOne(id);
    
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    comment.isVerified = true;
    return this.commentsRepository.save(comment);
  }

  async countTotal(): Promise<number> {
    return this.commentsRepository.count({ where: { isDeleted: false } });
  }

  async countReplies(): Promise<number> {
    return this.commentsRepository.count({
      where: {
        replyTo: { id: Not(IsNull()) },
        isDeleted: false,
      },
    });
  }

  async upvote(id: string): Promise<Comment> {
    const comment = await this.findOne(id);
    
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    comment.upvotes += 1;
    const updated = await this.commentsRepository.save(comment);

    if (updated.debate?.id) {
      this.websocketGateway.server.to(`debate:${updated.debate.id}`).emit('commentUpdated', updated);
    }

    return updated;
  }

  async downvote(id: string): Promise<Comment> {
    const comment = await this.findOne(id);
    
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    comment.downvotes += 1;
    const updated = await this.commentsRepository.save(comment);

    if (updated.debate?.id) {
      this.websocketGateway.server.to(`debate:${updated.debate.id}`).emit('commentUpdated', updated);
    }

    return updated;
  }

  async softDelete(id: string): Promise<boolean> {
    const comment = await this.findOne(id);
    
    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    comment.isDeleted = true;
    await this.commentsRepository.save(comment);

    if (comment.debate?.id) {
      this.websocketGateway.server.to(`debate:${comment.debate.id}`).emit('commentDeleted', { id });
    }

    return true;
  }
} 
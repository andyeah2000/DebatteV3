import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { User } from '../../users/entities/user.entity';
import { Debate } from '../entities/debate.entity';
import { CreateCommentInput } from '../dto/create-comment.input';
import { AIService } from '../../ai/ai.service';
import { ArgumentTemplateService } from './argument-template.service';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly aiService: AIService,
    private readonly templateService: ArgumentTemplateService,
  ) {}

  async create(createCommentInput: CreateCommentInput, author: User, debate: Debate): Promise<Comment> {
    // If template is specified, validate against template
    if (createCommentInput.templateId) {
      const validationResult = await this.templateService.validateArgument(
        createCommentInput.templateId,
        createCommentInput.content
      );

      if (!validationResult.isValid) {
        throw new BadRequestException(
          `Argument does not meet template requirements: ${validationResult.errors.join(', ')}`
        );
      }
    }

    // Create base comment
    const comment = this.commentsRepository.create({
      content: createCommentInput.content,
      author,
      debate,
      isProArgument: createCommentInput.isProArgument,
      metadata: {
        aiAnalysis: null,
        argumentAnalysis: null,
        factCheck: {
          isFactual: false,
          corrections: [],
          suggestedSources: createCommentInput.sources
        }
      }
    });

    // Handle sections if provided
    if (createCommentInput.sections?.length > 0) {
      const structuredContent = this.processArgumentSections(createCommentInput.sections);
      comment.content = structuredContent;
    }

    // Handle reply
    if (createCommentInput.replyToId) {
      const replyTo = await this.findOne(createCommentInput.replyToId);
      if (!replyTo) {
        throw new NotFoundException('Parent comment not found');
      }
      comment.replyTo = replyTo;
    }

    // Perform AI analysis
    const aiAnalysis = await this.aiService.assessArgumentQuality(comment.content);
    comment.metadata.aiAnalysis = {
      argumentQuality: aiAnalysis.score,
      biasLevel: 0,
      factualAccuracy: 0,
      moderationConfidence: 1
    };
    comment.metadata.argumentAnalysis = aiAnalysis.structure;

    const savedComment = await this.commentsRepository.save(comment);
    return savedComment;
  }

  private processArgumentSections(sections: Array<{ type: string; content: string }>): string {
    return sections
      .map(section => {
        const sectionTitle = section.type.charAt(0).toUpperCase() + section.type.slice(1);
        return `[${sectionTitle}]\n${section.content}\n`;
      })
      .join('\n');
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['author', 'debate', 'replyTo']
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${id} not found`);
    }

    return comment;
  }

  async findByDebate(debateId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { debateId, isDeleted: false },
      relations: ['author', 'replyTo'],
      order: { createdAt: 'ASC' }
    });
  }

  async update(id: string, content: string, author: User): Promise<Comment> {
    const comment = await this.findOne(id);

    if (comment.author.id !== author.id) {
      throw new BadRequestException('You can only edit your own comments');
    }

    comment.content = content;
    comment.isEdited = true;

    // Re-run AI analysis
    const aiAnalysis = await this.aiService.assessArgumentQuality(content);
    comment.metadata.aiAnalysis = {
      argumentQuality: aiAnalysis.score,
      biasLevel: 0,
      factualAccuracy: 0,
      moderationConfidence: 1
    };
    comment.metadata.argumentAnalysis = aiAnalysis.structure;

    return this.commentsRepository.save(comment);
  }

  async remove(id: string, author: User): Promise<boolean> {
    const comment = await this.findOne(id);

    if (comment.author.id !== author.id) {
      throw new BadRequestException('You can only delete your own comments');
    }

    comment.isDeleted = true;
    await this.commentsRepository.save(comment);
    return true;
  }

  async upvote(id: string): Promise<Comment> {
    const comment = await this.findOne(id);
    comment.upvotes += 1;
    return this.commentsRepository.save(comment);
  }

  async downvote(id: string): Promise<Comment> {
    const comment = await this.findOne(id);
    comment.downvotes += 1;
    return this.commentsRepository.save(comment);
  }
} 
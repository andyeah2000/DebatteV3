import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Comment } from '../debates/entities/comment.entity'
import { User } from '../users/entities/user.entity'
import { Debate } from '../debates/entities/debate.entity'
import { CreateCommentInput } from './dto/create-comment.input'
import { UpdateCommentInput } from './dto/update-comment.input'

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async create(createCommentInput: CreateCommentInput, author: User, debate: Debate): Promise<Comment> {
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
    })

    if (createCommentInput.replyToId) {
      const replyTo = await this.findOne(createCommentInput.replyToId)
      if (!replyTo) {
        throw new NotFoundException('Parent comment not found')
      }
      comment.replyTo = replyTo
    }

    const savedComment = await this.commentsRepository.save(comment)
    return savedComment
  }

  async findAll(): Promise<Comment[]> {
    return this.commentsRepository.find({
      relations: ['author', 'debate', 'parentComment'],
      where: { isDeleted: false },
    })
  }

  async findOne(id: string): Promise<Comment> {
    return this.commentsRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['author', 'debate', 'replyTo'],
    })
  }

  async findByDebate(debateId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { debate: { id: debateId }, isDeleted: false },
      relations: ['author', 'replyTo'],
      order: { createdAt: 'DESC' },
    })
  }

  async update(id: string, updateCommentInput: UpdateCommentInput): Promise<Comment> {
    const comment = await this.findOne(id)
    if (!comment) {
      throw new NotFoundException('Comment not found')
    }

    const updatedComment = await this.commentsRepository.save({
      ...comment,
      content: updateCommentInput.content,
      isEdited: true
    })

    return updatedComment
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.commentsRepository.update(id, { isDeleted: true })
    return result.affected > 0
  }

  async upvote(id: string): Promise<Comment> {
    await this.commentsRepository.increment({ id }, 'upvotes', 1)
    return this.findOne(id)
  }

  async downvote(id: string): Promise<Comment> {
    await this.commentsRepository.increment({ id }, 'downvotes', 1)
    return this.findOne(id)
  }

  async findReplies(parentCommentId: string): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { replyTo: { id: parentCommentId }, isDeleted: false },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    })
  }
} 
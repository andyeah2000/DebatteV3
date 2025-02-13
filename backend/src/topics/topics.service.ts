import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic, TrendDirection } from './entities/topic.entity';
import { Debate } from '../debates/entities/debate.entity';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicsRepository: Repository<Topic>,
    @InjectRepository(Debate)
    private readonly debatesRepository: Repository<Debate>
  ) {}

  async findOne(id: string): Promise<Topic> {
    const topic = await this.topicsRepository.findOne({
      where: { id },
      relations: ['debates', 'relatedTopics']
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${id} not found`);
    }

    return topic;
  }

  async findAll(): Promise<Topic[]> {
    return this.topicsRepository.find({
      relations: ['debates']
    });
  }

  async findTrending(): Promise<Topic[]> {
    return this.topicsRepository.find({
      where: [
        { trend: TrendDirection.UP },
        { trend: TrendDirection.DOWN }
      ],
      order: {
        trendScore: 'DESC'
      },
      take: 10,
      relations: ['debates']
    });
  }

  async findDebates(topicId: string): Promise<Debate[]> {
    const topic = await this.topicsRepository.findOne({
      where: { id: topicId },
      relations: ['debates', 'debates.author', 'debates.votes']
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${topicId} not found`);
    }

    return topic.debates;
  }

  async findRelated(topicId: string): Promise<Topic[]> {
    const topic = await this.topicsRepository.findOne({
      where: { id: topicId },
      relations: ['relatedTopics']
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${topicId} not found`);
    }

    return topic.relatedTopics;
  }

  async updateTrendScores(): Promise<void> {
    const topics = await this.topicsRepository.find({
      relations: ['debates']
    });

    for (const topic of topics) {
      // Calculate trend score based on debate activity
      const recentDebates = topic.debates.filter(debate => {
        const debateDate = new Date(debate.createdAt);
        const now = new Date();
        const daysDiff = (now.getTime() - debateDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7; // Consider debates from last 7 days
      });

      const trendScore = recentDebates.reduce((score, debate) => {
        return score + (debate.participantsCount * 0.5 + debate.viewCount * 0.1);
      }, 0);

      // Update trend direction
      const previousScore = topic.trendScore;
      const scoreDiff = trendScore - previousScore;
      
      let trend = TrendDirection.NEUTRAL;
      if (scoreDiff > 5) {
        trend = TrendDirection.UP;
      } else if (scoreDiff < -5) {
        trend = TrendDirection.DOWN;
      }

      // Update topic
      await this.topicsRepository.update(topic.id, {
        trendScore,
        trend,
        debateCount: topic.debates.length
      });
    }
  }
} 
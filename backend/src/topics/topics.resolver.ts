import { Args, Query, Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { TopicsService } from './topics.service';
import { Topic } from './entities/topic.entity';
import { Debate } from '../debates/entities/debate.entity';
import { UseGuards } from '@nestjs/common';
import { GqlThrottlerGuard } from '../common/guards/gql-throttler.guard';

@Resolver(() => Topic)
@UseGuards(GqlThrottlerGuard)
export class TopicsResolver {
  constructor(private readonly topicsService: TopicsService) {}

  @Query(() => Topic, { name: 'topic' })
  async getTopic(@Args('id') id: string): Promise<Topic> {
    return this.topicsService.findOne(id);
  }

  @Query(() => [Topic], { name: 'topics' })
  async getTopics(): Promise<Topic[]> {
    return this.topicsService.findAll();
  }

  @Query(() => [Topic], { name: 'trendingTopics' })
  async getTrendingTopics(): Promise<Topic[]> {
    return this.topicsService.findTrending();
  }

  @ResolveField('debates', () => [Debate])
  async getDebates(@Parent() topic: Topic): Promise<Debate[]> {
    return this.topicsService.findDebates(topic.id);
  }

  @ResolveField('relatedTopics', () => [Topic])
  async getRelatedTopics(@Parent() topic: Topic): Promise<Topic[]> {
    return this.topicsService.findRelated(topic.id);
  }
} 
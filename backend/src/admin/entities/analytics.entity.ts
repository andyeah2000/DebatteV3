import { ObjectType, Field } from '@nestjs/graphql'

@ObjectType()
class UserMetrics {
  @Field()
  totalUsers: number

  @Field()
  activeUsers: number

  @Field()
  newUsers: number
}

@ObjectType()
class DebateMetrics {
  @Field()
  totalDebates: number

  @Field()
  activeDebates: number

  @Field()
  completedDebates: number

  @Field()
  averageParticipants: number

  @Field(() => [CategoryMetric])
  topCategories: CategoryMetric[]

  @Field(() => [DebateMetric])
  popularDebates: DebateMetric[]
}

@ObjectType()
class CommentMetrics {
  @Field()
  totalComments: number

  @Field()
  averageCommentsPerDebate: number

  @Field()
  totalReplies: number
}

@ObjectType()
class VoteMetrics {
  @Field()
  totalVotes: number

  @Field()
  proVotes: number

  @Field()
  conVotes: number

  @Field()
  averageVotesPerDebate: number
}

@ObjectType()
class CategoryMetric {
  @Field()
  name: string

  @Field()
  count: number

  @Field()
  percentage: number
}

@ObjectType()
class DebateMetric {
  @Field()
  id: string

  @Field()
  title: string

  @Field()
  participantsCount: number

  @Field()
  commentsCount: number

  @Field()
  votesCount: number
}

@ObjectType()
export class Analytics {
  @Field()
  period: string

  @Field()
  startDate: Date

  @Field()
  endDate: Date

  @Field(() => UserMetrics)
  users: UserMetrics

  @Field(() => DebateMetrics)
  debates: DebateMetrics

  @Field(() => CommentMetrics)
  comments: CommentMetrics

  @Field(() => VoteMetrics)
  votes: VoteMetrics
} 
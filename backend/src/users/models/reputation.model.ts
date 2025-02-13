import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { Badge } from '../entities/badge.entity';

@ObjectType()
export class LeaderboardEntry {
  @Field(() => User)
  user: User;

  @Field(() => Int)
  rank: number;

  @Field(() => Int)
  score: number;
}

@ObjectType()
export class CategoryLeaderboard {
  @Field()
  category: string;

  @Field(() => [LeaderboardEntry])
  entries: LeaderboardEntry[];
}

@ObjectType()
export class UserBadgesResponse {
  @Field(() => User)
  user: User;

  @Field(() => [Badge])
  badges: Badge[];

  @Field(() => [Badge])
  availableBadges: Badge[];

  @Field(() => Int)
  totalBadges: number;

  @Field(() => Int)
  specialBadges: number;
}

@ObjectType()
export class ReputationUpdateResponse {
  @Field(() => User)
  user: User;

  @Field(() => Int)
  pointsEarned: number;

  @Field(() => Int)
  newTotal: number;

  @Field(() => [Badge], { nullable: true })
  newBadges?: Badge[];
} 
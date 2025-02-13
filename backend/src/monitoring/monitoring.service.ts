import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Gauge, Histogram } from 'prom-client';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectMetric('debattle_debate_created_total')
    private debateCreatedCounter: Counter<string>,
    @InjectMetric('debattle_debate_votes_total')
    private debateVotesCounter: Counter<string>,
    @InjectMetric('debattle_active_users_total')
    private activeUsersGauge: Gauge<string>,
    @InjectMetric('debattle_request_duration_seconds')
    private requestDurationHistogram: Histogram<string>,
  ) {}

  incrementDebateCreated(category: string) {
    this.debateCreatedCounter.inc({ category });
  }

  incrementDebateVotes(debateId: string, voteType: 'pro' | 'con') {
    this.debateVotesCounter.inc({ debate_id: debateId, vote_type: voteType });
  }

  setActiveUsers(count: number) {
    this.activeUsersGauge.set(count);
  }

  observeRequestDuration(duration: number, path: string, method: string, statusCode: number) {
    this.requestDurationHistogram.observe(
      { path, method, status_code: statusCode.toString() },
      duration,
    );
  }

  // Custom metrics for debate engagement
  private readonly debateMetrics = {
    created: new Counter({
      name: 'debattle_debate_created_total',
      help: 'Total number of debates created',
      labelNames: ['category'],
    }),
    votes: new Counter({
      name: 'debattle_debate_votes_total',
      help: 'Total number of votes cast in debates',
      labelNames: ['debate_id', 'vote_type'],
    }),
    activeUsers: new Gauge({
      name: 'debattle_active_users_total',
      help: 'Current number of active users',
    }),
    requestDuration: new Histogram({
      name: 'debattle_request_duration_seconds',
      help: 'Duration of HTTP requests',
      labelNames: ['path', 'method', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5],
    }),
  };
} 
import { Injectable } from '@nestjs/common';
import { Registry, Counter, Gauge, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: Registry;
  
  // Counters
  private readonly httpRequestsTotal: Counter;
  private readonly websocketConnectionsTotal: Counter;
  private readonly reputationPointsAwarded: Counter;
  private readonly badgesAwarded: Counter;
  
  // Gauges
  private readonly activeWebsocketConnections: Gauge;
  private readonly activeDatabaseConnections: Gauge;
  private readonly cacheHitRatio: Gauge;
  
  // Histograms
  private readonly httpRequestDuration: Histogram;
  private readonly databaseQueryDuration: Histogram;

  constructor() {
    this.registry = new Registry();
    
    // Initialize counters
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.registry],
    });

    this.websocketConnectionsTotal = new Counter({
      name: 'websocket_connections_total',
      help: 'Total number of WebSocket connections',
      registers: [this.registry],
    });

    this.reputationPointsAwarded = new Counter({
      name: 'reputation_points_awarded_total',
      help: 'Total number of reputation points awarded',
      labelNames: ['action'],
      registers: [this.registry],
    });

    this.badgesAwarded = new Counter({
      name: 'badges_awarded_total',
      help: 'Total number of badges awarded',
      labelNames: ['category'],
      registers: [this.registry],
    });

    // Initialize gauges
    this.activeWebsocketConnections = new Gauge({
      name: 'active_websocket_connections',
      help: 'Number of active WebSocket connections',
      registers: [this.registry],
    });

    this.activeDatabaseConnections = new Gauge({
      name: 'active_database_connections',
      help: 'Number of active database connections',
      registers: [this.registry],
    });

    this.cacheHitRatio = new Gauge({
      name: 'cache_hit_ratio',
      help: 'Cache hit ratio',
      registers: [this.registry],
    });

    // Initialize histograms
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'path'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
      registers: [this.registry],
    });

    this.databaseQueryDuration = new Histogram({
      name: 'database_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['query_type'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });
  }

  // Counter methods
  incrementHttpRequests(method: string, path: string, status: number): void {
    this.httpRequestsTotal.inc({ method, path, status: status.toString() });
  }

  incrementWebsocketConnections(): void {
    this.websocketConnectionsTotal.inc();
  }

  incrementReputationPoints(action: string, points: number): void {
    this.reputationPointsAwarded.inc({ action }, points);
  }

  incrementBadgesAwarded(category: string): void {
    this.badgesAwarded.inc({ category });
  }

  // Gauge methods
  setActiveWebsocketConnections(count: number): void {
    this.activeWebsocketConnections.set(count);
  }

  setActiveDatabaseConnections(count: number): void {
    this.activeDatabaseConnections.set(count);
  }

  setCacheHitRatio(ratio: number): void {
    this.cacheHitRatio.set(ratio);
  }

  // Histogram methods
  observeHttpRequestDuration(method: string, path: string, duration: number): void {
    this.httpRequestDuration.observe({ method, path }, duration);
  }

  observeDatabaseQueryDuration(queryType: string, duration: number): void {
    this.databaseQueryDuration.observe({ query_type: queryType }, duration);
  }

  // Get metrics
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
} 
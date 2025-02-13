import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { WebsocketGateway } from '../../websocket/websocket.gateway';

@Injectable()
export class WebSocketHealthIndicator extends HealthIndicator {
  constructor(
    private readonly websocketGateway: WebsocketGateway
  ) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const server = this.websocketGateway.server;
      const engineStatus = server.engine.clientsCount !== undefined;
      const connectedClients = server.engine.clientsCount || 0;

      return this.getStatus(key, engineStatus, {
        connectedClients,
      });
    } catch (error) {
      throw new HealthCheckError(
        'WebSocket health check failed',
        this.getStatus(key, false, {
          error: error.message,
        })
      );
    }
  }
} 
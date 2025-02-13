import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { Vote } from '../debates/entities/vote.entity';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, Socket> = new Map();

  async handleConnection(client: Socket) {
    try {
      const user = client.handshake.auth.user as User;
      if (user?.id) {
        this.connectedUsers.set(user.id, client);
        this.server.emit('userOnline', { userId: user.id });
      }
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.findUserIdBySocket(client);
    if (userId) {
      this.connectedUsers.delete(userId);
      this.server.emit('userOffline', { userId });
    }
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('joinDebate')
  handleJoinDebate(
    @ConnectedSocket() client: Socket,
    @MessageBody() debateId: string,
  ) {
    client.join(`debate:${debateId}`);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('leaveDebate')
  handleLeaveDebate(
    @ConnectedSocket() client: Socket,
    @MessageBody() debateId: string,
  ) {
    client.leave(`debate:${debateId}`);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('newComment')
  handleNewComment(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    this.server.to(`debate:${data.debateId}`).emit('commentAdded', data);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('newVote')
  handleNewVote(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    this.server.to(`debate:${data.debateId}`).emit('voteAdded', data);
  }

  emitNewVote(vote: Vote) {
    this.server.to(`debate:${vote.debate.id}`).emit('voteAdded', {
      id: vote.id,
      isProVote: vote.isProVote,
      userId: vote.user.id,
      debateId: vote.debate.id,
      createdAt: vote.createdAt,
    });
  }

  private findUserIdBySocket(client: Socket): string | undefined {
    for (const [userId, socket] of this.connectedUsers.entries()) {
      if (socket === client) {
        return userId;
      }
    }
    return undefined;
  }
} 
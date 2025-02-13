import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { User } from '../users/entities/user.entity';
import { CreateVoteInput } from './dto/create-vote.input';
import { DebatesService } from './debates.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { VoteStatistics } from '../common/types/vote-statistics.type';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private readonly votesRepository: Repository<Vote>,
    private readonly debatesService: DebatesService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async findAll(): Promise<Vote[]> {
    return this.votesRepository.find({
      relations: ['user', 'debate'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Vote> {
    const vote = await this.votesRepository.findOne({
      where: { id },
      relations: ['user', 'debate'],
    });

    if (!vote) {
      throw new NotFoundException(`Vote with ID ${id} not found`);
    }

    return vote;
  }

  async create(createVoteInput: CreateVoteInput, user: User): Promise<Vote> {
    const debate = await this.debatesService.findOne(createVoteInput.debateId);

    // Check if user has already voted
    const existingVote = await this.votesRepository.findOne({
      where: {
        debate: { id: createVoteInput.debateId },
        user: { id: user.id },
        isDeleted: false,
      },
    });

    if (existingVote) {
      throw new ConflictException('User has already voted on this debate');
    }

    const vote = this.votesRepository.create({
      ...createVoteInput,
      user,
      debate,
    });

    const savedVote = await this.votesRepository.save(vote);

    // Update debate vote counts
    if (vote.isProVote) {
      debate.proVotes += 1;
    } else {
      debate.conVotes += 1;
    }
    await this.debatesService.save(debate);

    // Emit websocket event
    this.websocketGateway.emitNewVote(savedVote);

    return savedVote;
  }

  async findByDebate(debateId: string): Promise<Vote[]> {
    return this.votesRepository.find({
      where: { debate: { id: debateId }, isDeleted: false },
      relations: ['user'],
    });
  }

  async findByUser(userId: string): Promise<Vote[]> {
    return this.votesRepository.find({
      where: { user: { id: userId }, isDeleted: false },
      relations: ['debate'],
    });
  }

  async hasUserVoted(debateId: string, userId: string): Promise<boolean> {
    const vote = await this.votesRepository.findOne({
      where: {
        debate: { id: debateId },
        user: { id: userId },
      },
    });

    return !!vote;
  }

  async getVoteStatistics(debateId: string): Promise<VoteStatistics> {
    const debate = await this.debatesService.findOne(debateId);
    if (!debate) {
      throw new NotFoundException(`Debate with ID ${debateId} not found`);
    }

    const totalVotes = debate.proVotes + debate.conVotes;

    return {
      totalVotes,
      proVotes: debate.proVotes,
      conVotes: debate.conVotes,
      proPercentage: totalVotes > 0 ? (debate.proVotes / totalVotes) * 100 : 0,
      conPercentage: totalVotes > 0 ? (debate.conVotes / totalVotes) * 100 : 0,
    };
  }

  async countTotal(): Promise<number> {
    return this.votesRepository.count({
      where: { isDeleted: false },
    });
  }

  async countPro(): Promise<number> {
    return this.votesRepository.count({
      where: {
        isProVote: true,
        isDeleted: false,
      },
    });
  }

  async countCon(): Promise<number> {
    return this.votesRepository.count({
      where: {
        isProVote: false,
        isDeleted: false,
      },
    });
  }
} 
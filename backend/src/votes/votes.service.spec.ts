import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VotesService } from '../debates/votes.service';
import { Vote } from '../debates/entities/vote.entity';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { DebatesService } from '../debates/debates.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('VotesService', () => {
  let service: VotesService;
  let repository: Repository<Vote>;
  let websocketGateway: WebsocketGateway;
  let debatesService: DebatesService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  };

  const mockWebsocketGateway = {
    server: {
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
    },
  };

  const mockDebatesService = {
    findOne: jest.fn(),
    updateParticipantsCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VotesService,
        {
          provide: getRepositoryToken(Vote),
          useValue: mockRepository,
        },
        {
          provide: WebsocketGateway,
          useValue: mockWebsocketGateway,
        },
        {
          provide: DebatesService,
          useValue: mockDebatesService,
        },
      ],
    }).compile();

    service = module.get<VotesService>(VotesService);
    repository = module.get<Repository<Vote>>(getRepositoryToken(Vote));
    websocketGateway = module.get<WebsocketGateway>(WebsocketGateway);
    debatesService = module.get<DebatesService>(DebatesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all votes', async () => {
      const result = [
        { id: '1', isProVote: true },
        { id: '2', isProVote: false },
      ];

      mockRepository.find.mockResolvedValueOnce(result);

      const votes = await service.findAll();

      expect(votes).toEqual(result);
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'debate'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a vote by id', async () => {
      const result = { id: '1', isProVote: true };

      mockRepository.findOne.mockResolvedValueOnce(result);

      const vote = await service.findOne('1');

      expect(vote).toEqual(result);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['user', 'debate'],
      });
    });

    it('should throw NotFoundException if vote not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new vote', async () => {
      const createVoteInput = {
        debateId: '1',
        isProVote: true,
      };
      const user = { id: '1', username: 'testuser' };
      const debate = { id: '1', title: 'Test Debate', proVotes: 0, conVotes: 0 };
      const result = { ...createVoteInput, id: '1', user, debate };

      mockRepository.findOne.mockResolvedValueOnce(null);
      mockDebatesService.findOne.mockResolvedValueOnce(debate);
      mockRepository.create.mockReturnValueOnce(result);
      mockRepository.save.mockResolvedValueOnce(result);

      const vote = await service.create(createVoteInput, user as any);

      expect(vote).toEqual(result);
      expect(mockWebsocketGateway.server.to).toHaveBeenCalledWith(`debate:${createVoteInput.debateId}`);
      expect(mockWebsocketGateway.server.emit).toHaveBeenCalledWith('voteAdded', {
        ...result,
        proVotes: 1,
        conVotes: 0,
      });
      expect(mockDebatesService.updateParticipantsCount).toHaveBeenCalledWith(createVoteInput.debateId);
    });

    it('should throw ConflictException if user has already voted', async () => {
      const createVoteInput = {
        debateId: '1',
        isProVote: true,
      };
      const user = { id: '1', username: 'testuser' };
      
      mockRepository.findOne.mockResolvedValueOnce({ id: '1' });

      await expect(service.create(createVoteInput, user as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByDebate', () => {
    it('should return all votes for a debate', async () => {
      const debateId = '1';
      const result = [
        { id: '1', isProVote: true },
        { id: '2', isProVote: false },
      ];

      mockRepository.find.mockResolvedValueOnce(result);

      const votes = await service.findByDebate(debateId);

      expect(votes).toEqual(result);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { debate: { id: debateId } },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findByUser', () => {
    it('should return all votes for a user', async () => {
      const userId = '1';
      const result = [
        { id: '1', isProVote: true },
        { id: '2', isProVote: false },
      ];

      mockRepository.find.mockResolvedValueOnce(result);

      const votes = await service.findByUser(userId);

      expect(votes).toEqual(result);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['debate'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('hasUserVoted', () => {
    it('should return true if user has voted', async () => {
      const debateId = '1';
      const userId = '1';

      mockRepository.findOne.mockResolvedValueOnce({ id: '1' });

      const result = await service.hasUserVoted(debateId, userId);

      expect(result).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { debate: { id: debateId }, user: { id: userId } },
      });
    });

    it('should return false if user has not voted', async () => {
      const debateId = '1';
      const userId = '1';

      mockRepository.findOne.mockResolvedValueOnce(null);

      const result = await service.hasUserVoted(debateId, userId);

      expect(result).toBe(false);
    });
  });

  describe('getVoteStatistics', () => {
    it('should return vote statistics', async () => {
      const debateId = '1';
      const debate = {
        id: '1',
        proVotes: 6,
        conVotes: 4,
      };

      mockDebatesService.findOne.mockResolvedValueOnce(debate);

      const result = await service.getVoteStatistics(debateId);

      expect(result).toEqual({
        proVotes: 6,
        conVotes: 4,
        totalVotes: 10,
        proPercentage: 60,
        conPercentage: 40,
      });
      expect(mockDebatesService.findOne).toHaveBeenCalledWith(debateId);
    });
  });

  describe('countTotal', () => {
    it('should return total votes count', async () => {
      const count = 10;

      mockRepository.count.mockResolvedValueOnce(count);

      const result = await service.countTotal();

      expect(result).toBe(count);
      expect(mockRepository.count).toHaveBeenCalled();
    });
  });

  describe('countPro', () => {
    it('should return pro votes count', async () => {
      const count = 6;

      mockRepository.count.mockResolvedValueOnce(count);

      const result = await service.countPro();

      expect(result).toBe(count);
      expect(mockRepository.count).toHaveBeenCalledWith({
        where: {
          isProVote: true,
          isDeleted: false,
        },
      });
    });
  });

  describe('countCon', () => {
    it('should return con votes count', async () => {
      const count = 4;

      mockRepository.count.mockResolvedValueOnce(count);

      const result = await service.countCon();

      expect(result).toBe(count);
      expect(mockRepository.count).toHaveBeenCalledWith({
        where: {
          isProVote: false,
          isDeleted: false,
        },
      });
    });
  });
}); 
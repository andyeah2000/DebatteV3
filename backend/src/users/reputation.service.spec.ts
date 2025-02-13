import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReputationService, ReputationAction } from './reputation.service';
import { User } from './entities/user.entity';
import { Badge } from './entities/badge.entity';
import { WebsocketGateway } from '../websocket/websocket.gateway';

describe('ReputationService', () => {
  let service: ReputationService;
  let userRepository: Repository<User>;
  let badgeRepository: Repository<Badge>;
  let websocketGateway: WebsocketGateway;

  const mockUser = {
    id: '1',
    reputationScore: 0,
    debateScore: 0,
    commentScore: 0,
    sourceScore: 0,
    badges: [],
  };

  const mockBadge = {
    id: '1',
    name: 'Test Badge',
    description: 'Test Description',
    icon: '🏆',
    category: 'test',
    requiredScore: 10,
    isSpecial: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReputationService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
            createQueryBuilder: jest.fn(() => ({
              orderBy: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockUser]),
            })),
          },
        },
        {
          provide: getRepositoryToken(Badge),
          useValue: {
            find: jest.fn().mockResolvedValue([mockBadge]),
            findOne: jest.fn().mockResolvedValue(mockBadge),
          },
        },
        {
          provide: WebsocketGateway,
          useValue: {
            server: {
              to: jest.fn().mockReturnValue({
                emit: jest.fn(),
              }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ReputationService>(ReputationService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    badgeRepository = module.get<Repository<Badge>>(getRepositoryToken(Badge));
    websocketGateway = module.get<WebsocketGateway>(WebsocketGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateReputation', () => {
    it('should update user reputation and return result', async () => {
      const result = await service.updateReputation(
        '1',
        ReputationAction.CREATE_DEBATE,
      );

      expect(result).toEqual({
        user: mockUser,
        pointsEarned: 5,
        newBadges: [],
      });
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        service.updateReputation('1', ReputationAction.CREATE_DEBATE),
      ).rejects.toThrow('User not found');
    });

    it('should emit websocket event on reputation update', async () => {
      await service.updateReputation('1', ReputationAction.CREATE_DEBATE);

      expect(websocketGateway.server.to).toHaveBeenCalledWith('user:1');
      expect(websocketGateway.server.to('user:1').emit).toHaveBeenCalledWith(
        'reputationUpdated',
        expect.any(Object),
      );
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard for overall category', async () => {
      const result = await service.getLeaderboard();
      expect(result).toEqual([mockUser]);
    });

    it('should return leaderboard for specific category', async () => {
      const result = await service.getLeaderboard('debate');
      expect(result).toEqual([mockUser]);
    });
  });

  describe('awardSpecialBadge', () => {
    it('should award special badge to user', async () => {
      const result = await service.awardSpecialBadge('1', '1');
      expect(result).toEqual(mockUser);
    });

    it('should throw error if badge not found', async () => {
      jest.spyOn(badgeRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.awardSpecialBadge('1', '1')).rejects.toThrow(
        'User or badge not found',
      );
    });

    it('should emit websocket event on badge award', async () => {
      await service.awardSpecialBadge('1', '1');

      expect(websocketGateway.server.to).toHaveBeenCalledWith('user:1');
      expect(websocketGateway.server.to('user:1').emit).toHaveBeenCalledWith(
        'specialBadgeAwarded',
        expect.any(Object),
      );
    });
  });
}); 
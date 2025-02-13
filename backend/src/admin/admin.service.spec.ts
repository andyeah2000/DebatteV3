import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportedContent } from './entities/reported-content.entity';
import { UsersService } from '../users/users.service';
import { DebatesService } from '../debates/debates.service';
import { CommentsService } from '../debates/comments.service';
import { VotesService } from '../debates/votes.service';
import { ModerateAction } from './dto/moderate-content.input';

describe('AdminService', () => {
  let service: AdminService;
  let usersService: UsersService;
  let debatesService: DebatesService;
  let commentsService: CommentsService;
  let votesService: VotesService;

  const mockReportedContentRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUsersService = {
    countTotal: jest.fn(),
    countActive: jest.fn(),
    countNew: jest.fn(),
    findOne: jest.fn(),
  };

  const mockDebatesService = {
    countTotal: jest.fn(),
    countActive: jest.fn(),
    countCompleted: jest.fn(),
    getTopCategories: jest.fn(),
    getPopularDebates: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockCommentsService = {
    countTotal: jest.fn(),
    countReplies: jest.fn(),
    softDelete: jest.fn(),
  };

  const mockVotesService = {
    countTotal: jest.fn(),
    countPro: jest.fn(),
    countCon: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(ReportedContent),
          useValue: mockReportedContentRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: DebatesService,
          useValue: mockDebatesService,
        },
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
        {
          provide: VotesService,
          useValue: mockVotesService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    usersService = module.get<UsersService>(UsersService);
    debatesService = module.get<DebatesService>(DebatesService);
    commentsService = module.get<CommentsService>(CommentsService);
    votesService = module.get<VotesService>(VotesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getReportedContent', () => {
    it('should return all reported content', async () => {
      const reportedContent = [
        { id: '1', type: 'debate' },
        { id: '2', type: 'comment' },
      ];

      mockReportedContentRepository.find.mockResolvedValueOnce(reportedContent);

      const result = await service.getReportedContent();

      expect(result).toEqual(reportedContent);
      expect(mockReportedContentRepository.find).toHaveBeenCalledWith({
        relations: ['reportedBy', 'moderatedBy', 'debate', 'comment'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('moderateContent', () => {
    it('should moderate debate content', async () => {
      const input = {
        contentId: '1',
        action: ModerateAction.REJECT,
        note: 'Inappropriate content',
      };
      const moderator = { id: '1', username: 'admin' };
      const reportedContent = {
        id: '1',
        type: 'debate',
        debate: { id: '1' },
      };

      mockReportedContentRepository.findOne.mockResolvedValueOnce(reportedContent);
      mockReportedContentRepository.save.mockResolvedValueOnce({
        ...reportedContent,
        status: input.action,
        moderatedBy: moderator,
        moderationNote: input.note,
      });

      const result = await service.moderateContent(input, moderator as any);

      expect(result.status).toBe(input.action);
      expect(result.moderatedBy).toEqual(moderator);
      expect(result.moderationNote).toBe(input.note);
      expect(mockDebatesService.softDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics for daily period', async () => {
      const mockData = {
        totalUsers: 100,
        activeUsers: 50,
        newUsers: 10,
        totalDebates: 200,
        activeDebates: 100,
        completedDebates: 50,
        topCategories: [{ category: 'Politics', count: 50 }],
        popularDebates: [{ id: '1', title: 'Debate 1', participantsCount: 10 }],
        totalComments: 300,
        totalReplies: 150,
        totalVotes: 400,
        proVotes: 250,
        conVotes: 150,
      };

      mockUsersService.countTotal.mockResolvedValueOnce(mockData.totalUsers);
      mockUsersService.countActive.mockResolvedValueOnce(mockData.activeUsers);
      mockUsersService.countNew.mockResolvedValueOnce(mockData.newUsers);
      mockDebatesService.countTotal.mockResolvedValueOnce(mockData.totalDebates);
      mockDebatesService.countActive.mockResolvedValueOnce(mockData.activeDebates);
      mockDebatesService.countCompleted.mockResolvedValueOnce(mockData.completedDebates);
      mockDebatesService.getTopCategories.mockResolvedValueOnce(mockData.topCategories);
      mockDebatesService.getPopularDebates.mockResolvedValueOnce(mockData.popularDebates);
      mockCommentsService.countTotal.mockResolvedValueOnce(mockData.totalComments);
      mockCommentsService.countReplies.mockResolvedValueOnce(mockData.totalReplies);
      mockVotesService.countTotal.mockResolvedValueOnce(mockData.totalVotes);
      mockVotesService.countPro.mockResolvedValueOnce(mockData.proVotes);
      mockVotesService.countCon.mockResolvedValueOnce(mockData.conVotes);

      const result = await service.getAnalytics('daily');

      expect(result).toMatchObject({
        period: 'daily',
        users: {
          totalUsers: mockData.totalUsers,
          activeUsers: mockData.activeUsers,
          newUsers: mockData.newUsers,
        },
        debates: {
          totalDebates: mockData.totalDebates,
          activeDebates: mockData.activeDebates,
          completedDebates: mockData.completedDebates,
        },
        comments: {
          totalComments: mockData.totalComments,
          totalReplies: mockData.totalReplies,
        },
        votes: {
          totalVotes: mockData.totalVotes,
          proVotes: mockData.proVotes,
          conVotes: mockData.conVotes,
        },
      });
    });
  });

  describe('getSystemHealth', () => {
    it('should return system health information', async () => {
      const result = await service.getSystemHealth();

      expect(result).toMatchObject({
        status: 'healthy',
        databaseStatus: 'connected',
        services: expect.arrayContaining([
          expect.objectContaining({ name: 'Database', status: 'OK' }),
          expect.objectContaining({ name: 'Authentication', status: 'OK' }),
          expect.objectContaining({ name: 'File Storage', status: 'OK' }),
        ]),
      });
    });
  });

  describe('getUserAnalytics', () => {
    it('should return user analytics', async () => {
      const userId = '1';
      const user = { id: userId, username: 'testuser' };
      const analytics = {
        period: 'monthly',
        users: { totalUsers: 100 },
      };

      mockUsersService.findOne.mockResolvedValueOnce(user);
      jest.spyOn(service, 'getAnalytics').mockResolvedValueOnce(analytics as any);

      const result = await service.getUserAnalytics(userId);

      expect(result).toEqual(analytics);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
    });
  });
}); 
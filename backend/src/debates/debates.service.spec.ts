import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DebatesService } from './debates.service';
import { Debate } from './entities/debate.entity';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { SortBy } from './dto/debates.input';

describe('DebatesService', () => {
  let service: DebatesService;
  let repository: Repository<Debate>;
  let websocketGateway: WebsocketGateway;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockWebsocketGateway = {
    server: {
      emit: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DebatesService,
        {
          provide: getRepositoryToken(Debate),
          useValue: mockRepository,
        },
        {
          provide: WebsocketGateway,
          useValue: mockWebsocketGateway,
        },
      ],
    }).compile();

    service = module.get<DebatesService>(DebatesService);
    repository = module.get<Repository<Debate>>(getRepositoryToken(Debate));
    websocketGateway = module.get<WebsocketGateway>(WebsocketGateway);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of debates', async () => {
      const result = [{ id: '1', title: 'Test Debate' }];
      mockQueryBuilder.getMany.mockResolvedValueOnce(result);

      const debates = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: SortBy.RECENT,
      });

      expect(debates).toEqual(result);
      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(3);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('debate.createdAt', 'DESC');
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
    });
  });

  describe('findOne', () => {
    it('should return a single debate', async () => {
      const result = { id: '1', title: 'Test Debate' };
      mockRepository.findOne.mockResolvedValueOnce(result);

      const debate = await service.findOne('1');

      expect(debate).toEqual(result);
    });

    it('should throw NotFoundException when debate is not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('1')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create a new debate', async () => {
      const createDebateInput = {
        title: 'New Debate',
        description: 'Test Description',
        category: 'Test',
      };
      const author = { id: '1', username: 'testuser' };
      const result = { ...createDebateInput, id: '1', author };

      mockRepository.create.mockReturnValueOnce(result);
      mockRepository.save.mockResolvedValueOnce(result);

      const debate = await service.create(createDebateInput as any, author as any);

      expect(debate).toEqual(result);
      expect(websocketGateway.server.emit).toHaveBeenCalledWith('debateCreated', result);
    });
  });
}); 
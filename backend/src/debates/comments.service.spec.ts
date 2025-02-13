import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CommentsService } from './comments.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { DebatesService } from './debates.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Not, IsNull } from 'typeorm';

describe('CommentsService', () => {
  let service: CommentsService;
  let repository: Repository<Comment>;
  let websocketGateway: WebsocketGateway;
  let debatesService: DebatesService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
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

    service = module.get<CommentsService>(CommentsService);
    repository = module.get<Repository<Comment>>(getRepositoryToken(Comment));
    websocketGateway = module.get<WebsocketGateway>(WebsocketGateway);
    debatesService = module.get<DebatesService>(DebatesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all comments', async () => {
      const result = [
        { id: '1', content: 'Comment 1' },
        { id: '2', content: 'Comment 2' },
      ];

      mockRepository.find.mockResolvedValueOnce(result);

      const comments = await service.findAll();

      expect(comments).toEqual(result);
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['author', 'debate', 'replyTo'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a comment by id', async () => {
      const result = { id: '1', content: 'Comment 1' };

      mockRepository.findOne.mockResolvedValueOnce(result);

      const comment = await service.findOne('1');

      expect(comment).toEqual(result);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['author', 'debate', 'replyTo'],
      });
    });

    it('should throw NotFoundException if comment not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const createCommentInput = {
        content: 'Test Comment',
        debateId: '1',
        isProArgument: true,
        sources: ['https://example.com'],
      };
      const author = { id: '1', username: 'testuser' };
      const debate = { id: '1', title: 'Test Debate' };
      const result = { ...createCommentInput, id: '1', author, debate };

      mockDebatesService.findOne.mockResolvedValueOnce(debate);
      mockRepository.create.mockReturnValueOnce(result);
      mockRepository.save.mockResolvedValueOnce(result);

      const comment = await service.create(createCommentInput, author as any);

      expect(comment).toEqual(result);
      expect(mockWebsocketGateway.server.to).toHaveBeenCalledWith(`debate:${debate.id}`);
      expect(mockWebsocketGateway.server.emit).toHaveBeenCalledWith('commentAdded', result);
    });

    it('should create a reply comment', async () => {
      const createCommentInput = {
        content: 'Test Reply',
        debateId: '1',
        isProArgument: true,
        replyToId: '2',
        sources: [],
      };
      const author = { id: '1', username: 'testuser' };
      const debate = { id: '1', title: 'Test Debate' };
      const parentComment = { id: '2', content: 'Parent Comment' };
      const result = { ...createCommentInput, id: '3', author, debate, replyTo: parentComment };

      mockDebatesService.findOne.mockResolvedValueOnce(debate);
      mockRepository.findOne.mockResolvedValueOnce(parentComment);
      mockRepository.create.mockReturnValueOnce(result);
      mockRepository.save.mockResolvedValueOnce(result);

      const comment = await service.create(createCommentInput, author as any);

      expect(comment).toEqual(result);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const id = '1';
      const updateCommentInput = {
        content: 'Updated Content',
      };
      const user = { id: '1', username: 'testuser' };
      const comment = { id, author: user, debate: { id: '1' } };
      const result = { ...comment, ...updateCommentInput };

      mockRepository.findOne.mockResolvedValueOnce(comment);
      mockRepository.update.mockResolvedValueOnce({ affected: 1 });
      mockRepository.findOne.mockResolvedValueOnce(result);

      const updatedComment = await service.update(id, updateCommentInput as any, user as any);

      expect(updatedComment).toEqual(result);
      expect(mockWebsocketGateway.server.to).toHaveBeenCalledWith(`debate:${comment.debate.id}`);
      expect(mockWebsocketGateway.server.emit).toHaveBeenCalledWith('commentUpdated', result);
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const id = '1';
      const updateCommentInput = { content: 'Updated Content' };
      const user = { id: '1', username: 'testuser' };
      const comment = { id, author: { id: '2' }, debate: { id: '1' } };

      mockRepository.findOne.mockResolvedValueOnce(comment);

      await expect(service.update(id, updateCommentInput as any, user as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      const id = '1';
      const user = { id: '1', username: 'testuser' };
      const comment = { id, author: user, debate: { id: '1' } };

      mockRepository.findOne.mockResolvedValueOnce(comment);
      mockRepository.delete.mockResolvedValueOnce({ affected: 1 });

      const result = await service.remove(id, user as any);

      expect(result).toBe(true);
      expect(mockWebsocketGateway.server.to).toHaveBeenCalledWith(`debate:${comment.debate.id}`);
      expect(mockWebsocketGateway.server.emit).toHaveBeenCalledWith('commentDeleted', { id });
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const id = '1';
      const user = { id: '1', username: 'testuser' };
      const comment = { id, author: { id: '2' }, debate: { id: '1' } };

      mockRepository.findOne.mockResolvedValueOnce(comment);

      await expect(service.remove(id, user as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findByDebate', () => {
    it('should return all comments for a debate', async () => {
      const debateId = '1';
      const result = [
        { id: '1', content: 'Comment 1' },
        { id: '2', content: 'Comment 2' },
      ];

      mockRepository.find.mockResolvedValueOnce(result);

      const comments = await service.findByDebate(debateId);

      expect(comments).toEqual(result);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { debate: { id: debateId } },
        relations: ['author', 'replyTo'],
        order: { createdAt: 'ASC' },
      });
    });
  });

  describe('upvote/downvote', () => {
    it('should increment upvotes', async () => {
      const id = '1';
      const comment = { id, upvotes: 0, debate: { id: '456' } };
      const result = { ...comment, upvotes: 1 };

      mockRepository.findOne.mockResolvedValueOnce(comment);
      mockRepository.save.mockResolvedValueOnce(result);

      const updatedComment = await service.upvote(id);

      expect(updatedComment).toEqual(result);
      expect(mockWebsocketGateway.server.to).toHaveBeenCalledWith(`debate:${comment.debate.id}`);
      expect(mockWebsocketGateway.server.emit).toHaveBeenCalledWith('commentUpdated', result);
    });

    it('should increment downvotes', async () => {
      const id = '1';
      const comment = { id, downvotes: 0 };
      const result = { ...comment, downvotes: 1 };

      mockRepository.findOne.mockResolvedValueOnce(comment);
      mockRepository.save.mockResolvedValueOnce(result);

      const updatedComment = await service.downvote(id);

      expect(updatedComment).toEqual(result);
    });
  });

  describe('verifyComment', () => {
    it('should verify a comment', async () => {
      const id = '1';
      const comment = { id, isVerified: false };
      const result = { ...comment, isVerified: true };

      mockRepository.findOne.mockResolvedValueOnce(comment);
      mockRepository.save.mockResolvedValueOnce(result);

      const verifiedComment = await service.verifyComment(id);

      expect(verifiedComment).toEqual(result);
    });
  });

  describe('softDelete', () => {
    it('should soft delete a comment', async () => {
      const id = '1';
      mockRepository.update.mockResolvedValueOnce({ affected: 1 });

      const result = await service.softDelete(id);

      expect(result).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(id, { isDeleted: true });
    });
  });

  describe('countTotal', () => {
    it('should return total comments count', async () => {
      const count = 10;
      mockRepository.count.mockResolvedValueOnce(count);

      const result = await service.countTotal();

      expect(result).toBe(count);
      expect(mockRepository.count).toHaveBeenCalled();
    });
  });

  describe('countReplies', () => {
    it('should return total replies count', async () => {
      const count = 5;
      mockRepository.count.mockResolvedValueOnce(count);

      const result = await service.countReplies();

      expect(result).toBe(count);
      expect(mockRepository.count).toHaveBeenCalledWith({
        where: {
          replyTo: { id: Not(IsNull()) },
          isDeleted: false,
        },
      });
    });
  });
}); 
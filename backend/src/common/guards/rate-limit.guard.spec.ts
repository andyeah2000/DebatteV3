import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { GqlThrottlerGuard } from './rate-limit.guard';
import { createMock } from '@golevelup/ts-jest';
import { Cache } from 'cache-manager';

class TestableGqlThrottlerGuard extends GqlThrottlerGuard {
  public async testHandleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
  ): Promise<boolean> {
    return this.handleRequest(context, limit, ttl);
  }
}

describe('GqlThrottlerGuard', () => {
  let guard: TestableGqlThrottlerGuard;
  let cacheManager: Cache;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    reset: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestableGqlThrottlerGuard,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    guard = module.get<TestableGqlThrottlerGuard>(TestableGqlThrottlerGuard);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('getTracker', () => {
    it('should return combined IP and user ID', async () => {
      const req = {
        ips: ['192.168.1.1'],
        user: { id: 'user123' },
      };

      const result = await guard.getTracker(req);
      expect(result).toBe('192.168.1.1:user123');
    });

    it('should use fallback IP if ips array is empty', async () => {
      const req = {
        ips: [],
        ip: '192.168.1.2',
        user: { id: 'user123' },
      };

      const result = await guard.getTracker(req);
      expect(result).toBe('192.168.1.2:user123');
    });

    it('should use anonymous for unauthenticated users', async () => {
      const req = {
        ips: ['192.168.1.1'],
        user: null,
      };

      const result = await guard.getTracker(req);
      expect(result).toBe('192.168.1.1:anonymous');
    });
  });

  describe('handleRequest', () => {
    let context: ExecutionContext;
    const mockRequest = {
      ips: ['192.168.1.1'],
      ip: '192.168.1.1',
      user: { id: 'user123' },
    };
    const mockResponse = {
      header: jest.fn(),
    };

    beforeEach(() => {
      context = createMock<ExecutionContext>({
        getType: () => 'graphql',
        getClass: () => undefined,
        getHandler: () => undefined,
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: () => mockResponse,
        }),
      });
      jest.spyOn(guard as any, 'getRequestResponse').mockReturnValue({
        req: mockRequest,
        res: mockResponse,
      });
      jest.spyOn(guard as any, 'generateKey').mockReturnValue('test-key');
    });

    it('should allow request when under limit', async () => {
      mockCacheManager.get.mockResolvedValueOnce(5);
      
      const result = await guard.testHandleRequest(context, 10, 60);
      
      expect(result).toBe(true);
      expect(mockCacheManager.set).toHaveBeenCalledWith('test-key', 6, 60000);
      expect(mockResponse.header).toHaveBeenCalledWith('X-RateLimit-Remaining', '4');
    });

    it('should throw exception when over limit', async () => {
      mockCacheManager.get.mockResolvedValueOnce(11);
      
      await expect(guard.testHandleRequest(context, 10, 60)).rejects.toThrow(HttpException);
      expect(mockResponse.header).toHaveBeenCalledWith('Retry-After', '60');
    });

    it('should throw exception when IP is blacklisted', async () => {
      mockCacheManager.get
        .mockResolvedValueOnce(5) // request count
        .mockResolvedValueOnce(true); // blacklist status
      
      await expect(guard.testHandleRequest(context, 10, 60)).rejects.toThrow(HttpException);
    });

    it('should add IP to blacklist when exceeding double the limit', async () => {
      mockCacheManager.get.mockResolvedValueOnce(21);
      
      await expect(guard.testHandleRequest(context, 10, 60)).rejects.toThrow(HttpException);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'blacklist:192.168.1.1',
        true,
        120000
      );
    });
  });
}); 
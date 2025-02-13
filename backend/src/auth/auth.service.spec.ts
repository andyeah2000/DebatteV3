import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    validatePassword: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockUsersService.findByEmail.mockResolvedValueOnce(user);
      mockUsersService.validatePassword.mockResolvedValueOnce(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(user);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(user, 'password');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(null);

      await expect(service.validateUser('test@example.com', 'password'))
        .rejects
        .toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      mockUsersService.findByEmail.mockResolvedValueOnce(user);
      mockUsersService.validatePassword.mockResolvedValueOnce(false);

      await expect(service.validateUser('test@example.com', 'wrongpassword'))
        .rejects
        .toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should return auth response with token and user', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
        roles: ['user'],
      };
      const token = 'jwt-token';
      const loginInput = {
        email: 'test@example.com',
        password: 'password',
      };

      mockUsersService.findByEmail.mockResolvedValueOnce(user);
      mockUsersService.validatePassword.mockResolvedValueOnce(true);
      mockJwtService.sign.mockReturnValueOnce(token);

      const result = await service.login(loginInput);

      expect(result).toEqual({
        token,
        user,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        roles: user.roles,
      });
    });
  });

  describe('validateOAuthLogin', () => {
    it('should return auth response for existing user', async () => {
      const profile = {
        id: 'google123',
        emails: [{ value: 'test@example.com' }],
        displayName: 'Test User',
        photos: [{ value: 'https://example.com/photo.jpg' }],
      };
      const user = {
        id: '1',
        email: 'test@example.com',
        roles: ['user'],
      };
      const token = 'jwt-token';

      mockUsersService.findByEmail.mockResolvedValueOnce(user);
      mockJwtService.sign.mockReturnValueOnce(token);

      const result = await service.validateOAuthLogin(profile, 'google');

      expect(result).toEqual({
        token,
        user,
      });
    });

    it('should create and return auth response for new user', async () => {
      const profile = {
        id: 'google123',
        emails: [{ value: 'test@example.com' }],
        displayName: 'Test User',
        photos: [{ value: 'https://example.com/photo.jpg' }],
      };
      const newUser = {
        id: '1',
        email: 'test@example.com',
        roles: ['user'],
        googleId: 'google123',
      };
      const token = 'jwt-token';

      mockUsersService.findByEmail.mockResolvedValueOnce(null);
      mockUsersService.create.mockResolvedValueOnce(newUser);
      mockJwtService.sign.mockReturnValueOnce(token);

      const result = await service.validateOAuthLogin(profile, 'google');

      expect(result).toEqual({
        token,
        user: newUser,
      });
      expect(mockUsersService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'Test User',
        isVerified: true,
        avatarUrl: 'https://example.com/photo.jpg',
        googleId: 'google123',
      });
    });
  });
}); 
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginInput } from './dto/login.input';
import { AuthResponse } from './dto/auth-response';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await this.usersService.validatePassword(user, password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const user = await this.validateUser(loginInput.email, loginInput.password);
    const token = this.generateToken(user);

    return {
      token,
      user,
    };
  }

  async validateOAuthLogin(profile: any, provider: string): Promise<AuthResponse> {
    const email = profile.emails[0].value;
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      // Create new user if doesn't exist
      user = await this.usersService.create({
        email,
        username: profile.displayName || email.split('@')[0],
        isVerified: true,
        avatarUrl: profile.photos?.[0]?.value,
        [provider + 'Id']: profile.id,
      });
    }

    const token = this.generateToken(user);

    return {
      token,
      user,
    };
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return this.jwtService.sign(payload);
  }
} 
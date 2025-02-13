import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['debates', 'comments', 'votes']
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(data: Partial<User>): Promise<User> {
    try {
      // Check if email already exists
      const existingEmail = await this.findByEmail(data.email);
      if (existingEmail) {
        throw new Error('Email already registered');
      }

      // Check if username already exists
      const existingUsername = await this.usersRepository.findOne({ 
        where: { username: data.username } 
      });
      if (existingUsername) {
        throw new Error('Username already taken');
      }

      // Hash password
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }

      const user = this.usersRepository.create(data);
      return await this.usersRepository.save(user);
    } catch (error) {
      if (error.message.includes('duplicate key')) {
        if (error.message.includes('email')) {
          throw new Error('Email already registered');
        }
        if (error.message.includes('username')) {
          throw new Error('Username already taken');
        }
      }
      throw error;
    }
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.findOne(id); // Verify user exists
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    await this.usersRepository.update(id, data);
    return this.findOne(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.usersRepository.delete(id);
    return result.affected > 0;
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    const userWithPassword = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: user.id })
      .getOne();

    if (!userWithPassword?.password) {
      return false;
    }

    return bcrypt.compare(password, userWithPassword.password);
  }

  async updateReputationScore(userId: string, points: number): Promise<User> {
    const user = await this.findOne(userId);
    user.reputationScore += points;
    return this.usersRepository.save(user);
  }

  async countTotal(): Promise<number> {
    return this.usersRepository.count();
  }

  async countActive(startDate: Date): Promise<number> {
    return this.usersRepository.count({
      where: {
        lastLoginAt: startDate ? MoreThanOrEqual(startDate) : undefined,
        isDeleted: false,
      },
    });
  }

  async countNew(startDate: Date): Promise<number> {
    return this.usersRepository.count({
      where: {
        createdAt: startDate ? MoreThanOrEqual(startDate) : undefined,
        isDeleted: false,
      },
    });
  }
} 
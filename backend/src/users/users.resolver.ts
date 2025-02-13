import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  @UseGuards(JwtAuthGuard)
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async user(@Args('id', { type: () => ID }) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Query(() => User)
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return this.usersService.findOne(user.id);
  }

  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput): Promise<User> {
    return this.usersService.create(createUserInput);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @CurrentUser() user: User,
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
  ): Promise<User> {
    return this.usersService.update(user.id, updateUserInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteUser(@CurrentUser() user: User): Promise<boolean> {
    return this.usersService.delete(user.id);
  }
} 
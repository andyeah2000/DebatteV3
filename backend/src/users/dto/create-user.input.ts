import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @Field()
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @Field({ nullable: true })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  bio?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
} 
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: any;
  let jwtToken: string;

  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    username: 'testuser',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get(getRepositoryToken(User));

    await app.init();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await userRepository.clear();

    // Create a test user
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await userRepository.save({
      ...testUser,
      password: hashedPassword,
      roles: ['user'],
      isVerified: true,
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should authenticate user and return token', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              login(loginInput: {
                email: "${testUser.email}",
                password: "${testUser.password}"
              }) {
                token
                user {
                  id
                  email
                  username
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.login.token).toBeDefined();
          expect(res.body.data.login.user.email).toBe(testUser.email);
          jwtToken = res.body.data.login.token;
        });
    });

    it('should fail with invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              login(loginInput: {
                email: "${testUser.email}",
                password: "wrongpassword"
              }) {
                token
                user {
                  id
                  email
                }
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].message).toBe('Invalid credentials');
        });
    });
  });

  describe('Protected Routes', () => {
    it('should access protected route with valid token', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          query: `
            query {
              me {
                id
                email
                username
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.me.email).toBe(testUser.email);
        });
    });

    it('should fail to access protected route without token', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              me {
                id
                email
                username
              }
            }
          `,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].message).toBe('Unauthorized');
        });
    });
  });

  describe('OAuth Routes', () => {
    it('should redirect to Google OAuth', () => {
      return request(app.getHttpServer())
        .get('/auth/google')
        .expect(302)
        .expect('Location', /^https:\/\/accounts\.google\.com/);
    });

    it('should handle OAuth callback', () => {
      return request(app.getHttpServer())
        .get('/auth/google/callback?code=test-code')
        .expect(302)
        .expect('Location', /^http:\/\/localhost:3000/);
    });
  });
}); 
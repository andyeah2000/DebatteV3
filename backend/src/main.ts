import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function tryListenOnPort(app: NestExpressApplication, port: number, maxRetries: number = 5): Promise<number> {
  const preferredPorts = [4000, 4001, 4002, 4003, 4004]; // Define preferred ports in order
  
  for (const currentPort of preferredPorts) {
    try {
      await app.listen(currentPort, '127.0.0.1');
      return currentPort;
    } catch (error: any) {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${currentPort} is in use, trying next port...`);
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Could not find an available port in preferred range`);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Accept-Encoding'],
      exposedHeaders: ['Set-Cookie'],
      maxAge: 86400, // 24 hours
    },
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Add request logging middleware
  app.use((req, res, next) => {
    console.log('Incoming backend request:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query
    });
    
    // Log response after it's sent
    res.on('finish', () => {
      console.log('Backend response sent:', {
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        headers: res.getHeaders()
      });
    });
    
    next();
  });

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
    crossOriginOpenerPolicy: process.env.NODE_ENV === 'production',
    crossOriginResourcePolicy: process.env.NODE_ENV === 'production',
  }));
  app.use(compression());
  app.use(cookieParser());

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
    disableErrorMessages: process.env.NODE_ENV === 'production',
  }));

  // Get ConfigService
  const configService = app.get(ConfigService);

  // Trust proxy if behind reverse proxy
  if (process.env.NODE_ENV === 'production') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  try {
    const usedPort = await tryListenOnPort(app, 4000);
    console.log(`Application is running on: http://127.0.0.1:${usedPort}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

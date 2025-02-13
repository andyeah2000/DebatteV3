export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  database: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'debattle',
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false,
      ca: process.env.POSTGRES_CA_CERT,
    } : false,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    ttl: parseInt(process.env.REDIS_TTL, 10) || 60,
  },
  security: {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      exposedHeaders: ['Set-Cookie'],
      maxAge: 86400,
    },
    rateLimit: {
      ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
      limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 100,
    },
    helmet: {
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
      crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
      crossOriginOpenerPolicy: process.env.NODE_ENV === 'production',
      crossOriginResourcePolicy: process.env.NODE_ENV === 'production',
    },
    session: {
      secret: process.env.SESSION_SECRET || 'super-secret-session',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      },
    },
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
  },
  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS, 10) || 2000,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
    },
  },
}); 
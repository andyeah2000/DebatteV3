import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private connectionRetries = 5;
  private retryDelay = 5000; // 5 seconds

  constructor(
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.connectWithRetry();
    await this.validateDatabaseConnection();
    await this.handleMigrations();
  }

  async onModuleDestroy() {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  private async connectWithRetry(attempt = 1): Promise<void> {
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
        this.logger.log('Database connection established successfully');
      }
    } catch (error) {
      this.logger.error(`Failed to connect to database (attempt ${attempt}/${this.connectionRetries}):`, error);
      
      if (attempt < this.connectionRetries) {
        this.logger.log(`Retrying in ${this.retryDelay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        await this.connectWithRetry(attempt + 1);
      } else {
        throw new Error('Failed to connect to database after multiple attempts');
      }
    }
  }

  private async handleMigrations(): Promise<void> {
    try {
      // First check if any tables exist
      const hasExistingTables = await this.dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('users', 'debates', 'comments', 'votes', 'reported_content', 'topic')
        );
      `);

      // Check if migrations table exists
      const hasMigrationsTable = await this.dataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'migrations'
        );
      `);

      if (hasExistingTables[0].exists) {
        // If tables exist but no migrations table, create it and mark all migrations as completed
        if (!hasMigrationsTable[0].exists) {
          await this.dataSource.query(`CREATE TABLE IF NOT EXISTS "migrations" (
            "id" SERIAL PRIMARY KEY,
            "timestamp" bigint NOT NULL,
            "name" varchar NOT NULL
          )`);

          // Get all migration files and mark them as completed
          const migrations = await this.dataSource.migrations;
          for (const migration of migrations) {
            const timestamp = parseInt(migration.name.split('-')[0]);
            await this.dataSource.query(
              `INSERT INTO "migrations"("timestamp", "name") VALUES ($1, $2)
               ON CONFLICT DO NOTHING`,
              [timestamp, migration.name]
            );
          }
          
          this.logger.log('Created migrations table and marked existing migrations as complete');
        }
        return; // Skip running migrations if tables already exist
      }

      // If no existing tables, proceed with normal migration process
      if (!hasMigrationsTable[0].exists) {
        await this.dataSource.query(`CREATE TABLE IF NOT EXISTS "migrations" (
          "id" SERIAL PRIMARY KEY,
          "timestamp" bigint NOT NULL,
          "name" varchar NOT NULL
        )`);
      }

      // Run any pending migrations
      const pendingMigrations = await this.dataSource.showMigrations();
      if (pendingMigrations) {
        this.logger.log('Running pending migrations...');
        await this.dataSource.runMigrations();
        this.logger.log('Migrations completed successfully');
      } else {
        this.logger.log('No pending migrations');
      }
    } catch (error) {
      this.logger.error('Migration handling failed:', error);
      throw error;
    }
  }

  private async validateDatabaseConnection(): Promise<void> {
    try {
      // Test query to verify connection
      await this.dataSource.query('SELECT 1');
      
      // Get database size and other metrics
      const dbSize = await this.dataSource.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);
      
      const connectionCount = await this.dataSource.query(`
        SELECT count(*) as count 
        FROM pg_stat_activity 
        WHERE datname = current_database()
      `);

      this.logger.log(`Database validation successful:
        - Size: ${dbSize[0].size}
        - Active connections: ${connectionCount[0].count}
      `);
    } catch (error) {
      this.logger.error('Database validation failed:', error);
      throw error;
    }
  }

  async checkDatabaseHealth(): Promise<{
    isHealthy: boolean;
    details: {
      connected: boolean;
      size: string;
      activeConnections: number;
      uptime: string;
    };
  }> {
    try {
      const [size, connections, uptime] = await Promise.all([
        this.dataSource.query(`
          SELECT pg_size_pretty(pg_database_size(current_database())) as size
        `),
        this.dataSource.query(`
          SELECT count(*) as count 
          FROM pg_stat_activity 
          WHERE datname = current_database()
        `),
        this.dataSource.query(`
          SELECT date_trunc('second', current_timestamp - pg_postmaster_start_time()) as uptime 
          FROM pg_postmaster_start_time()
        `),
      ]);

      return {
        isHealthy: true,
        details: {
          connected: this.dataSource.isInitialized,
          size: size[0].size,
          activeConnections: parseInt(connections[0].count),
          uptime: uptime[0].uptime,
        },
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        isHealthy: false,
        details: {
          connected: false,
          size: 'unknown',
          activeConnections: 0,
          uptime: 'unknown',
        },
      };
    }
  }

  async vacuum(table?: string): Promise<void> {
    try {
      if (table) {
        await this.dataSource.query(`VACUUM ANALYZE ${table}`);
        this.logger.log(`Vacuum completed for table: ${table}`);
      } else {
        await this.dataSource.query('VACUUM ANALYZE');
        this.logger.log('Vacuum completed for all tables');
      }
    } catch (error) {
      this.logger.error('Vacuum operation failed:', error);
      throw error;
    }
  }
} 
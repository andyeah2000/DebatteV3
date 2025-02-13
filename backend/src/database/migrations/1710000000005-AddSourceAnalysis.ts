import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourceAnalysis1710000000005 implements MigrationInterface {
  name = 'AddSourceAnalysis1710000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sources"
      ADD COLUMN IF NOT EXISTS "analysis" jsonb,
      ADD COLUMN IF NOT EXISTS "analysisStatus" character varying NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS "lastAnalyzedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "analysisVersion" integer NOT NULL DEFAULT 0
    `);

    // Create indexes for analysis fields
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_sources_analysisStatus" ON "sources" ("analysisStatus");
      CREATE INDEX IF NOT EXISTS "IDX_sources_lastAnalyzedAt" ON "sources" ("lastAnalyzedAt");
      CREATE INDEX IF NOT EXISTS "IDX_sources_analysisVersion" ON "sources" ("analysisVersion");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_sources_analysisStatus";
      DROP INDEX IF EXISTS "IDX_sources_lastAnalyzedAt";
      DROP INDEX IF EXISTS "IDX_sources_analysisVersion";
    `);

    // Drop columns
    await queryRunner.query(`
      ALTER TABLE "sources"
      DROP COLUMN IF EXISTS "analysis",
      DROP COLUMN IF EXISTS "analysisStatus",
      DROP COLUMN IF EXISTS "lastAnalyzedAt",
      DROP COLUMN IF EXISTS "analysisVersion"
    `);
  }
} 
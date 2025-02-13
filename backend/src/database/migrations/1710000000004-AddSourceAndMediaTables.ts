import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourceAndMediaTables1710000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create source table
    await queryRunner.query(`
      CREATE TABLE "source" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "url" character varying NOT NULL,
        "title" character varying NOT NULL,
        "credibilityScore" double precision,
        "verificationStatus" character varying NOT NULL DEFAULT 'pending',
        "commentId" uuid,
        CONSTRAINT "PK_source" PRIMARY KEY ("id")
      )
    `);

    // Create media table
    await queryRunner.query(`
      CREATE TABLE "media" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" character varying NOT NULL DEFAULT 'image',
        "url" character varying NOT NULL,
        "title" character varying NOT NULL,
        "description" character varying,
        "commentId" uuid,
        CONSTRAINT "PK_media" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "source"
      ADD CONSTRAINT "FK_source_comment"
      FOREIGN KEY ("commentId")
      REFERENCES "comment"("id")
      ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "media"
      ADD CONSTRAINT "FK_media_comment"
      FOREIGN KEY ("commentId")
      REFERENCES "comment"("id")
      ON DELETE CASCADE
    `);

    // Drop old jsonb columns from comment table
    await queryRunner.query(`
      ALTER TABLE "comment"
      DROP COLUMN IF EXISTS "sources",
      DROP COLUMN IF EXISTS "media"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back jsonb columns to comment table
    await queryRunner.query(`
      ALTER TABLE "comment"
      ADD COLUMN "sources" jsonb DEFAULT '[]',
      ADD COLUMN "media" jsonb DEFAULT '[]'
    `);

    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "source"
      DROP CONSTRAINT "FK_source_comment"
    `);

    await queryRunner.query(`
      ALTER TABLE "media"
      DROP CONSTRAINT "FK_media_comment"
    `);

    // Drop tables
    await queryRunner.query(`DROP TABLE "source"`);
    await queryRunner.query(`DROP TABLE "media"`);
  }
} 
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWarningsTable1710000000007 implements MigrationInterface {
  name = 'CreateWarningsTable1710000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "warning_level_enum" AS ENUM (
        'notice',
        'warning',
        'severe',
        'critical'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "warning_status_enum" AS ENUM (
        'active',
        'acknowledged',
        'resolved',
        'expired'
      )
    `);

    // Create warnings table
    await queryRunner.query(`
      CREATE TABLE "warnings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "level" "warning_level_enum" NOT NULL DEFAULT 'notice',
        "status" "warning_status_enum" NOT NULL DEFAULT 'active',
        "reason" character varying NOT NULL,
        "details" character varying,
        "expiresAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "relatedContentIds" text NOT NULL DEFAULT '',
        "strikes" integer NOT NULL DEFAULT 0,
        "userId" uuid NOT NULL,
        "issuedById" uuid,
        CONSTRAINT "PK_warnings_id" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "warnings"
      ADD CONSTRAINT "FK_warnings_user"
      FOREIGN KEY ("userId")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "warnings"
      ADD CONSTRAINT "FK_warnings_issued_by"
      FOREIGN KEY ("issuedById")
      REFERENCES "users"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);

    // Add indices
    await queryRunner.query(`
      CREATE INDEX "IDX_warnings_user_id" ON "warnings" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_warnings_status" ON "warnings" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_warnings_level" ON "warnings" ("level")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_warnings_created_at" ON "warnings" ("createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indices
    await queryRunner.query(`DROP INDEX "IDX_warnings_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_warnings_level"`);
    await queryRunner.query(`DROP INDEX "IDX_warnings_status"`);
    await queryRunner.query(`DROP INDEX "IDX_warnings_user_id"`);

    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "warnings"
      DROP CONSTRAINT "FK_warnings_issued_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "warnings"
      DROP CONSTRAINT "FK_warnings_user"
    `);

    // Drop table
    await queryRunner.query(`DROP TABLE "warnings"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "warning_status_enum"`);
    await queryRunner.query(`DROP TYPE "warning_level_enum"`);
  }
} 
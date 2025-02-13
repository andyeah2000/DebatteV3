import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserSettings1710000000004 implements MigrationInterface {
  name = 'AddUserSettings1710000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_settings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "emailNotifications" boolean NOT NULL DEFAULT true,
        "pushNotifications" boolean NOT NULL DEFAULT true,
        "theme" character varying NOT NULL DEFAULT 'light',
        "language" character varying NOT NULL DEFAULT 'en',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_settings_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_settings_userId" UNIQUE ("userId")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "user_settings"
      ADD CONSTRAINT "FK_user_settings_user"
      FOREIGN KEY ("userId")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Create default settings for existing users
    await queryRunner.query(`
      INSERT INTO "user_settings" ("userId")
      SELECT "id" FROM "users"
      WHERE "id" NOT IN (SELECT "userId" FROM "user_settings")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_settings"
      DROP CONSTRAINT "FK_user_settings_user"
    `);

    await queryRunner.query(`
      DROP TABLE "user_settings"
    `);
  }
} 
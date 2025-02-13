import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1708000000000 implements MigrationInterface {
  name = 'CreateUsersTable1708000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "avatarUrl" character varying,
        "bio" text,
        "role" character varying NOT NULL DEFAULT 'user',
        "isVerified" boolean NOT NULL DEFAULT false,
        "lastLoginAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_username" UNIQUE ("username"),
        CONSTRAINT "UQ_user_email" UNIQUE ("email")
      )
    `);

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
      REFERENCES "user"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
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

    await queryRunner.query(`
      DROP TABLE "user"
    `);
  }
} 
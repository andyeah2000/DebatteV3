import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1710000000005 implements MigrationInterface {
  name = 'CreateNotificationsTable1710000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "notification_priority_enum" AS ENUM (
        'low',
        'medium',
        'high',
        'urgent'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "notification_type_enum" AS ENUM (
        'debate_reply',
        'badge_earned',
        'debate_featured',
        'vote_received',
        'comment_reply',
        'debate_ended',
        'source_verified',
        'moderation_action'
      )
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" "notification_type_enum" NOT NULL,
        "priority" "notification_priority_enum" NOT NULL DEFAULT 'low',
        "title" character varying NOT NULL,
        "message" text NOT NULL,
        "isRead" boolean NOT NULL DEFAULT false,
        "data" jsonb,
        "groupId" character varying,
        "userId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "notifications"
      ADD CONSTRAINT "FK_notifications_user"
      FOREIGN KEY ("userId")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Add index for faster queries
    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("userId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_notifications_created_at" ON "notifications" ("createdAt")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_notifications_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_user_id"`);

    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "notifications"
      DROP CONSTRAINT "FK_notifications_user"
    `);

    // Drop notifications table
    await queryRunner.query(`DROP TABLE "notifications"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "notification_type_enum"`);
    await queryRunner.query(`DROP TYPE "notification_priority_enum"`);
  }
} 
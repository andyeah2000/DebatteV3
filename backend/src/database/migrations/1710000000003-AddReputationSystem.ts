import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReputationSystem1710000000003 implements MigrationInterface {
  name = 'AddReputationSystem1710000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new score columns to users table
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "debateScore" integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "commentScore" integer NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS "sourceScore" integer NOT NULL DEFAULT 0
    `);

    // Create badges table
    await queryRunner.query(`
      CREATE TABLE "badges" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying NOT NULL,
        "icon" character varying NOT NULL,
        "category" character varying NOT NULL,
        "requiredScore" integer NOT NULL,
        "isSpecial" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_badges" PRIMARY KEY ("id")
      )
    `);

    // Create user_badges junction table
    await queryRunner.query(`
      CREATE TABLE "user_badges" (
        "userId" uuid NOT NULL,
        "badgeId" uuid NOT NULL,
        CONSTRAINT "PK_user_badges" PRIMARY KEY ("userId", "badgeId"),
        CONSTRAINT "FK_user_badges_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_user_badges_badge" FOREIGN KEY ("badgeId")
          REFERENCES "badges"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    // Insert default badges
    await queryRunner.query(`
      INSERT INTO "badges" (name, description, icon, category, "requiredScore", "isSpecial")
      VALUES 
        ('Novice Debater', 'Started your journey in debates', '🎯', 'milestone', 0, false),
        ('Rising Star', 'Gained recognition in the community', '⭐', 'milestone', 100, false),
        ('Expert Debater', 'Mastered the art of debate', '🏆', 'milestone', 500, false),
        ('Master of Sources', 'Provided high-quality sources', '📚', 'achievement', 50, false),
        ('Thought Leader', 'Influenced many debates', '💡', 'achievement', 200, false),
        ('Quality Contributor', 'Consistently high-quality contributions', '🌟', 'achievement', 300, false),
        ('Debate Champion', 'Won multiple debates', '🏅', 'special', 0, true),
        ('Community Pillar', 'Outstanding community contribution', '🌍', 'special', 0, true)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop user_badges junction table
    await queryRunner.query(`DROP TABLE "user_badges"`);

    // Drop badges table
    await queryRunner.query(`DROP TABLE "badges"`);

    // Remove score columns from users table
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP COLUMN IF EXISTS "debateScore",
      DROP COLUMN IF EXISTS "commentScore",
      DROP COLUMN IF EXISTS "sourceScore"
    `);
  }
} 
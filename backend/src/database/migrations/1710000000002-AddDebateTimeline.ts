import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDebateTimeline1710000000002 implements MigrationInterface {
  name = 'AddDebateTimeline1710000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add timeline column
    await queryRunner.query(`
      ALTER TABLE "debates" 
      ADD COLUMN IF NOT EXISTS "timeline" JSONB DEFAULT '[]'::jsonb
    `);

    // Add phases column
    await queryRunner.query(`
      ALTER TABLE "debates" 
      ADD COLUMN IF NOT EXISTS "phases" JSONB DEFAULT '[]'::jsonb
    `);

    // Add currentPhase column
    await queryRunner.query(`
      ALTER TABLE "debates" 
      ADD COLUMN IF NOT EXISTS "currentPhase" VARCHAR DEFAULT 'opening'
    `);

    // Add isModerated column
    await queryRunner.query(`
      ALTER TABLE "debates" 
      ADD COLUMN IF NOT EXISTS "isModerated" BOOLEAN DEFAULT false
    `);

    // Add qualityScore column
    await queryRunner.query(`
      ALTER TABLE "debates" 
      ADD COLUMN IF NOT EXISTS "qualityScore" INTEGER DEFAULT 0
    `);

    // Add requiredSources column
    await queryRunner.query(`
      ALTER TABLE "debates" 
      ADD COLUMN IF NOT EXISTS "requiredSources" TEXT[] DEFAULT '{}'
    `);

    // Add sourceQualityScore column
    await queryRunner.query(`
      ALTER TABLE "debates" 
      ADD COLUMN IF NOT EXISTS "sourceQualityScore" INTEGER DEFAULT 0
    `);

    // Update existing debates to have default phases
    await queryRunner.query(`
      UPDATE "debates"
      SET phases = to_jsonb(array[
        json_build_object(
          'name', 'opening',
          'startTime', now(),
          'isActive', true,
          'requirements', array['initial_arguments']
        ),
        json_build_object(
          'name', 'discussion',
          'requirements', array['minimum_participants']
        ),
        json_build_object(
          'name', 'closing',
          'requirements', array['final_arguments']
        ),
        json_build_object(
          'name', 'voting',
          'requirements', array['minimum_votes']
        )
      ])
      WHERE phases IS NULL OR phases = '[]'::jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "debates" DROP COLUMN IF EXISTS "timeline"`);
    await queryRunner.query(`ALTER TABLE "debates" DROP COLUMN IF EXISTS "phases"`);
    await queryRunner.query(`ALTER TABLE "debates" DROP COLUMN IF EXISTS "currentPhase"`);
    await queryRunner.query(`ALTER TABLE "debates" DROP COLUMN IF EXISTS "isModerated"`);
    await queryRunner.query(`ALTER TABLE "debates" DROP COLUMN IF EXISTS "qualityScore"`);
    await queryRunner.query(`ALTER TABLE "debates" DROP COLUMN IF EXISTS "requiredSources"`);
    await queryRunner.query(`ALTER TABLE "debates" DROP COLUMN IF EXISTS "sourceQualityScore"`);
  }
} 
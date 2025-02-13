import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeScheduledEndTimeNullable1710000000001 implements MigrationInterface {
  name = 'MakeScheduledEndTimeNullable1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, make the column nullable
    await queryRunner.query(`ALTER TABLE "debates" ALTER COLUMN "scheduledEndTime" DROP NOT NULL`);
    
    // Update existing records to have a default value if needed
    await queryRunner.query(`
      UPDATE "debates"
      SET "scheduledEndTime" = NULL
      WHERE "scheduledEndTime" = '1970-01-01 00:00:00'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Set a default value for existing NULL records before making the column NOT NULL
    await queryRunner.query(`
      UPDATE "debates"
      SET "scheduledEndTime" = NOW() + INTERVAL '7 days'
      WHERE "scheduledEndTime" IS NULL
    `);
    
    // Make the column NOT NULL again
    await queryRunner.query(`ALTER TABLE "debates" ALTER COLUMN "scheduledEndTime" SET NOT NULL`);
  }
} 
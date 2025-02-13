import { MigrationInterface, QueryRunner } from "typeorm";

export class FixOrphanVotes1710000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM vote
      WHERE "userId" IS NULL OR "userId" NOT IN (SELECT id FROM users);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No down migration for data cleanup
  }
} 
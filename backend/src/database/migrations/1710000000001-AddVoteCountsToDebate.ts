import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVoteCountsToDebate1710000000001 implements MigrationInterface {
  name = 'AddVoteCountsToDebate1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "debate"
      ADD COLUMN "proVotes" integer NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "debate"
      ADD COLUMN "conVotes" integer NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "debate"
      DROP COLUMN "proVotes"
    `);

    await queryRunner.query(`
      ALTER TABLE "debate"
      DROP COLUMN "conVotes"
    `);
  }
} 
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateVoteTable1710000000003 implements MigrationInterface {
  name = 'UpdateVoteTable1710000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop existing foreign key constraints first
    await queryRunner.query(`
      ALTER TABLE "vote" DROP CONSTRAINT IF EXISTS "FK_vote_user";
      ALTER TABLE "vote" DROP CONSTRAINT IF EXISTS "FK_vote_debate";
    `);

    // Add isProVote column as nullable initially
    await queryRunner.query(`
      ALTER TABLE "vote" ADD COLUMN "isProVote" boolean
    `);

    // Update the values based on the existing type column
    await queryRunner.query(`
      UPDATE "vote" SET "isProVote" = CASE 
        WHEN "type" = 'pro' THEN true 
        WHEN "type" = 'con' THEN false 
      END
    `);

    // Make isProVote non-nullable after setting values
    await queryRunner.query(`
      ALTER TABLE "vote" ALTER COLUMN "isProVote" SET NOT NULL
    `);

    // Add isDeleted column
    await queryRunner.query(`
      ALTER TABLE "vote" ADD COLUMN "isDeleted" boolean NOT NULL DEFAULT false
    `);

    // Drop old type and updatedAt columns
    await queryRunner.query(`
      ALTER TABLE "vote" DROP COLUMN "type";
      ALTER TABLE "vote" DROP COLUMN "updatedAt";
    `);

    // Update foreign key references to point to the correct table names
    await queryRunner.query(`
      ALTER TABLE "vote"
      ADD CONSTRAINT "FK_vote_user"
      FOREIGN KEY ("userId")
      REFERENCES "user"("id")
      ON DELETE CASCADE;

      ALTER TABLE "vote"
      ADD CONSTRAINT "FK_vote_debate"
      FOREIGN KEY ("debateId")
      REFERENCES "debate"("id")
      ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the new foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "vote" DROP CONSTRAINT IF EXISTS "FK_vote_user";
      ALTER TABLE "vote" DROP CONSTRAINT IF EXISTS "FK_vote_debate";
    `);

    // Add back the updatedAt column
    await queryRunner.query(`
      ALTER TABLE "vote" ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
    `);

    // Add back the type column
    await queryRunner.query(`
      ALTER TABLE "vote" ADD COLUMN "type" character varying
    `);

    // Update the type column based on isProVote
    await queryRunner.query(`
      UPDATE "vote" SET "type" = CASE 
        WHEN "isProVote" = true THEN 'pro' 
        WHEN "isProVote" = false THEN 'con' 
      END
    `);

    // Make type non-nullable
    await queryRunner.query(`
      ALTER TABLE "vote" ALTER COLUMN "type" SET NOT NULL
    `);

    // Drop the new columns
    await queryRunner.query(`
      ALTER TABLE "vote" DROP COLUMN "isProVote";
      ALTER TABLE "vote" DROP COLUMN "isDeleted";
    `);

    // Re-add the original foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "vote"
      ADD CONSTRAINT "FK_vote_user"
      FOREIGN KEY ("userId")
      REFERENCES "user"("id")
      ON DELETE CASCADE;

      ALTER TABLE "vote"
      ADD CONSTRAINT "FK_vote_debate"
      FOREIGN KEY ("debateId")
      REFERENCES "debate"("id")
      ON DELETE CASCADE;
    `);
  }
} 
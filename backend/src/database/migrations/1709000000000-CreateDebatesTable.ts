import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDebatesTable1709000000000 implements MigrationInterface {
  name = 'CreateDebatesTable1709000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "debate" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "category" character varying NOT NULL,
        "authorId" uuid NOT NULL,
        "participantsCount" integer NOT NULL DEFAULT 0,
        "viewCount" integer NOT NULL DEFAULT 0,
        "qualityScore" double precision NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_debate_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "comment" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" text NOT NULL,
        "authorId" uuid NOT NULL,
        "debateId" uuid NOT NULL,
        "parentId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_comment_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "vote" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" character varying NOT NULL,
        "userId" uuid NOT NULL,
        "debateId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_vote_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "debate"
      ADD CONSTRAINT "FK_debate_author"
      FOREIGN KEY ("authorId")
      REFERENCES "user"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "comment"
      ADD CONSTRAINT "FK_comment_author"
      FOREIGN KEY ("authorId")
      REFERENCES "user"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "comment"
      ADD CONSTRAINT "FK_comment_debate"
      FOREIGN KEY ("debateId")
      REFERENCES "debate"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "comment"
      ADD CONSTRAINT "FK_comment_parent"
      FOREIGN KEY ("parentId")
      REFERENCES "comment"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "vote"
      ADD CONSTRAINT "FK_vote_user"
      FOREIGN KEY ("userId")
      REFERENCES "user"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "vote"
      ADD CONSTRAINT "FK_vote_debate"
      FOREIGN KEY ("debateId")
      REFERENCES "debate"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "vote"
      DROP CONSTRAINT "FK_vote_debate"
    `);

    await queryRunner.query(`
      ALTER TABLE "vote"
      DROP CONSTRAINT "FK_vote_user"
    `);

    await queryRunner.query(`
      ALTER TABLE "comment"
      DROP CONSTRAINT "FK_comment_parent"
    `);

    await queryRunner.query(`
      ALTER TABLE "comment"
      DROP CONSTRAINT "FK_comment_debate"
    `);

    await queryRunner.query(`
      ALTER TABLE "comment"
      DROP CONSTRAINT "FK_comment_author"
    `);

    await queryRunner.query(`
      ALTER TABLE "debate"
      DROP CONSTRAINT "FK_debate_author"
    `);

    await queryRunner.query(`
      DROP TABLE "vote"
    `);

    await queryRunner.query(`
      DROP TABLE "comment"
    `);

    await queryRunner.query(`
      DROP TABLE "debate"
    `);
  }
} 
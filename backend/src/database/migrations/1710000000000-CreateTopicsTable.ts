import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTopicsTable1710000000000 implements MigrationInterface {
  name = 'CreateTopicsTable1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."topic_trend_enum" AS ENUM ('up', 'down', 'neutral')
    `);

    await queryRunner.query(`
      CREATE TABLE "topic" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text,
        "category" character varying NOT NULL,
        "trend" "public"."topic_trend_enum" NOT NULL DEFAULT 'neutral',
        "debateCount" integer NOT NULL DEFAULT 0,
        "trendScore" double precision NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_topic_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "topic_debates_debate" (
        "topicId" uuid NOT NULL,
        "debateId" uuid NOT NULL,
        CONSTRAINT "PK_topic_debates" PRIMARY KEY ("topicId", "debateId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "topic_related_topics_topic" (
        "topicId_1" uuid NOT NULL,
        "topicId_2" uuid NOT NULL,
        CONSTRAINT "PK_topic_related" PRIMARY KEY ("topicId_1", "topicId_2")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "topic_debates_debate"
      ADD CONSTRAINT "FK_topic_debates_topic"
      FOREIGN KEY ("topicId")
      REFERENCES "topic"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "topic_debates_debate"
      ADD CONSTRAINT "FK_topic_debates_debate"
      FOREIGN KEY ("debateId")
      REFERENCES "debate"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "topic_related_topics_topic"
      ADD CONSTRAINT "FK_topic_related_1"
      FOREIGN KEY ("topicId_1")
      REFERENCES "topic"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "topic_related_topics_topic"
      ADD CONSTRAINT "FK_topic_related_2"
      FOREIGN KEY ("topicId_2")
      REFERENCES "topic"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "topic_related_topics_topic"
      DROP CONSTRAINT "FK_topic_related_2"
    `);

    await queryRunner.query(`
      ALTER TABLE "topic_related_topics_topic"
      DROP CONSTRAINT "FK_topic_related_1"
    `);

    await queryRunner.query(`
      ALTER TABLE "topic_debates_debate"
      DROP CONSTRAINT "FK_topic_debates_debate"
    `);

    await queryRunner.query(`
      ALTER TABLE "topic_debates_debate"
      DROP CONSTRAINT "FK_topic_debates_topic"
    `);

    await queryRunner.query(`
      DROP TABLE "topic_related_topics_topic"
    `);

    await queryRunner.query(`
      DROP TABLE "topic_debates_debate"
    `);

    await queryRunner.query(`
      DROP TABLE "topic"
    `);

    await queryRunner.query(`
      DROP TYPE "public"."topic_trend_enum"
    `);
  }
} 
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSourcesSystem1710000000004 implements MigrationInterface {
  name = 'AddSourcesSystem1710000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "sources" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "url" character varying NOT NULL,
        "title" character varying NOT NULL,
        "description" character varying,
        "trustScore" float NOT NULL,
        "isVerified" boolean NOT NULL DEFAULT false,
        "archiveUrl" character varying,
        "domain" character varying,
        "isDomainTrusted" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "citationCount" integer NOT NULL DEFAULT 0,
        "tags" text,
        "submittedById" uuid NOT NULL,
        "debateId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sources" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sources_submittedBy" FOREIGN KEY ("submittedById")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_sources_debate" FOREIGN KEY ("debateId")
          REFERENCES "debates"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "IDX_sources_url" ON "sources" ("url");
      CREATE INDEX "IDX_sources_domain" ON "sources" ("domain");
      CREATE INDEX "IDX_sources_trustScore" ON "sources" ("trustScore");
      CREATE INDEX "IDX_sources_isVerified" ON "sources" ("isVerified");
      CREATE INDEX "IDX_sources_citationCount" ON "sources" ("citationCount");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`
      DROP INDEX "IDX_sources_url";
      DROP INDEX "IDX_sources_domain";
      DROP INDEX "IDX_sources_trustScore";
      DROP INDEX "IDX_sources_isVerified";
      DROP INDEX "IDX_sources_citationCount";
    `);

    // Drop table
    await queryRunner.query(`DROP TABLE "sources"`);
  }
} 
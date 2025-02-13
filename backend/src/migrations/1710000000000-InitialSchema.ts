import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "username" character varying NOT NULL,
        "password" character varying NOT NULL,
        "roles" text array NOT NULL DEFAULT '{user}',
        "isVerified" boolean NOT NULL DEFAULT false,
        "reputationScore" integer NOT NULL DEFAULT 0,
        "avatarUrl" character varying,
        "bio" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "isDeleted" boolean NOT NULL DEFAULT false,
        "lastLoginAt" TIMESTAMP,
        "refreshToken" character varying,
        "googleId" character varying,
        "githubId" character varying,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "debates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "category" character varying NOT NULL,
        "tags" text array NOT NULL DEFAULT '{}',
        "scheduledEndTime" TIMESTAMP NOT NULL,
        "isEnded" boolean NOT NULL DEFAULT false,
        "isFeatured" boolean NOT NULL DEFAULT false,
        "viewCount" integer NOT NULL DEFAULT 0,
        "participantsCount" integer NOT NULL DEFAULT 0,
        "proVotes" integer NOT NULL DEFAULT 0,
        "conVotes" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "isDeleted" boolean NOT NULL DEFAULT false,
        "winningPosition" character varying,
        "summary" text,
        "authorId" uuid,
        CONSTRAINT "PK_debates" PRIMARY KEY ("id"),
        CONSTRAINT "FK_debates_author" FOREIGN KEY ("authorId") REFERENCES "users"("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "comments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "content" text NOT NULL,
        "isEdited" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "isDeleted" boolean NOT NULL DEFAULT false,
        "upvotes" integer NOT NULL DEFAULT 0,
        "downvotes" integer NOT NULL DEFAULT 0,
        "isProSide" boolean,
        "authorId" uuid,
        "debateId" uuid,
        "parentCommentId" uuid,
        CONSTRAINT "PK_comments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_comments_author" FOREIGN KEY ("authorId") REFERENCES "users"("id"),
        CONSTRAINT "FK_comments_debate" FOREIGN KEY ("debateId") REFERENCES "debates"("id"),
        CONSTRAINT "FK_comments_parent" FOREIGN KEY ("parentCommentId") REFERENCES "comments"("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "votes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "isProVote" boolean NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "isDeleted" boolean NOT NULL DEFAULT false,
        "userId" uuid,
        "debateId" uuid,
        CONSTRAINT "PK_votes" PRIMARY KEY ("id"),
        CONSTRAINT "FK_votes_user" FOREIGN KEY ("userId") REFERENCES "users"("id"),
        CONSTRAINT "FK_votes_debate" FOREIGN KEY ("debateId") REFERENCES "debates"("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "reported_content" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" character varying NOT NULL,
        "reason" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "moderatedAt" TIMESTAMP,
        "moderationNote" character varying,
        "reportedById" uuid,
        "moderatedById" uuid,
        "debateId" uuid,
        "commentId" uuid,
        CONSTRAINT "PK_reported_content" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reported_content_reporter" FOREIGN KEY ("reportedById") REFERENCES "users"("id"),
        CONSTRAINT "FK_reported_content_moderator" FOREIGN KEY ("moderatedById") REFERENCES "users"("id"),
        CONSTRAINT "FK_reported_content_debate" FOREIGN KEY ("debateId") REFERENCES "debates"("id"),
        CONSTRAINT "FK_reported_content_comment" FOREIGN KEY ("commentId") REFERENCES "comments"("id")
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "reported_content"`)
    await queryRunner.query(`DROP TABLE "votes"`)
    await queryRunner.query(`DROP TABLE "comments"`)
    await queryRunner.query(`DROP TABLE "debates"`)
    await queryRunner.query(`DROP TABLE "users"`)
  }
} 
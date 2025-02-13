import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedInitialData1710000000002 implements MigrationInterface {
  name = 'SeedInitialData1710000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create users
    await queryRunner.query(`
      INSERT INTO "user" (id, username, email, password, "avatarUrl", bio, role, "isVerified")
      VALUES 
        ('11111111-1111-1111-1111-111111111111', 'admin', 'admin@debattle.com', $1, 'https://ui-avatars.com/api/?name=Admin', 'Platform Administrator', 'admin', true),
        ('22222222-2222-2222-2222-222222222222', 'moderator', 'mod@debattle.com', $1, 'https://ui-avatars.com/api/?name=Moderator', 'Community Moderator', 'moderator', true),
        ('33333333-3333-3333-3333-333333333333', 'user1', 'user1@debattle.com', $1, 'https://ui-avatars.com/api/?name=User1', 'Regular User 1', 'user', true),
        ('44444444-4444-4444-4444-444444444444', 'user2', 'user2@debattle.com', $1, 'https://ui-avatars.com/api/?name=User2', 'Regular User 2', 'user', true)
    `, [hashedPassword]);

    // Create topics
    await queryRunner.query(`
      INSERT INTO "topic" (id, title, description, category, trend, "debateCount", "trendScore")
      VALUES 
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Climate Change', 'Global warming and environmental issues', 'Environment', 'up', 2, 100),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Artificial Intelligence', 'The future of AI and its impact', 'Technology', 'up', 1, 80),
        ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Democracy', 'Modern democratic systems and challenges', 'Politics', 'neutral', 1, 60),
        ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Space Exploration', 'The future of human space travel', 'Science', 'up', 1, 90)
    `);

    // Create debates
    await queryRunner.query(`
      INSERT INTO "debate" (id, title, description, category, "authorId", "participantsCount", "viewCount", "qualityScore", "proVotes", "conVotes")
      VALUES 
        ('11111111-aaaa-bbbb-cccc-dddddddddddd', 'Should Carbon Tax Be Mandatory?', 'Discussing the effectiveness of carbon taxation', 'Environment', '33333333-3333-3333-3333-333333333333', 10, 100, 85, 7, 3),
        ('22222222-aaaa-bbbb-cccc-dddddddddddd', 'Nuclear Energy vs Renewables', 'Comparing different clean energy solutions', 'Environment', '44444444-4444-4444-4444-444444444444', 8, 80, 90, 5, 3),
        ('33333333-aaaa-bbbb-cccc-dddddddddddd', 'AI Regulation Framework', 'How should AI development be regulated?', 'Technology', '33333333-3333-3333-3333-333333333333', 15, 150, 95, 8, 7),
        ('44444444-aaaa-bbbb-cccc-dddddddddddd', 'Mars Colony Timeline', 'When will humans establish permanent Mars settlement?', 'Science', '44444444-4444-4444-4444-444444444444', 12, 120, 88, 6, 6)
    `);

    // Link topics to debates
    await queryRunner.query(`
      INSERT INTO "topic_debates_debate" ("topicId", "debateId")
      VALUES 
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-aaaa-bbbb-cccc-dddddddddddd'),
        ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-aaaa-bbbb-cccc-dddddddddddd'),
        ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-aaaa-bbbb-cccc-dddddddddddd'),
        ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-aaaa-bbbb-cccc-dddddddddddd')
    `);

    // Create comments
    await queryRunner.query(`
      INSERT INTO "comment" (id, content, "authorId", "debateId", "parentId")
      VALUES 
        ('aaaaaaaa-1111-2222-3333-444444444444', 'Carbon tax has proven effective in reducing emissions in several countries.', '33333333-3333-3333-3333-333333333333', '11111111-aaaa-bbbb-cccc-dddddddddddd', null),
        ('bbbbbbbb-1111-2222-3333-444444444444', 'Nuclear energy has the highest energy density and lowest carbon footprint.', '44444444-4444-4444-4444-444444444444', '22222222-aaaa-bbbb-cccc-dddddddddddd', null),
        ('cccccccc-1111-2222-3333-444444444444', 'AI development needs international oversight and ethical guidelines.', '33333333-3333-3333-3333-333333333333', '33333333-aaaa-bbbb-cccc-dddddddddddd', null),
        ('dddddddd-1111-2222-3333-444444444444', 'SpaceX''s Starship will revolutionize Mars colonization efforts.', '44444444-4444-4444-4444-444444444444', '44444444-aaaa-bbbb-cccc-dddddddddddd', null)
    `);

    // Create votes
    await queryRunner.query(`
      INSERT INTO "vote" (id, type, "userId", "debateId")
      VALUES 
        ('11111111-1111-2222-3333-444444444444', 'pro', '33333333-3333-3333-3333-333333333333', '11111111-aaaa-bbbb-cccc-dddddddddddd'),
        ('22222222-1111-2222-3333-444444444444', 'con', '44444444-4444-4444-4444-444444444444', '11111111-aaaa-bbbb-cccc-dddddddddddd'),
        ('33333333-1111-2222-3333-444444444444', 'pro', '33333333-3333-3333-3333-333333333333', '22222222-aaaa-bbbb-cccc-dddddddddddd'),
        ('44444444-1111-2222-3333-444444444444', 'pro', '44444444-4444-4444-4444-444444444444', '33333333-aaaa-bbbb-cccc-dddddddddddd')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove data in reverse order
    await queryRunner.query(`DELETE FROM "vote"`);
    await queryRunner.query(`DELETE FROM "comment"`);
    await queryRunner.query(`DELETE FROM "topic_debates_debate"`);
    await queryRunner.query(`DELETE FROM "debate"`);
    await queryRunner.query(`DELETE FROM "topic"`);
    await queryRunner.query(`DELETE FROM "user"`);
  }
} 
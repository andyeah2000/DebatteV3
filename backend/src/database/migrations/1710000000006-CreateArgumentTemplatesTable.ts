import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArgumentTemplatesTable1710000000006 implements MigrationInterface {
  name = 'CreateArgumentTemplatesTable1710000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "argument_templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying NOT NULL,
        "category" character varying NOT NULL,
        "requiredSections" text[] NOT NULL,
        "optionalSections" text[] NOT NULL,
        "validationRules" jsonb NOT NULL DEFAULT '{"minLength": 100, "maxLength": 5000}',
        "structure" jsonb NOT NULL DEFAULT '{
          "introduction": {
            "required": true,
            "minLength": 50,
            "maxLength": 500,
            "guidelines": ["Start with a clear thesis", "Provide context", "State your position"]
          },
          "mainPoints": {
            "required": true,
            "minPoints": 2,
            "maxPoints": 5,
            "guidelines": ["Support each point with evidence", "Use clear topic sentences", "Maintain logical flow"]
          },
          "evidence": {
            "required": true,
            "minSources": 1,
            "guidelines": ["Cite credible sources", "Include statistics when possible", "Explain relevance of evidence"]
          },
          "counterArguments": {
            "required": true,
            "minCounter": 1,
            "guidelines": ["Address opposing views fairly", "Provide rebuttals", "Acknowledge valid points"]
          },
          "conclusion": {
            "required": true,
            "minLength": 50,
            "maxLength": 300,
            "guidelines": ["Summarize main points", "Reinforce thesis", "End with impact"]
          }
        }',
        "suggestedTransitions" text[] NOT NULL DEFAULT ARRAY[
          'Furthermore',
          'However',
          'In addition',
          'On the other hand',
          'Consequently',
          'Therefore',
          'Moreover',
          'In contrast',
          'As a result',
          'For example'
        ],
        "examplePhrases" text[] NOT NULL DEFAULT ARRAY[
          'This argument is supported by...',
          'Research shows that...',
          'A key point to consider is...',
          'Critics might argue that...',
          'The evidence suggests...',
          'It is important to note that...',
          'This leads to the conclusion that...',
          'One compelling reason is...',
          'To illustrate this point...',
          'In examining the opposing view...'
        ],
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_argument_templates_id" PRIMARY KEY ("id")
      )
    `);

    // Create index for faster category searches
    await queryRunner.query(`
      CREATE INDEX "IDX_argument_templates_category" ON "argument_templates" ("category")
    `);

    // Create index for active templates
    await queryRunner.query(`
      CREATE INDEX "IDX_argument_templates_is_active" ON "argument_templates" ("isActive")
    `);

    // Insert default templates
    await queryRunner.query(`
      INSERT INTO "argument_templates" (
        "name",
        "description",
        "category",
        "requiredSections",
        "optionalSections"
      ) VALUES
      (
        'Standard Debate Argument',
        'A comprehensive template for structured debate arguments',
        'general',
        ARRAY['thesis', 'evidence', 'conclusion'],
        ARRAY['counter_arguments', 'examples']
      ),
      (
        'Policy Analysis',
        'Template for analyzing and arguing policy positions',
        'policy',
        ARRAY['problem_statement', 'policy_details', 'impact_analysis'],
        ARRAY['cost_analysis', 'implementation_timeline']
      ),
      (
        'Ethical Argument',
        'Template for discussing ethical implications and moral reasoning',
        'ethics',
        ARRAY['moral_premise', 'ethical_framework', 'implications'],
        ARRAY['case_studies', 'counter_perspectives']
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_argument_templates_is_active"`);
    await queryRunner.query(`DROP INDEX "IDX_argument_templates_category"`);

    // Drop table
    await queryRunner.query(`DROP TABLE "argument_templates"`);
  }
} 
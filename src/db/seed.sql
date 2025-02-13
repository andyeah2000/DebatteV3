-- Insert sample users
INSERT INTO users (id, email, username, avatar_url, roles) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@debattle.com', 'Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', ARRAY['admin', 'user']),
  ('22222222-2222-2222-2222-222222222222', 'moderator@debattle.com', 'Moderator', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mod', ARRAY['moderator', 'user']),
  ('33333333-3333-3333-3333-333333333333', 'expert@debattle.com', 'Expert', 'https://api.dicebear.com/7.x/avataaars/svg?seed=expert', ARRAY['expert', 'user']),
  ('44444444-4444-4444-4444-444444444444', 'user1@debattle.com', 'User1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', ARRAY['user']),
  ('55555555-5555-5555-5555-555555555555', 'user2@debattle.com', 'User2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', ARRAY['user']),
  ('66666666-6666-6666-6666-666666666666', 'expert2@debattle.com', 'Expert2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=expert2', ARRAY['expert', 'user']),
  ('77777777-7777-7777-7777-777777777777', 'user3@debattle.com', 'User3', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3', ARRAY['user']),
  ('88888888-8888-8888-8888-888888888888', 'user4@debattle.com', 'User4', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user4', ARRAY['user']),
  ('99999999-9999-9999-9999-999999999999', 'user5@debattle.com', 'User5', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user5', ARRAY['user']),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'expert3@debattle.com', 'Expert3', 'https://api.dicebear.com/7.x/avataaars/svg?seed=expert3', ARRAY['expert', 'user']);

-- Insert sample topics
INSERT INTO topics (id, title, description, category, trend) VALUES
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Künstliche Intelligenz', 'Chancen und Risiken der KI-Entwicklung', 'Technologie', 'up'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Klimawandel', 'Globale Herausforderungen und Lösungen', 'Umwelt', 'up'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Digitale Privatsphäre', 'Datenschutz im digitalen Zeitalter', 'Gesellschaft', 'neutral'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Zukunft der Arbeit', 'Remote Work und Automatisierung', 'Wirtschaft', 'up'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Nachhaltige Energie', 'Erneuerbare vs. konventionelle Energien', 'Umwelt', 'up'),
  ('11111111-aaaa-bbbb-cccc-dddddddddddd', 'Digitale Bildung', 'Chancen und Herausforderungen des digitalen Lernens', 'Bildung', 'up'),
  ('22222222-aaaa-bbbb-cccc-dddddddddddd', 'Soziale Medien', 'Einfluss auf Gesellschaft und Demokratie', 'Gesellschaft', 'up'),
  ('33333333-aaaa-bbbb-cccc-dddddddddddd', 'Blockchain', 'Potenzial und Risiken der Blockchain-Technologie', 'Technologie', 'neutral'),
  ('44444444-aaaa-bbbb-cccc-dddddddddddd', 'Gesundheitssystem', 'Reform und Digitalisierung des Gesundheitswesens', 'Healthcare', 'up'),
  ('55555555-aaaa-bbbb-cccc-dddddddddddd', 'Smart Cities', 'Zukunft der urbanen Entwicklung', 'Society', 'up');

-- Insert debates
INSERT INTO debates (id, title, description, category, author_id, is_active, is_featured, tags) VALUES
  ('11111111-2222-3333-4444-555555555555', 'Sollten KI-Systeme reguliert werden?', 
   'Eine Diskussion über die ethischen und praktischen Aspekte der KI-Regulierung.', 
   'Technologie', '33333333-3333-3333-3333-333333333333', true, true, 
   ARRAY['KI', 'Ethik', 'Regulierung', 'Innovation']),
   
  ('22222222-3333-4444-5555-666666666666', 'Ist 100% erneuerbare Energie bis 2035 realistisch?', 
   'Eine Analyse der technischen, wirtschaftlichen und politischen Herausforderungen.', 
   'Umwelt', '33333333-3333-3333-3333-333333333333', true, true, 
   ARRAY['Klimaschutz', 'Energie', 'Nachhaltigkeit']),
   
  ('33333333-4444-5555-6666-777777777777', 'Remote Work: Die neue Normalität?', 
   'Wie verändert Remote Work unsere Arbeitswelt?', 
   'Wirtschaft', '44444444-4444-4444-4444-444444444444', true, true, 
   ARRAY['Arbeit', 'Digitalisierung', 'Work-Life-Balance']);

-- Link debates to topics
INSERT INTO debate_topics (debate_id, topic_id) VALUES
  ('11111111-2222-3333-4444-555555555555', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
  ('22222222-3333-4444-5555-666666666666', 'ffffffff-ffff-ffff-ffff-ffffffffffff'),
  ('33333333-4444-5555-6666-777777777777', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');

-- Insert comments
INSERT INTO comments (id, content, debate_id, author_id, is_pro_argument, sources) VALUES
  ('aaaaaaaa-1111-2222-3333-444444444444', 
   'KI-Regulierung ist essentiell für die sichere Entwicklung.',
   '11111111-2222-3333-4444-555555555555', '33333333-3333-3333-3333-333333333333', true,
   ARRAY['https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai']),
   
  ('bbbbbbbb-1111-2222-3333-444444444444',
   'Der Umstieg auf 100% erneuerbare Energien ist technisch machbar.',
   '22222222-3333-4444-5555-666666666666', '44444444-4444-4444-4444-444444444444', true,
   ARRAY['https://www.nature.com/articles/s41467-019-08855-1']),
   
  ('cccccccc-1111-2222-3333-444444444444',
   'Remote Work erhöht die Produktivität und Mitarbeiterzufriedenheit.',
   '33333333-4444-5555-6666-777777777777', '55555555-5555-5555-5555-555555555555', true,
   ARRAY['https://hbr.org/2020/08/research-knowledge-workers-are-more-productive-from-home']);

-- Insert votes
INSERT INTO votes (debate_id, user_id, is_pro_vote) VALUES
  ('11111111-2222-3333-4444-555555555555', '33333333-3333-3333-3333-333333333333', true),
  ('11111111-2222-3333-4444-555555555555', '44444444-4444-4444-4444-444444444444', false),
  ('22222222-3333-4444-5555-666666666666', '33333333-3333-3333-3333-333333333333', true),
  ('33333333-4444-5555-6666-777777777777', '44444444-4444-4444-4444-444444444444', true);

-- Insert timeline events
INSERT INTO timeline_events (debate_id, type, user_id, content) VALUES
  ('11111111-2222-3333-4444-555555555555', 'DEBATE_CREATED', '33333333-3333-3333-3333-333333333333', 'Debatte wurde erstellt'),
  ('22222222-3333-4444-5555-666666666666', 'DEBATE_CREATED', '33333333-3333-3333-3333-333333333333', 'Debatte wurde erstellt'),
  ('33333333-4444-5555-6666-777777777777', 'DEBATE_CREATED', '44444444-4444-4444-4444-444444444444', 'Debatte wurde erstellt');

-- Insert debate phases
INSERT INTO debate_phases (debate_id, name, start_time, end_time, is_active, requirements) VALUES
  ('11111111-2222-3333-4444-555555555555', 'DISCUSSION', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '5 days', true, ARRAY['min_participants=5']),
  ('11111111-2222-3333-4444-555555555555', 'VOTING', CURRENT_TIMESTAMP + INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '7 days', false, ARRAY['min_arguments=3']),
  ('22222222-3333-4444-5555-666666666666', 'DISCUSSION', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '4 days', true, ARRAY['min_participants=5']),
  ('22222222-3333-4444-5555-666666666666', 'VOTING', CURRENT_TIMESTAMP + INTERVAL '4 days', CURRENT_TIMESTAMP + INTERVAL '6 days', false, ARRAY['min_arguments=3']),
  ('33333333-4444-5555-6666-777777777777', 'DISCUSSION', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '6 days', true, ARRAY['min_participants=5']),
  ('33333333-4444-5555-6666-777777777777', 'VOTING', CURRENT_TIMESTAMP + INTERVAL '6 days', CURRENT_TIMESTAMP + INTERVAL '8 days', false, ARRAY['min_arguments=3']); 
-- Insert sample users
INSERT INTO users (id, email, username, avatar_url, roles) VALUES
  ('11111111-1111-1111-1111-111111111111', 'admin@debattle.com', 'Admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', ARRAY['admin', 'user']),
  ('22222222-2222-2222-2222-222222222222', 'moderator@debattle.com', 'Moderator', 'https://api.dicebear.com/7.x/avataaars/svg?seed=mod', ARRAY['moderator', 'user']),
  ('33333333-3333-3333-3333-333333333333', 'expert@debattle.com', 'Expert', 'https://api.dicebear.com/7.x/avataaars/svg?seed=expert', ARRAY['expert', 'user']),
  ('44444444-4444-4444-4444-444444444444', 'user1@debattle.com', 'User1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user1', ARRAY['user']),
  ('55555555-5555-5555-5555-555555555555', 'user2@debattle.com', 'User2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2', ARRAY['user']);

-- Insert sample topics
INSERT INTO topics (id, title, description, category, trend) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Künstliche Intelligenz', 'Chancen und Risiken der KI-Entwicklung', 'Technologie', 'up'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Klimawandel', 'Globale Herausforderungen und Lösungen', 'Umwelt', 'up'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Digitale Privatsphäre', 'Datenschutz im digitalen Zeitalter', 'Gesellschaft', 'neutral'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Zukunft der Arbeit', 'Remote Work und Automatisierung', 'Wirtschaft', 'up'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Nachhaltige Energie', 'Erneuerbare vs. konventionelle Energien', 'Umwelt', 'up');

-- Insert featured debates
INSERT INTO debates (id, title, description, category, author_id, is_active, is_featured, tags) VALUES
  ('11111111-2222-3333-4444-555555555555', 'Sollten KI-Systeme reguliert werden?', 
   'Eine Diskussion über die ethischen und praktischen Aspekte der KI-Regulierung. Welche Regeln brauchen wir für sichere und faire KI-Entwicklung?', 
   'Technologie', '33333333-3333-3333-3333-333333333333', true, true, 
   ARRAY['KI', 'Ethik', 'Regulierung', 'Innovation']),
   
  ('22222222-3333-4444-5555-666666666666', 'Ist 100% erneuerbare Energie bis 2035 realistisch?', 
   'Eine Analyse der technischen, wirtschaftlichen und politischen Herausforderungen beim Umstieg auf erneuerbare Energien.', 
   'Umwelt', '33333333-3333-3333-3333-333333333333', true, true, 
   ARRAY['Klimaschutz', 'Energie', 'Nachhaltigkeit']),
   
  ('33333333-4444-5555-6666-777777777777', 'Remote Work: Die neue Normalität?', 
   'Wie verändert Remote Work unsere Arbeitswelt? Vorteile, Nachteile und Zukunftsperspektiven der dezentralen Arbeit.', 
   'Wirtschaft', '44444444-4444-4444-4444-444444444444', true, true, 
   ARRAY['Arbeit', 'Digitalisierung', 'Work-Life-Balance']);

-- Insert regular debates
INSERT INTO debates (id, title, description, category, author_id, is_active, is_featured, tags) VALUES
  ('44444444-5555-6666-7777-888888888888', 'Brauchen wir ein bedingungsloses Grundeinkommen?', 
   'Eine Debatte über soziale Sicherheit, Automatisierung und die Zukunft unseres Sozialsystems.', 
   'Gesellschaft', '44444444-4444-4444-4444-444444444444', true, false, 
   ARRAY['Soziales', 'Wirtschaft', 'Politik']),
   
  ('55555555-6666-7777-8888-999999999999', 'Digitale Bildung: Chance oder Risiko?', 
   'Wie verändert die Digitalisierung unser Bildungssystem? Vor- und Nachteile digitaler Lernmethoden.', 
   'Bildung', '55555555-5555-5555-5555-555555555555', true, false, 
   ARRAY['Bildung', 'Digitalisierung', 'Zukunft']);

-- Link debates to topics
INSERT INTO debate_topics (debate_id, topic_id) VALUES
  ('11111111-2222-3333-4444-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('22222222-3333-4444-5555-666666666666', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  ('33333333-4444-5555-6666-777777777777', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  ('44444444-5555-6666-7777-888888888888', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  ('55555555-6666-7777-8888-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');

-- Insert pro arguments
INSERT INTO comments (id, content, debate_id, author_id, is_pro_argument, sources) VALUES
  ('aaaaaaaa-1111-2222-3333-444444444444', 
   'KI-Regulierung ist essentiell für die sichere Entwicklung. Ohne klare Regeln riskieren wir unkontrollierte KI-Systeme mit potenziell gefährlichen Auswirkungen. Die EU-KI-Verordnung zeigt einen guten Weg auf.',
   '11111111-2222-3333-4444-555555555555', '33333333-3333-3333-3333-333333333333', true,
   ARRAY['https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai']),
   
  ('bbbbbbbb-1111-2222-3333-444444444444',
   'Der Umstieg auf 100% erneuerbare Energien ist technisch machbar. Aktuelle Studien zeigen, dass die notwendigen Technologien bereits existieren und wirtschaftlich sind.',
   '22222222-3333-4444-5555-666666666666', '44444444-4444-4444-4444-444444444444', true,
   ARRAY['https://www.nature.com/articles/s41467-019-08855-1']),
   
  ('cccccccc-1111-2222-3333-444444444444',
   'Remote Work erhöht die Produktivität und Mitarbeiterzufriedenheit. Studien zeigen eine bessere Work-Life-Balance und reduzierte Pendelzeiten.',
   '33333333-4444-5555-6666-777777777777', '55555555-5555-5555-5555-555555555555', true,
   ARRAY['https://hbr.org/2020/08/research-knowledge-workers-are-more-productive-from-home']);

-- Insert con arguments
INSERT INTO comments (id, content, debate_id, author_id, is_pro_argument, sources) VALUES
  ('dddddddd-1111-2222-3333-444444444444',
   'Zu strenge KI-Regulierung könnte Innovation hemmen. Wir brauchen einen ausgewogenen Ansatz, der Sicherheit und Fortschritt vereint.',
   '11111111-2222-3333-4444-555555555555', '44444444-4444-4444-4444-444444444444', false,
   ARRAY['https://www.brookings.edu/articles/how-regulation-could-help-or-hurt-ai-innovation/']),
   
  ('eeeeeeee-1111-2222-3333-444444444444',
   'Die Infrastrukturkosten für 100% erneuerbare Energien sind enorm. Die Umsetzung bis 2035 ist wirtschaftlich nicht realistisch.',
   '22222222-3333-4444-5555-666666666666', '55555555-5555-5555-5555-555555555555', false,
   ARRAY['https://www.iea.org/reports/net-zero-by-2050']),
   
  ('ffffffff-1111-2222-3333-444444444444',
   'Remote Work kann zu sozialer Isolation und erschwerter Teamarbeit führen. Persönliche Interaktion ist für Kreativität und Innovation wichtig.',
   '33333333-4444-5555-6666-777777777777', '33333333-3333-3333-3333-333333333333', false,
   ARRAY['https://www.nature.com/articles/s41562-021-01196-4']);

-- Insert votes
INSERT INTO votes (debate_id, user_id, is_pro_vote) VALUES
  ('11111111-2222-3333-4444-555555555555', '33333333-3333-3333-3333-333333333333', true),
  ('11111111-2222-3333-4444-555555555555', '44444444-4444-4444-4444-444444444444', false),
  ('11111111-2222-3333-4444-555555555555', '55555555-5555-5555-5555-555555555555', true),
  ('22222222-3333-4444-5555-666666666666', '33333333-3333-3333-3333-333333333333', true),
  ('22222222-3333-4444-5555-666666666666', '44444444-4444-4444-4444-444444444444', true),
  ('22222222-3333-4444-5555-666666666666', '55555555-5555-5555-5555-555555555555', false),
  ('33333333-4444-5555-6666-777777777777', '33333333-3333-3333-3333-333333333333', false),
  ('33333333-4444-5555-6666-777777777777', '44444444-4444-4444-4444-444444444444', true),
  ('33333333-4444-5555-6666-777777777777', '55555555-5555-5555-5555-555555555555', true);

-- Insert timeline events
INSERT INTO timeline_events (debate_id, type, user_id, content) VALUES
  ('11111111-2222-3333-4444-555555555555', 'DEBATE_CREATED', '33333333-3333-3333-3333-333333333333', 'Debatte wurde erstellt'),
  ('11111111-2222-3333-4444-555555555555', 'COMMENT_ADDED', '33333333-3333-3333-3333-333333333333', 'Neues Pro-Argument hinzugefügt'),
  ('11111111-2222-3333-4444-555555555555', 'COMMENT_ADDED', '44444444-4444-4444-4444-444444444444', 'Neues Contra-Argument hinzugefügt'),
  ('22222222-3333-4444-5555-666666666666', 'DEBATE_CREATED', '33333333-3333-3333-3333-333333333333', 'Debatte wurde erstellt'),
  ('22222222-3333-4444-5555-666666666666', 'MILESTONE', null, '5 Teilnehmer erreicht'),
  ('33333333-4444-5555-6666-777777777777', 'DEBATE_CREATED', '44444444-4444-4444-4444-444444444444', 'Debatte wurde erstellt'),
  ('33333333-4444-5555-6666-777777777777', 'PHASE_CHANGE', null, 'Diskussionsphase gestartet');

-- Insert debate phases
INSERT INTO debate_phases (debate_id, name, start_time, end_time, is_active, requirements) VALUES
  ('11111111-2222-3333-4444-555555555555', 'DISCUSSION', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '5 days', true, ARRAY['min_participants=5']),
  ('11111111-2222-3333-4444-555555555555', 'VOTING', CURRENT_TIMESTAMP + INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '7 days', false, ARRAY['min_arguments=3']),
  ('22222222-3333-4444-5555-666666666666', 'DISCUSSION', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '4 days', true, ARRAY['min_participants=5']),
  ('22222222-3333-4444-5555-666666666666', 'VOTING', CURRENT_TIMESTAMP + INTERVAL '4 days', CURRENT_TIMESTAMP + INTERVAL '6 days', false, ARRAY['min_arguments=3']),
  ('33333333-4444-5555-6666-777777777777', 'DISCUSSION', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '6 days', true, ARRAY['min_participants=5']),
  ('33333333-4444-5555-6666-777777777777', 'VOTING', CURRENT_TIMESTAMP + INTERVAL '6 days', CURRENT_TIMESTAMP + INTERVAL '8 days', false, ARRAY['min_arguments=3']); 
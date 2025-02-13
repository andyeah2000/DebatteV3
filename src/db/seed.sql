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
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'expert3@debattle.com', 'Expert3', 'https://api.dicebear.com/7.x/avataaars/svg?seed=expert3', ARRAY['expert', 'user']);

-- Insert sample topics
INSERT INTO topics (id, title, description, category, trend) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Künstliche Intelligenz', 'Chancen und Risiken der KI-Entwicklung', 'Technologie', 'up'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Klimawandel', 'Globale Herausforderungen und Lösungen', 'Umwelt', 'up'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Digitale Privatsphäre', 'Datenschutz im digitalen Zeitalter', 'Gesellschaft', 'neutral'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Zukunft der Arbeit', 'Remote Work und Automatisierung', 'Wirtschaft', 'up'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Nachhaltige Energie', 'Erneuerbare vs. konventionelle Energien', 'Umwelt', 'up'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Digitale Bildung', 'Chancen und Herausforderungen des digitalen Lernens', 'Bildung', 'up'),
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'Soziale Medien', 'Einfluss auf Gesellschaft und Demokratie', 'Gesellschaft', 'up'),
  ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Blockchain', 'Potenzial und Risiken der Blockchain-Technologie', 'Technologie', 'neutral'),
  ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Gesundheitssystem', 'Reform und Digitalisierung des Gesundheitswesens', 'Healthcare', 'up'),
  ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'Smart Cities', 'Zukunft der urbanen Entwicklung', 'Society', 'up');

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
   ARRAY['Arbeit', 'Digitalisierung', 'Work-Life-Balance']),
   
  ('66666666-7777-8888-9999-aaaaaaaaaaaa', 'Sollte KI in der Medizin eingesetzt werden?', 
   'Eine Diskussion über Chancen und Risiken von KI-gestützter Diagnostik und Behandlung.', 
   'Healthcare', '66666666-6666-6666-6666-666666666666', true, true, 
   ARRAY['KI', 'Medizin', 'Ethik', 'Innovation']),
   
  ('77777777-8888-9999-aaaa-bbbbbbbbbbbb', 'Brauchen wir ein digitales Grundrecht?', 
   'Diskussion über digitale Bürgerrechte und Datenschutz im 21. Jahrhundert.', 
   'Society', '77777777-7777-7777-7777-777777777777', true, false, 
   ARRAY['Digitalisierung', 'Recht', 'Datenschutz']),
   
  ('88888888-9999-aaaa-bbbb-cccccccccccc', 'Blockchain in der öffentlichen Verwaltung', 
   'Potenziale und Herausforderungen der Blockchain-Technologie für Behörden und Verwaltung.', 
   'Technology', '88888888-8888-8888-8888-888888888888', true, false, 
   ARRAY['Blockchain', 'E-Government', 'Innovation']),
   
  ('99999999-aaaa-bbbb-cccc-dddddddddddd', 'Zukunft der Mobilität', 
   'Wie verändert sich unsere Fortbewegung durch autonomes Fahren und neue Technologien?', 
   'Technology', '99999999-9999-9999-9999-999999999999', true, true, 
   ARRAY['Mobilität', 'Autonomes Fahren', 'Nachhaltigkeit']),
   
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Social Media Regulierung', 
   'Brauchen wir strengere Regeln für soziale Medien?', 
   'Society', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', true, false, 
   ARRAY['Social Media', 'Regulierung', 'Demokratie']);

-- Insert regular debates
INSERT INTO debates (id, title, description, category, author_id, is_active, is_featured, tags) VALUES
  ('44444444-5555-6666-7777-888888888888', 'Brauchen wir ein bedingungsloses Grundeinkommen?', 
   'Eine Debatte über soziale Sicherheit, Automatisierung und die Zukunft unseres Sozialsystems.', 
   'Gesellschaft', '44444444-4444-4444-4444-444444444444', true, false, 
   ARRAY['Soziales', 'Wirtschaft', 'Politik']),
   
  ('55555555-6666-7777-8888-999999999999', 'Digitale Bildung: Chance oder Risiko?', 
   'Wie verändert die Digitalisierung unser Bildungssystem? Vor- und Nachteile digitaler Lernmethoden.', 
   'Bildung', '55555555-5555-5555-5555-555555555555', true, false, 
   ARRAY['Bildung', 'Digitalisierung', 'Zukunft']),
   
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'DEBATE_CREATED', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Neue Debatte erstellt');

-- Link debates to topics
INSERT INTO debate_topics (debate_id, topic_id) VALUES
  ('11111111-2222-3333-4444-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('22222222-3333-4444-5555-666666666666', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
  ('33333333-4444-5555-6666-777777777777', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  ('44444444-5555-6666-7777-888888888888', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
  ('55555555-6666-7777-8888-999999999999', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('66666666-7777-8888-9999-aaaaaaaaaaaa', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii'),
  ('77777777-8888-9999-aaaa-bbbbbbbbbbbb', 'gggggggg-gggg-gggg-gggg-gggggggggggg'),
  ('88888888-9999-aaaa-bbbb-cccccccccccc', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh'),
  ('99999999-aaaa-bbbb-cccc-dddddddddddd', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj'),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'gggggggg-gggg-gggg-gggg-gggggggggggg');

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
   ARRAY['https://hbr.org/2020/08/research-knowledge-workers-are-more-productive-from-home']),
   
  ('gggggggg-1111-2222-3333-444444444444',
   'KI kann die Genauigkeit der Diagnosen erheblich verbessern und Ärzte bei Routineaufgaben entlasten.',
   '66666666-7777-8888-9999-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', true,
   ARRAY['https://www.nature.com/articles/s41591-020-0942-0']),
   
  ('hhhhhhhh-1111-2222-3333-444444444444',
   'Ein digitales Grundrecht würde den Schutz persönlicher Daten stärken und klare Regeln schaffen.',
   '77777777-8888-9999-aaaa-bbbbbbbbbbbb', '77777777-7777-7777-7777-777777777777', true,
   ARRAY['https://www.bverfg.de/digitale-grundrechte']),
   
  ('iiiiiiii-1111-2222-3333-444444444444',
   'Blockchain-Technologie kann Verwaltungsprozesse transparent und fälschungssicher machen.',
   '88888888-9999-aaaa-bbbb-cccccccccccc', '88888888-8888-8888-8888-888888888888', true,
   ARRAY['https://www.blockchain-government.org/cases']),
   
  ('jjjjjjjj-1111-2222-3333-444444444444',
   'Autonomes Fahren wird Unfälle reduzieren und den Verkehrsfluss optimieren.',
   '99999999-aaaa-bbbb-cccc-dddddddddddd', '99999999-9999-9999-9999-999999999999', true,
   ARRAY['https://www.autonomous-driving-safety.org']),
   
  ('kkkkkkkk-1111-2222-3333-444444444444',
   'Strengere Regulierung würde Fake News und Hassrede eindämmen.',
   'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', true,
   ARRAY['https://www.social-media-regulation.eu/studies']);

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
   ARRAY['https://www.nature.com/articles/s41562-021-01196-4']),
   
  ('llllllll-1111-2222-3333-444444444444',
   'KI kann menschliches Urteilsvermögen nicht ersetzen und birgt Risiken bei Fehlentscheidungen.',
   '66666666-7777-8888-9999-aaaaaaaaaaaa', '77777777-7777-7777-7777-777777777777', false,
   ARRAY['https://www.medical-ethics.org/ai-risks']),
   
  ('mmmmmmmm-1111-2222-3333-444444444444',
   'Ein weiteres Grundrecht würde nur zu mehr Bürokratie führen, bestehende Gesetze reichen aus.',
   '77777777-8888-9999-aaaa-bbbbbbbbbbbb', '88888888-8888-8888-8888-888888888888', false,
   ARRAY['https://www.digital-law-review.com/analysis']),
   
  ('nnnnnnnn-1111-2222-3333-444444444444',
   'Blockchain ist zu ressourcenintensiv und noch nicht ausgereift für den Behördeneinsatz.',
   '88888888-9999-aaaa-bbbb-cccccccccccc', '99999999-9999-9999-9999-999999999999', false,
   ARRAY['https://www.blockchain-criticism.org/energy']),
   
  ('oooooooo-1111-2222-3333-444444444444',
   'Die Technologie für vollautonomes Fahren ist noch nicht sicher genug.',
   '99999999-aaaa-bbbb-cccc-dddddddddddd', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', false,
   ARRAY['https://www.autonomous-driving-risks.com']),
   
  ('pppppppp-1111-2222-3333-444444444444',
   'Zu strenge Regulierung könnte Innovation und freie Meinungsäußerung einschränken.',
   'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '66666666-6666-6666-6666-666666666666', false,
   ARRAY['https://www.free-speech-online.org/regulation']);

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
  ('33333333-4444-5555-6666-777777777777', '55555555-5555-5555-5555-555555555555', true),
  ('66666666-7777-8888-9999-aaaaaaaaaaaa', '66666666-6666-6666-6666-666666666666', true),
  ('66666666-7777-8888-9999-aaaaaaaaaaaa', '77777777-7777-7777-7777-777777777777', false),
  ('66666666-7777-8888-9999-aaaaaaaaaaaa', '88888888-8888-8888-8888-888888888888', true),
  ('77777777-8888-9999-aaaa-bbbbbbbbbbbb', '88888888-8888-8888-8888-888888888888', true),
  ('77777777-8888-9999-aaaa-bbbbbbbbbbbb', '99999999-9999-9999-9999-999999999999', false),
  ('88888888-9999-aaaa-bbbb-cccccccccccc', '99999999-9999-9999-9999-999999999999', true),
  ('88888888-9999-aaaa-bbbb-cccccccccccc', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', false),
  ('99999999-aaaa-bbbb-cccc-dddddddddddd', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', true),
  ('99999999-aaaa-bbbb-cccc-dddddddddddd', '66666666-6666-6666-6666-666666666666', true),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '66666666-6666-6666-6666-666666666666', false),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', '77777777-7777-7777-7777-777777777777', true);

-- Insert timeline events
INSERT INTO timeline_events (debate_id, type, user_id, content) VALUES
  ('11111111-2222-3333-4444-555555555555', 'DEBATE_CREATED', '33333333-3333-3333-3333-333333333333', 'Debatte wurde erstellt'),
  ('11111111-2222-3333-4444-555555555555', 'COMMENT_ADDED', '33333333-3333-3333-3333-333333333333', 'Neues Pro-Argument hinzugefügt'),
  ('11111111-2222-3333-4444-555555555555', 'COMMENT_ADDED', '44444444-4444-4444-4444-444444444444', 'Neues Contra-Argument hinzugefügt'),
  ('22222222-3333-4444-5555-666666666666', 'DEBATE_CREATED', '33333333-3333-3333-3333-333333333333', 'Debatte wurde erstellt'),
  ('22222222-3333-4444-5555-666666666666', 'MILESTONE', null, '5 Teilnehmer erreicht'),
  ('33333333-4444-5555-6666-777777777777', 'DEBATE_CREATED', '44444444-4444-4444-4444-444444444444', 'Debatte wurde erstellt'),
  ('33333333-4444-5555-6666-777777777777', 'PHASE_CHANGE', null, 'Diskussionsphase gestartet'),
  ('66666666-7777-8888-9999-aaaaaaaaaaaa', 'DEBATE_CREATED', '66666666-6666-6666-6666-666666666666', 'Neue Debatte erstellt'),
  ('66666666-7777-8888-9999-aaaaaaaaaaaa', 'COMMENT_ADDED', '77777777-7777-7777-7777-777777777777', 'Neues Contra-Argument'),
  ('77777777-8888-9999-aaaa-bbbbbbbbbbbb', 'DEBATE_CREATED', '77777777-7777-7777-7777-777777777777', 'Neue Debatte erstellt'),
  ('77777777-8888-9999-aaaa-bbbbbbbbbbbb', 'MILESTONE', null, '10 Teilnehmer erreicht'),
  ('88888888-9999-aaaa-bbbb-cccccccccccc', 'DEBATE_CREATED', '88888888-8888-8888-8888-888888888888', 'Neue Debatte erstellt'),
  ('88888888-9999-aaaa-bbbb-cccccccccccc', 'PHASE_CHANGE', null, 'Abstimmungsphase beginnt'),
  ('99999999-aaaa-bbbb-cccc-dddddddddddd', 'DEBATE_CREATED', '99999999-9999-9999-9999-999999999999', 'Neue Debatte erstellt'),
  ('99999999-aaaa-bbbb-cccc-dddddddddddd', 'COMMENT_ADDED', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Neues Pro-Argument'),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'DEBATE_CREATED', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Neue Debatte erstellt'),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'MILESTONE', null, '5 Kommentare erreicht');

-- Insert debate phases
INSERT INTO debate_phases (debate_id, name, start_time, end_time, is_active, requirements) VALUES
  ('11111111-2222-3333-4444-555555555555', 'DISCUSSION', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '5 days', true, ARRAY['min_participants=5']),
  ('11111111-2222-3333-4444-555555555555', 'VOTING', CURRENT_TIMESTAMP + INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '7 days', false, ARRAY['min_arguments=3']),
  ('22222222-3333-4444-5555-666666666666', 'DISCUSSION', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '4 days', true, ARRAY['min_participants=5']),
  ('22222222-3333-4444-5555-666666666666', 'VOTING', CURRENT_TIMESTAMP + INTERVAL '4 days', CURRENT_TIMESTAMP + INTERVAL '6 days', false, ARRAY['min_arguments=3']),
  ('33333333-4444-5555-6666-777777777777', 'DISCUSSION', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '6 days', true, ARRAY['min_participants=5']),
  ('33333333-4444-5555-6666-777777777777', 'VOTING', CURRENT_TIMESTAMP + INTERVAL '6 days', CURRENT_TIMESTAMP + INTERVAL '8 days', false, ARRAY['min_arguments=3']),
  ('66666666-7777-8888-9999-aaaaaaaaaaaa', 'DISCUSSION', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP + INTERVAL '4 days', true, ARRAY['min_participants=5']),
  ('66666666-7777-8888-9999-aaaaaaaaaaaa', 'VOTING', CURRENT_TIMESTAMP + INTERVAL '4 days', CURRENT_TIMESTAMP + INTERVAL '6 days', false, ARRAY['min_arguments=3']),
  ('77777777-8888-9999-aaaa-bbbbbbbbbbbb', 'DISCUSSION', CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '2 days', true, ARRAY['min_participants=5']),
  ('77777777-8888-9999-aaaa-bbbbbbbbbbbb', 'VOTING', CURRENT_TIMESTAMP + INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '4 days', false, ARRAY['min_arguments=3']),
  ('88888888-9999-aaaa-bbbb-cccccccccccc', 'DISCUSSION', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP, false, ARRAY['min_participants=5']),
  ('88888888-9999-aaaa-bbbb-cccccccccccc', 'VOTING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '2 days', true, ARRAY['min_arguments=3']),
  ('99999999-aaaa-bbbb-cccc-dddddddddddd', 'DISCUSSION', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '6 days', true, ARRAY['min_participants=5']),
  ('99999999-aaaa-bbbb-cccc-dddddddddddd', 'VOTING', CURRENT_TIMESTAMP + INTERVAL '6 days', CURRENT_TIMESTAMP + INTERVAL '8 days', false, ARRAY['min_arguments=3']),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'DISCUSSION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days', true, ARRAY['min_participants=5']),
  ('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'VOTING', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP + INTERVAL '9 days', false, ARRAY['min_arguments=3']); 
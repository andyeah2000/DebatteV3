-- Drop triggers first
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_debates_updated_at ON debates;
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
DROP TRIGGER IF EXISTS update_topics_updated_at ON topics;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Delete data from tables in correct order
DELETE FROM debate_phases;
DELETE FROM timeline_events;
DELETE FROM votes;
DELETE FROM comments;
DELETE FROM debate_topics;
DELETE FROM debates;
DELETE FROM topics;
DELETE FROM users; 
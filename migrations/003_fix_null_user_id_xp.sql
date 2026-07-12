-- Fix for shared XP issue: delete any user_stats rows with NULL user_id
-- These rows would cause all users to share the same XP

DELETE FROM user_stats 
WHERE user_id IS NULL;

-- Verify each user_id is unique by checking for duplicates
-- This query should return no results if database is clean
SELECT user_id, COUNT(*) as count
FROM user_stats
WHERE user_id IS NOT NULL
GROUP BY user_id
HAVING COUNT(*) > 1;

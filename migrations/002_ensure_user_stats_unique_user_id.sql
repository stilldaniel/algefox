-- Add unique constraint to user_stats.user_id if it doesn't exist
-- This ensures each user can only have one stats row

-- First, check if there are any duplicate user_ids and consolidate them
WITH duplicates AS (
  SELECT user_id, COUNT(*) as count, MAX(id) as keep_id, MAX(xp) as max_xp
  FROM user_stats
  GROUP BY user_id
  HAVING COUNT(*) > 1
)
UPDATE user_stats
SET xp = duplicates.max_xp
FROM duplicates
WHERE user_stats.user_id = duplicates.user_id
AND user_stats.id = duplicates.keep_id;

-- Delete duplicate rows (keeping only the one with highest XP)
DELETE FROM user_stats
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM user_stats
  ORDER BY user_id, xp DESC
);

-- Now add the unique constraint
ALTER TABLE user_stats
ADD CONSTRAINT user_stats_user_id_unique UNIQUE (user_id);

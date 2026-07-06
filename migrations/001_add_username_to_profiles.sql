-- Add username column to profiles and a unique lower-case index
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS username text;

-- Create a case-insensitive unique index on username
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower
  ON profiles (LOWER(username));

# Leaderboard Setup Guide

## Database Setup for Supabase

Run the following SQL in your Supabase SQL Editor to create the `user_stats` table:

```sql
-- Create user_stats table for tracking XP and leaderboard rankings
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_stats_xp ON user_stats(xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view leaderboard stats" ON user_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Steps to Complete:

1. Go to Supabase Dashboard → Your Project → SQL Editor
2. Click "New Query"
3. Paste the SQL above
4. Click "Run"
5. Verify the table was created in the "Tables" section

The system is now ready to track XP and power the real-time leaderboard!

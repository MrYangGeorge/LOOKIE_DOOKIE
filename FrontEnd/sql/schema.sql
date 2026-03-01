-- ============================================================
-- Lookie Dookie Database Schema
-- Run this in your Supabase SQL Editor to set up all tables
-- ============================================================

-- ============================================================
-- Table: user_settings
-- One row per user, stores all user preferences
-- ============================================================
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Timer settings
  focus_duration    INT     NOT NULL DEFAULT 1500,
  break_duration    INT     NOT NULL DEFAULT 300,
  pomodoro_enabled  BOOLEAN NOT NULL DEFAULT true,

  -- Detection settings
  sleepy_threshold_sec INT NOT NULL DEFAULT 5,

  -- Sound settings
  alarm_sound        TEXT,
  ambient_preference TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Table: sessions
-- One row per completed (or partially completed) focus session
-- ============================================================
CREATE TABLE sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Session timing
  date          DATE        NOT NULL DEFAULT CURRENT_DATE,
  start_time    TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time      TIMESTAMPTZ,

  -- Session metrics
  focus_seconds        INT NOT NULL DEFAULT 0,
  sleepy_count         INT NOT NULL DEFAULT 0,
  sleepy_total_seconds INT NOT NULL DEFAULT 0,

  -- Session metadata
  mode      TEXT    NOT NULL DEFAULT 'pomodoro',
  completed BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_user_date ON sessions(user_id, date DESC);

-- ============================================================
-- Table: earned_stickers
-- Tracks which stickers each user has unlocked
-- ============================================================
CREATE TABLE earned_stickers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sticker_id  TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(user_id, sticker_id)
);

CREATE INDEX idx_earned_stickers_user ON earned_stickers(user_id);

-- ============================================================
-- Table: streaks
-- Tracks consecutive daily focus streaks per user
-- ============================================================
CREATE TABLE streaks (
  user_id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak  INT  NOT NULL DEFAULT 0,
  longest_streak  INT  NOT NULL DEFAULT 0,
  last_focus_date DATE,

  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Enable Row Level Security (RLS) on all tables
-- ============================================================
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE earned_stickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- user_settings policies
-- ============================================================
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- sessions policies
-- ============================================================
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- earned_stickers policies
-- ============================================================
CREATE POLICY "Users can view their own stickers"
  ON earned_stickers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stickers"
  ON earned_stickers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- streaks policies
-- ============================================================
CREATE POLICY "Users can view their own streak"
  ON streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak"
  ON streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak"
  ON streaks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Auto-initialize new users (trigger)
-- Creates user_settings and streaks rows on sign-up
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id) VALUES (NEW.id);
  INSERT INTO streaks (user_id, current_streak, longest_streak) VALUES (NEW.id, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

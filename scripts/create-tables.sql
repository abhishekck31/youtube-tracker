-- Create educators table
CREATE TABLE IF NOT EXISTS educators (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  avatar TEXT,
  committed_hours INTEGER NOT NULL DEFAULT 0,
  completed_hours INTEGER NOT NULL DEFAULT 0,
  total_videos INTEGER NOT NULL DEFAULT 0,
  avg_engagement REAL NOT NULL DEFAULT 0,
  last_updated TEXT NOT NULL,
  trend TEXT NOT NULL DEFAULT '0%',
  status TEXT NOT NULL DEFAULT 'active',
  join_date TEXT NOT NULL,
  specialization TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  educator_id TEXT NOT NULL REFERENCES educators(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration TEXT NOT NULL,
  views TEXT NOT NULL,
  upload_date TEXT NOT NULL,
  thumbnail TEXT,
  channel_name TEXT NOT NULL,
  description TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  engagement REAL NOT NULL DEFAULT 0,
  url TEXT NOT NULL,
  added_date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_educator_id ON videos(educator_id);
CREATE INDEX IF NOT EXISTS idx_videos_added_date ON videos(added_date);
CREATE INDEX IF NOT EXISTS idx_educators_name ON educators(name);

-- Enable Row Level Security (RLS)
ALTER TABLE educators ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on educators" ON educators FOR ALL USING (true);
CREATE POLICY "Allow all operations on videos" ON videos FOR ALL USING (true);

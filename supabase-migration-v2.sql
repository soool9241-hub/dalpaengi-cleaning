CREATE TABLE cleaning_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cleaner_name TEXT NOT NULL,
  cleaner_phone TEXT,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'reviewed', 'rejected')),
  reviewer_name TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cleaning_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES cleaning_sessions(id) ON DELETE CASCADE,
  zone_id TEXT NOT NULL,
  zone_name TEXT NOT NULL,
  zone_category TEXT NOT NULL CHECK (zone_category IN ('interior', 'exterior')),
  task_index INT NOT NULL,
  task_text TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, zone_id, task_index)
);

CREATE TABLE cleaning_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES cleaning_sessions(id) ON DELETE CASCADE,
  zone_id TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  storage_path TEXT NOT NULL,
  public_url TEXT,
  file_name TEXT,
  file_size INT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cleaning_manuals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id TEXT NOT NULL UNIQUE,
  zone_name TEXT NOT NULL,
  video_url TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_date ON cleaning_sessions(session_date DESC);
CREATE INDEX idx_sessions_status ON cleaning_sessions(status);
CREATE INDEX idx_checks_session ON cleaning_checks(session_id);
CREATE INDEX idx_checks_zone ON cleaning_checks(zone_id);
CREATE INDEX idx_media_session ON cleaning_media(session_id);
CREATE INDEX idx_media_zone ON cleaning_media(zone_id);

ALTER TABLE cleaning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_manuals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "all_sessions" ON cleaning_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_checks" ON cleaning_checks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_media" ON cleaning_media FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_manuals" ON cleaning_manuals FOR ALL USING (true) WITH CHECK (true);

INSERT INTO cleaning_manuals (zone_id, zone_name, description) VALUES
  ('living', E'\uAC70\uC2E4', E'30\uD3C9+ \uB300\uD615 \uAC70\uC2E4'),
  ('small_room_left', E'\uC88C\uCE21 \uC791\uC740\uBC291', E'\uC88C\uCE21 \uC18C\uD615 \uAC1D\uC2E4'),
  ('small_room_right', E'\uC6B0\uCE21 \uC791\uC740\uBC292', E'\uC6B0\uCE21 \uC18C\uD615 \uAC1D\uC2E4'),
  ('big_room_1', E'\uD070\uBC291', E'\uB300\uD615 \uAC1D\uC2E4 1'),
  ('big_room_2', E'\uD070\uBC292', E'\uB300\uD615 \uAC1D\uC2E4 2'),
  ('bathroom_female', E'\uC5EC\uC790\uD654\uC7A5\uC2E4', E'\uC5EC\uC131 \uC804\uC6A9 \uD654\uC7A5\uC2E4'),
  ('bathroom_male', E'\uB0A8\uC790\uD654\uC7A5\uC2E4', E'\uB0A8\uC131 \uC804\uC6A9 \uD654\uC7A5\uC2E4'),
  ('kitchen', E'\uBD80\uC5CC', E'\uB300\uD615 \uBD80\uC5CC+\uC2DD\uB2F9'),
  ('storage', E'\uCC3D\uACE0', E'\uCCAD\uC18C\uB3C4\uAD6C/\uC18C\uBAA8\uD488 \uBCF4\uAD00'),
  ('bbq', E'\uBC14\uBCA0\uD050 \uC2DC\uC124', E'\uC57C\uC678 \uBC14\uBCA0\uD050 \uADF8\uB9B4 \uCD5C\uB300 6\uAC1C')
ON CONFLICT (zone_id) DO NOTHING;

CREATE OR REPLACE VIEW cleaning_session_summary AS
SELECT
  s.id, s.cleaner_name, s.cleaner_phone, s.session_date,
  s.started_at, s.completed_at, s.status,
  s.reviewer_name, s.reviewed_at, s.review_notes,
  COUNT(DISTINCT c.id) FILTER (WHERE c.is_checked = true) AS tasks_done,
  COUNT(DISTINCT c.id) AS tasks_total,
  COUNT(DISTINCT m.id) AS media_count,
  COUNT(DISTINCT m.id) FILTER (WHERE m.media_type = 'photo') AS photo_count,
  COUNT(DISTINCT m.id) FILTER (WHERE m.media_type = 'video') AS video_count,
  COUNT(DISTINCT m.zone_id) AS zones_with_media
FROM cleaning_sessions s
LEFT JOIN cleaning_checks c ON c.session_id = s.id
LEFT JOIN cleaning_media m ON m.session_id = s.id
GROUP BY s.id;

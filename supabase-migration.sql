-- ============================================================
-- 달팽이아지트 청소 관리 시스템 DB 스키마
-- Supabase SQL Editor에서 순서대로 실행
-- ============================================================

-- 1. 청소 세션 (매 회차 청소 기록의 루트)
CREATE TABLE cleaning_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cleaner_name TEXT NOT NULL,
  cleaner_phone TEXT,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'completed', 'reviewed', 'rejected')),
  reviewer_name TEXT,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 청소 체크 항목
CREATE TABLE cleaning_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES cleaning_sessions(id) ON DELETE CASCADE,
  zone_id TEXT NOT NULL,
  zone_name TEXT NOT NULL,
  zone_category TEXT NOT NULL
    CHECK (zone_category IN ('interior', 'exterior')),
  task_index INT NOT NULL,
  task_text TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT FALSE,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, zone_id, task_index)
);

-- 3. 청소 미디어
CREATE TABLE cleaning_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES cleaning_sessions(id) ON DELETE CASCADE,
  zone_id TEXT NOT NULL,
  media_type TEXT NOT NULL
    CHECK (media_type IN ('photo', 'video')),
  storage_path TEXT NOT NULL,
  public_url TEXT,
  file_name TEXT,
  file_size INT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 구역별 매뉴얼 영상
CREATE TABLE cleaning_manuals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_id TEXT NOT NULL UNIQUE,
  zone_name TEXT NOT NULL,
  video_url TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 인덱스
-- ============================================================
CREATE INDEX idx_sessions_date ON cleaning_sessions(session_date DESC);
CREATE INDEX idx_sessions_status ON cleaning_sessions(status);
CREATE INDEX idx_checks_session ON cleaning_checks(session_id);
CREATE INDEX idx_checks_zone ON cleaning_checks(zone_id);
CREATE INDEX idx_media_session ON cleaning_media(session_id);
CREATE INDEX idx_media_zone ON cleaning_media(zone_id);

-- ============================================================
-- RLS (내부 운영 시스템 - 전체 허용)
-- ============================================================
ALTER TABLE cleaning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_manuals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "all_sessions" ON cleaning_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_checks" ON cleaning_checks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_media" ON cleaning_media FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "all_manuals" ON cleaning_manuals FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- Storage 버킷
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cleaning-media',
  'cleaning-media',
  true,
  52428800,
  ARRAY['image/jpeg','image/png','image/webp','image/heic','video/mp4','video/quicktime','video/webm']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "read_cleaning_media" ON storage.objects
  FOR SELECT USING (bucket_id = 'cleaning-media');
CREATE POLICY "upload_cleaning_media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'cleaning-media');
CREATE POLICY "delete_cleaning_media" ON storage.objects
  FOR DELETE USING (bucket_id = 'cleaning-media');

-- ============================================================
-- 초기 매뉴얼 데이터
-- ============================================================
INSERT INTO cleaning_manuals (zone_id, zone_name, description) VALUES
  ('living', '거실', '30평+ 대형 거실. 100인치 TV, 전자레인지 4대, 정수기, 난방기'),
  ('small_room_left', '좌측 작은방1', '좌측 소형 객실'),
  ('small_room_right', '우측 작은방2', '우측 소형 객실'),
  ('big_room_1', '큰방1', '대형 객실 1'),
  ('big_room_2', '큰방2', '대형 객실 2'),
  ('bathroom_female', '여자화장실', '여성 전용 화장실/샤워실'),
  ('bathroom_male', '남자화장실', '남성 전용 화장실/샤워실'),
  ('kitchen', '부엌', '대형 부엌+식당'),
  ('storage', '창고', '청소도구/소모품 보관'),
  ('bbq', '바베큐 시설', '야외 바베큐 그릴 최대 6개 + 테이블')
ON CONFLICT (zone_id) DO NOTHING;

-- ============================================================
-- 세션 요약 뷰
-- ============================================================
CREATE OR REPLACE VIEW cleaning_session_summary AS
SELECT
  s.id,
  s.cleaner_name,
  s.cleaner_phone,
  s.session_date,
  s.started_at,
  s.completed_at,
  s.status,
  s.reviewer_name,
  s.reviewed_at,
  s.review_notes,
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

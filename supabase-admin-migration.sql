-- 1. 청소자 테이블
CREATE TABLE IF NOT EXISTS cleaners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE cleaners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cleaners_read" ON cleaners FOR SELECT USING (true);
CREATE POLICY "cleaners_insert" ON cleaners FOR INSERT WITH CHECK (true);
CREATE POLICY "cleaners_update" ON cleaners FOR UPDATE USING (true);
CREATE POLICY "cleaners_delete" ON cleaners FOR DELETE USING (true);

-- 기존 청소자 등록
INSERT INTO cleaners (name, phone) VALUES
  (E'\uC784\uC7AC\uAD6D', '01046965529'),
  (E'\uC784\uC138\uC9C4', '01053140146')
ON CONFLICT (phone) DO NOTHING;

-- 2. cleaning_sessions에 배정 구역 컬럼 추가
ALTER TABLE cleaning_sessions ADD COLUMN IF NOT EXISTS assigned_zones JSONB;

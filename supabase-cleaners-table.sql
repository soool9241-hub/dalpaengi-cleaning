-- 청소자 테이블 생성
CREATE TABLE IF NOT EXISTS cleaners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 활성화
ALTER TABLE cleaners ENABLE ROW LEVEL SECURITY;

-- 읽기 허용
CREATE POLICY "cleaners_read" ON cleaners FOR SELECT USING (true);

-- 기존 청소자 2명 등록
INSERT INTO cleaners (name, phone) VALUES
  (E'\uC784\uC7AC\uAD6D', '01046965529'),
  (E'\uC784\uC138\uC9C4', '01053140146')
ON CONFLICT (phone) DO NOTHING;

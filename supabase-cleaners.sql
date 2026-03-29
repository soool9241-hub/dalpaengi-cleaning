CREATE TABLE cleaners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cleaners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "all_cleaners" ON cleaners FOR ALL USING (true) WITH CHECK (true);

INSERT INTO cleaners (name, phone) VALUES
  (E'\uC784\uC7AC\uAD6D', '01046965529'),
  (E'\uC784\uC138\uC9C4', '01053140146');

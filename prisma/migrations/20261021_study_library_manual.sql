-- Study Library tables (manual SQL for Supabase public schema)
CREATE TABLE IF NOT EXISTS public.library_items (
  id                 BIGSERIAL PRIMARY KEY,
  item_type          VARCHAR(20) NOT NULL CHECK (item_type IN ('RESEARCH', 'PRACTICE')),
  grade              VARCHAR(10) NOT NULL,
  board              VARCHAR(30) NOT NULL,
  subject_id         VARCHAR(60) NOT NULL,
  topic              VARCHAR(200) NOT NULL,
  content_json       TEXT NOT NULL,
  source_query_id    VARCHAR(36) NULL,
  source_practice_id VARCHAR(36) NULL,
  is_visible         BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured        BOOLEAN NOT NULL DEFAULT FALSE,
  is_imported        BOOLEAN NOT NULL DEFAULT FALSE,
  import_file_url    VARCHAR(500) NULL,
  import_file_name   VARCHAR(200) NULL,
  admin_note         VARCHAR(500) NULL,
  view_count         INT NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT library_source_check CHECK (
    source_query_id IS NOT NULL OR source_practice_id IS NOT NULL OR is_imported = TRUE
  )
);

CREATE INDEX IF NOT EXISTS idx_lib_grade_board ON public.library_items (grade, board);
CREATE INDEX IF NOT EXISTS idx_lib_subject ON public.library_items (subject_id);
CREATE INDEX IF NOT EXISTS idx_lib_type ON public.library_items (item_type);
CREATE INDEX IF NOT EXISTS idx_lib_visible ON public.library_items (is_visible);
CREATE INDEX IF NOT EXISTS idx_lib_featured ON public.library_items (is_featured, created_at DESC);

CREATE TABLE IF NOT EXISTS public.library_config (
  id           BIGSERIAL PRIMARY KEY,
  config_key   VARCHAR(100) NOT NULL UNIQUE,
  config_value VARCHAR(500) NOT NULL,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.library_config (config_key, config_value)
VALUES
  ('scope', 'OWN_GRADE_BOARD'),
  ('auto_save_research', 'true'),
  ('auto_save_practice', 'true')
ON CONFLICT (config_key) DO NOTHING;

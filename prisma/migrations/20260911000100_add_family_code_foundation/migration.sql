ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS family_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS family_code_active BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS linked_at TIMESTAMP NULL;

COMMENT ON COLUMN "User".family_code IS 'Unique code shared with child';
COMMENT ON COLUMN "User".family_code_active IS 'true=active, false=deactivated';
COMMENT ON COLUMN "User".linked_at IS 'When family code linked a child to a parent';

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_family_code
ON "User" (family_code);

DO $$
DECLARE
  parent_record RECORD;
  candidate TEXT;
BEGIN
  FOR parent_record IN
    SELECT id
    FROM "User"
    WHERE role::text = 'PARENT'
      AND (family_code IS NULL OR family_code = '')
  LOOP
    LOOP
      candidate := 'VDA' || UPPER(SUBSTRING(MD5(parent_record.id || RANDOM()::text || clock_timestamp()::text) FROM 1 FOR 5));
      EXIT WHEN NOT EXISTS (
        SELECT 1
        FROM "User"
        WHERE family_code = candidate
      );
    END LOOP;

    UPDATE "User"
    SET family_code = candidate
    WHERE id = parent_record.id;
  END LOOP;
END $$;

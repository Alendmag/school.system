/*
# Phase 1 Closure Fixes — Schema Changes

## Summary
Forward migration addressing Phase 1 acceptance audit findings.
Does NOT modify any previously applied migration.

## 1. Classes linked to Academic Years (FIX 1)
- Add `academic_year_id` column to `classes` table
- Backfill all existing classes to the active academic year per school
- Make column NOT NULL after backfill
- Add index on (school_id, academic_year_id)

## 2. Teacher Assignments updated_at (FIX 2)
- Add `updated_at` column to `teacher_assignments`

## 3. Database-Level Tenant Integrity (FIX 3)
- Add UNIQUE constraints on (id, school_id) for parent tables:
  academic_years, teachers, subjects, classes
- Replace simple FKs with composite tenant-aware FKs on:
  - classes.academic_year_id → academic_years(id, school_id)
  - classes.advisor_id → teachers(id, school_id)
  - terms.academic_year_id → academic_years(id, school_id)
  - teacher_assignments: all 4 entity FKs become composite
- This prevents cross-tenant references at the database level

## Important Notes
1. Existing students.class_id is NOT touched
2. All changes are additive — no columns dropped
3. RLS policies remain unchanged (already correct)
4. Composite FKs supplement existing API validation
*/

-- ============================================================
-- STEP 1: Add UNIQUE constraints on (id, school_id) for parents
-- These are needed for composite FK references
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_academic_years_id_school'
  ) THEN
    ALTER TABLE academic_years ADD CONSTRAINT uq_academic_years_id_school UNIQUE (id, school_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_teachers_id_school'
  ) THEN
    ALTER TABLE teachers ADD CONSTRAINT uq_teachers_id_school UNIQUE (id, school_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_subjects_id_school'
  ) THEN
    ALTER TABLE subjects ADD CONSTRAINT uq_subjects_id_school UNIQUE (id, school_id);
  END IF;
END $$;

-- ============================================================
-- STEP 2: Add academic_year_id to classes + backfill
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'classes' AND column_name = 'academic_year_id'
  ) THEN
    ALTER TABLE classes ADD COLUMN academic_year_id uuid;
  END IF;
END $$;

-- Backfill: assign each class to its school's active academic year.
-- If no active year exists, use the most recent year by start_date.
UPDATE classes
SET academic_year_id = (
  SELECT ay.id FROM academic_years ay
  WHERE ay.school_id = classes.school_id
  ORDER BY (ay.status = 'active') DESC, ay.start_date DESC
  LIMIT 1
)
WHERE academic_year_id IS NULL;

-- Make NOT NULL after backfill
ALTER TABLE classes ALTER COLUMN academic_year_id SET NOT NULL;

-- UNIQUE constraint on (id, school_id) for classes (needed for composite FK from teacher_assignments)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_classes_id_school'
  ) THEN
    ALTER TABLE classes ADD CONSTRAINT uq_classes_id_school UNIQUE (id, school_id);
  END IF;
END $$;

-- Index for filtering classes by school + year
CREATE INDEX IF NOT EXISTS idx_classes_school_year ON classes(school_id, academic_year_id);

-- ============================================================
-- STEP 3: Add updated_at to teacher_assignments
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'teacher_assignments' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE teacher_assignments ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- ============================================================
-- STEP 4: Composite tenant-aware foreign keys
-- Drop old simple FKs and replace with composite ones
-- ============================================================

-- 4a. classes.academic_year_id → academic_years(id, school_id)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_classes_academic_year_school'
  ) THEN
    ALTER TABLE classes ADD CONSTRAINT fk_classes_academic_year_school
      FOREIGN KEY (academic_year_id, school_id) REFERENCES academic_years(id, school_id);
  END IF;
END $$;

-- 4b. classes.advisor_id → teachers(id, school_id) [composite, nullable]
-- First drop old simple FK if it exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'classes_advisor_id_fkey'
  ) THEN
    ALTER TABLE classes DROP CONSTRAINT classes_advisor_id_fkey;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_classes_advisor_school'
  ) THEN
    ALTER TABLE classes ADD CONSTRAINT fk_classes_advisor_school
      FOREIGN KEY (advisor_id, school_id) REFERENCES teachers(id, school_id);
  END IF;
END $$;

-- 4c. terms.academic_year_id → academic_years(id, school_id)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'terms_academic_year_id_fkey'
  ) THEN
    ALTER TABLE terms DROP CONSTRAINT terms_academic_year_id_fkey;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_terms_academic_year_school'
  ) THEN
    ALTER TABLE terms ADD CONSTRAINT fk_terms_academic_year_school
      FOREIGN KEY (academic_year_id, school_id) REFERENCES academic_years(id, school_id);
  END IF;
END $$;

-- 4d. teacher_assignments — replace all 4 simple FKs with composite
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teacher_assignments_teacher_id_fkey') THEN
    ALTER TABLE teacher_assignments DROP CONSTRAINT teacher_assignments_teacher_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teacher_assignments_subject_id_fkey') THEN
    ALTER TABLE teacher_assignments DROP CONSTRAINT teacher_assignments_subject_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teacher_assignments_class_id_fkey') THEN
    ALTER TABLE teacher_assignments DROP CONSTRAINT teacher_assignments_class_id_fkey;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teacher_assignments_academic_year_id_fkey') THEN
    ALTER TABLE teacher_assignments DROP CONSTRAINT teacher_assignments_academic_year_id_fkey;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ta_teacher_school') THEN
    ALTER TABLE teacher_assignments ADD CONSTRAINT fk_ta_teacher_school
      FOREIGN KEY (teacher_id, school_id) REFERENCES teachers(id, school_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ta_subject_school') THEN
    ALTER TABLE teacher_assignments ADD CONSTRAINT fk_ta_subject_school
      FOREIGN KEY (subject_id, school_id) REFERENCES subjects(id, school_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ta_class_school') THEN
    ALTER TABLE teacher_assignments ADD CONSTRAINT fk_ta_class_school
      FOREIGN KEY (class_id, school_id) REFERENCES classes(id, school_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ta_academic_year_school') THEN
    ALTER TABLE teacher_assignments ADD CONSTRAINT fk_ta_academic_year_school
      FOREIGN KEY (academic_year_id, school_id) REFERENCES academic_years(id, school_id);
  END IF;
END $$;

/*
# Create teacher_assignments junction table

1. New Tables
   - `teacher_assignments`
     - `id` (uuid, primary key)
     - `school_id` (uuid, FK → schools, tenant scope)
     - `teacher_id` (uuid, FK → teachers)
     - `subject_id` (uuid, FK → subjects)
     - `class_id` (uuid, FK → classes)
     - `academic_year_id` (uuid, FK → academic_years)
     - `created_at` (timestamptz)

2. Constraints
   - Unique constraint on (school_id, teacher_id, subject_id, class_id, academic_year_id)
     to prevent duplicate assignments.
   - All FKs reference same-school records (enforced at API level).

3. Security
   - RLS enabled.
   - Tenant-scoped policies: authenticated users can only access
     assignments belonging to their school (via user_profiles lookup).
   - 4 separate policies for SELECT, INSERT, UPDATE, DELETE.

4. Indexes
   - Composite index on (school_id, academic_year_id) for filtered listing.
   - Index on teacher_id for teacher-centric queries.
*/

CREATE TABLE IF NOT EXISTS teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id),
  teacher_id uuid NOT NULL REFERENCES teachers(id),
  subject_id uuid NOT NULL REFERENCES subjects(id),
  class_id uuid NOT NULL REFERENCES classes(id),
  academic_year_id uuid NOT NULL REFERENCES academic_years(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(school_id, teacher_id, subject_id, class_id, academic_year_id)
);

CREATE INDEX IF NOT EXISTS idx_teacher_assignments_school_year
  ON teacher_assignments(school_id, academic_year_id);

CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher
  ON teacher_assignments(teacher_id);

ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_school_teacher_assignments" ON teacher_assignments;
CREATE POLICY "select_own_school_teacher_assignments"
  ON teacher_assignments FOR SELECT
  TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_school_teacher_assignments" ON teacher_assignments;
CREATE POLICY "insert_own_school_teacher_assignments"
  ON teacher_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_school_teacher_assignments" ON teacher_assignments;
CREATE POLICY "update_own_school_teacher_assignments"
  ON teacher_assignments FOR UPDATE
  TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM user_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_school_teacher_assignments" ON teacher_assignments;
CREATE POLICY "delete_own_school_teacher_assignments"
  ON teacher_assignments FOR DELETE
  TO authenticated
  USING (
    school_id IN (
      SELECT school_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

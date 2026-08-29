/*
# Add authentication support and tenant-isolated RLS

## Summary
This migration adds real authentication and database-level tenant isolation
to the School ERP. Previously, all 14 tables had permissive USING(true) policies
that provided no isolation. This migration:

1. Creates a `user_profiles` table linking auth.users to schools
2. Creates a `get_my_school_id()` function for use in RLS policies
3. Replaces all permissive USING(true) policies on all 14 tables with
   tenant-scoped policies that restrict access to the authenticated user's school

## New Tables
- `user_profiles`
  - `id` (uuid, PK)
  - `user_id` (uuid, unique, FK → auth.users ON DELETE CASCADE)
  - `school_id` (uuid, FK → schools ON DELETE CASCADE)
  - `role` (text, default 'admin')
  - `name` (text, default '')
  - `created_at` (timestamptz)

## New Functions
- `get_my_school_id()` — SECURITY DEFINER function that returns the
  school_id from user_profiles for the current auth.uid(). Used by all
  tenant RLS policies. SECURITY DEFINER is required because this function
  is called inside other tables' policies and needs to read user_profiles
  without circular RLS dependency.

## Security Changes
- RLS enabled on user_profiles with self-access policies
- All 14 existing tables: old USING(true) policies dropped, replaced with
  tenant-scoped policies checking school_id = get_my_school_id()
- All policies scoped TO authenticated only — anon role sees nothing
- schools table: uses id = get_my_school_id() (not school_id)

## Important Notes
1. After this migration, direct PostgREST access with the anon key returns
   zero rows on all tables — the anon role has no user_profiles entry.
2. The Express server uses the service_role key which bypasses RLS.
3. Server-side tenant filtering via schoolFilter() is preserved as defense-in-depth.
4. The get_my_school_id() function uses SECURITY DEFINER with a fixed
   search_path to prevent search_path injection.
*/

-- ============================================================
-- 1. user_profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'admin',
  name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_school_id ON user_profiles(school_id);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_read_own_profile" ON user_profiles;
CREATE POLICY "users_read_own_profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_update_own_profile" ON user_profiles;
CREATE POLICY "users_update_own_profile" ON user_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_insert_own_profile" ON user_profiles;
CREATE POLICY "users_insert_own_profile" ON user_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users_delete_own_profile" ON user_profiles;
CREATE POLICY "users_delete_own_profile" ON user_profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 2. Tenant lookup function (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION get_my_school_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM user_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- 3. Replace RLS policies on all 14 tables
-- ============================================================

-- --- schools ---
DROP POLICY IF EXISTS "anon_select_schools" ON schools;
DROP POLICY IF EXISTS "anon_insert_schools" ON schools;
DROP POLICY IF EXISTS "anon_update_schools" ON schools;
DROP POLICY IF EXISTS "anon_delete_schools" ON schools;

DROP POLICY IF EXISTS "tenant_select_schools" ON schools;
CREATE POLICY "tenant_select_schools" ON schools
  FOR SELECT TO authenticated
  USING (id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_insert_schools" ON schools;
CREATE POLICY "tenant_insert_schools" ON schools
  FOR INSERT TO authenticated
  WITH CHECK (id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_update_schools" ON schools;
CREATE POLICY "tenant_update_schools" ON schools
  FOR UPDATE TO authenticated
  USING (id = get_my_school_id())
  WITH CHECK (id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_delete_schools" ON schools;
CREATE POLICY "tenant_delete_schools" ON schools
  FOR DELETE TO authenticated
  USING (id = get_my_school_id());

-- --- students ---
DROP POLICY IF EXISTS "anon_select_students" ON students;
DROP POLICY IF EXISTS "anon_insert_students" ON students;
DROP POLICY IF EXISTS "anon_update_students" ON students;
DROP POLICY IF EXISTS "anon_delete_students" ON students;

DROP POLICY IF EXISTS "tenant_select_students" ON students;
CREATE POLICY "tenant_select_students" ON students
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_insert_students" ON students;
CREATE POLICY "tenant_insert_students" ON students
  FOR INSERT TO authenticated
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_update_students" ON students;
CREATE POLICY "tenant_update_students" ON students
  FOR UPDATE TO authenticated
  USING (school_id = get_my_school_id())
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_delete_students" ON students;
CREATE POLICY "tenant_delete_students" ON students
  FOR DELETE TO authenticated
  USING (school_id = get_my_school_id());

-- --- classes ---
DROP POLICY IF EXISTS "anon_select_classes" ON classes;
DROP POLICY IF EXISTS "anon_insert_classes" ON classes;
DROP POLICY IF EXISTS "anon_update_classes" ON classes;
DROP POLICY IF EXISTS "anon_delete_classes" ON classes;

DROP POLICY IF EXISTS "tenant_select_classes" ON classes;
CREATE POLICY "tenant_select_classes" ON classes
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_insert_classes" ON classes;
CREATE POLICY "tenant_insert_classes" ON classes
  FOR INSERT TO authenticated
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_update_classes" ON classes;
CREATE POLICY "tenant_update_classes" ON classes
  FOR UPDATE TO authenticated
  USING (school_id = get_my_school_id())
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_delete_classes" ON classes;
CREATE POLICY "tenant_delete_classes" ON classes
  FOR DELETE TO authenticated
  USING (school_id = get_my_school_id());

-- --- subjects ---
DROP POLICY IF EXISTS "anon_select_subjects" ON subjects;
DROP POLICY IF EXISTS "anon_insert_subjects" ON subjects;
DROP POLICY IF EXISTS "anon_update_subjects" ON subjects;
DROP POLICY IF EXISTS "anon_delete_subjects" ON subjects;

DROP POLICY IF EXISTS "tenant_select_subjects" ON subjects;
CREATE POLICY "tenant_select_subjects" ON subjects
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_insert_subjects" ON subjects;
CREATE POLICY "tenant_insert_subjects" ON subjects
  FOR INSERT TO authenticated
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_update_subjects" ON subjects;
CREATE POLICY "tenant_update_subjects" ON subjects
  FOR UPDATE TO authenticated
  USING (school_id = get_my_school_id())
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_delete_subjects" ON subjects;
CREATE POLICY "tenant_delete_subjects" ON subjects
  FOR DELETE TO authenticated
  USING (school_id = get_my_school_id());

-- --- teachers ---
DROP POLICY IF EXISTS "anon_select_teachers" ON teachers;
DROP POLICY IF EXISTS "anon_insert_teachers" ON teachers;
DROP POLICY IF EXISTS "anon_update_teachers" ON teachers;
DROP POLICY IF EXISTS "anon_delete_teachers" ON teachers;

DROP POLICY IF EXISTS "tenant_select_teachers" ON teachers;
CREATE POLICY "tenant_select_teachers" ON teachers
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_insert_teachers" ON teachers;
CREATE POLICY "tenant_insert_teachers" ON teachers
  FOR INSERT TO authenticated
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_update_teachers" ON teachers;
CREATE POLICY "tenant_update_teachers" ON teachers
  FOR UPDATE TO authenticated
  USING (school_id = get_my_school_id())
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_delete_teachers" ON teachers;
CREATE POLICY "tenant_delete_teachers" ON teachers
  FOR DELETE TO authenticated
  USING (school_id = get_my_school_id());

-- --- guardians ---
DROP POLICY IF EXISTS "anon_select_guardians" ON guardians;
DROP POLICY IF EXISTS "anon_insert_guardians" ON guardians;
DROP POLICY IF EXISTS "anon_update_guardians" ON guardians;
DROP POLICY IF EXISTS "anon_delete_guardians" ON guardians;

DROP POLICY IF EXISTS "tenant_select_guardians" ON guardians;
CREATE POLICY "tenant_select_guardians" ON guardians
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_insert_guardians" ON guardians;
CREATE POLICY "tenant_insert_guardians" ON guardians
  FOR INSERT TO authenticated
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_update_guardians" ON guardians;
CREATE POLICY "tenant_update_guardians" ON guardians
  FOR UPDATE TO authenticated
  USING (school_id = get_my_school_id())
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_delete_guardians" ON guardians;
CREATE POLICY "tenant_delete_guardians" ON guardians
  FOR DELETE TO authenticated
  USING (school_id = get_my_school_id());

-- --- academic_years ---
DROP POLICY IF EXISTS "anon_select_academic_years" ON academic_years;
DROP POLICY IF EXISTS "anon_insert_academic_years" ON academic_years;
DROP POLICY IF EXISTS "anon_update_academic_years" ON academic_years;
DROP POLICY IF EXISTS "anon_delete_academic_years" ON academic_years;

DROP POLICY IF EXISTS "tenant_select_academic_years" ON academic_years;
CREATE POLICY "tenant_select_academic_years" ON academic_years
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_insert_academic_years" ON academic_years;
CREATE POLICY "tenant_insert_academic_years" ON academic_years
  FOR INSERT TO authenticated
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_update_academic_years" ON academic_years;
CREATE POLICY "tenant_update_academic_years" ON academic_years
  FOR UPDATE TO authenticated
  USING (school_id = get_my_school_id())
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_delete_academic_years" ON academic_years;
CREATE POLICY "tenant_delete_academic_years" ON academic_years
  FOR DELETE TO authenticated
  USING (school_id = get_my_school_id());

-- --- terms ---
DROP POLICY IF EXISTS "anon_select_terms" ON terms;
DROP POLICY IF EXISTS "anon_insert_terms" ON terms;
DROP POLICY IF EXISTS "anon_update_terms" ON terms;
DROP POLICY IF EXISTS "anon_delete_terms" ON terms;

DROP POLICY IF EXISTS "tenant_select_terms" ON terms;
CREATE POLICY "tenant_select_terms" ON terms
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_insert_terms" ON terms;
CREATE POLICY "tenant_insert_terms" ON terms
  FOR INSERT TO authenticated
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_update_terms" ON terms;
CREATE POLICY "tenant_update_terms" ON terms
  FOR UPDATE TO authenticated
  USING (school_id = get_my_school_id())
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_delete_terms" ON terms;
CREATE POLICY "tenant_delete_terms" ON terms
  FOR DELETE TO authenticated
  USING (school_id = get_my_school_id());

-- --- attendance_records ---
DROP POLICY IF EXISTS "anon_select_attendance_records" ON attendance_records;
DROP POLICY IF EXISTS "anon_insert_attendance_records" ON attendance_records;
DROP POLICY IF EXISTS "anon_update_attendance_records" ON attendance_records;
DROP POLICY IF EXISTS "anon_delete_attendance_records" ON attendance_records;

DROP POLICY IF EXISTS "tenant_select_attendance_records" ON attendance_records;
CREATE POLICY "tenant_select_attendance_records" ON attendance_records
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_insert_attendance_records" ON attendance_records;
CREATE POLICY "tenant_insert_attendance_records" ON attendance_records
  FOR INSERT TO authenticated
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_update_attendance_records" ON attendance_records;
CREATE POLICY "tenant_update_attendance_records" ON attendance_records
  FOR UPDATE TO authenticated
  USING (school_id = get_my_school_id())
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_delete_attendance_records" ON attendance_records;
CREATE POLICY "tenant_delete_attendance_records" ON attendance_records
  FOR DELETE TO authenticated
  USING (school_id = get_my_school_id());

-- --- invoices ---
DROP POLICY IF EXISTS "anon_select_invoices" ON invoices;
DROP POLICY IF EXISTS "anon_insert_invoices" ON invoices;
DROP POLICY IF EXISTS "anon_update_invoices" ON invoices;
DROP POLICY IF EXISTS "anon_delete_invoices" ON invoices;

DROP POLICY IF EXISTS "tenant_select_invoices" ON invoices;
CREATE POLICY "tenant_select_invoices" ON invoices
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_insert_invoices" ON invoices;
CREATE POLICY "tenant_insert_invoices" ON invoices
  FOR INSERT TO authenticated
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_update_invoices" ON invoices;
CREATE POLICY "tenant_update_invoices" ON invoices
  FOR UPDATE TO authenticated
  USING (school_id = get_my_school_id())
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_delete_invoices" ON invoices;
CREATE POLICY "tenant_delete_invoices" ON invoices
  FOR DELETE TO authenticated
  USING (school_id = get_my_school_id());

-- --- payments ---
DROP POLICY IF EXISTS "anon_select_payments" ON payments;
DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
DROP POLICY IF EXISTS "anon_update_payments" ON payments;
DROP POLICY IF EXISTS "anon_delete_payments" ON payments;

DROP POLICY IF EXISTS "tenant_select_payments" ON payments;
CREATE POLICY "tenant_select_payments" ON payments
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_insert_payments" ON payments;
CREATE POLICY "tenant_insert_payments" ON payments
  FOR INSERT TO authenticated
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_update_payments" ON payments;
CREATE POLICY "tenant_update_payments" ON payments
  FOR UPDATE TO authenticated
  USING (school_id = get_my_school_id())
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_delete_payments" ON payments;
CREATE POLICY "tenant_delete_payments" ON payments
  FOR DELETE TO authenticated
  USING (school_id = get_my_school_id());

-- --- assignments ---
DROP POLICY IF EXISTS "anon_select_assignments" ON assignments;
DROP POLICY IF EXISTS "anon_insert_assignments" ON assignments;
DROP POLICY IF EXISTS "anon_update_assignments" ON assignments;
DROP POLICY IF EXISTS "anon_delete_assignments" ON assignments;

DROP POLICY IF EXISTS "tenant_select_assignments" ON assignments;
CREATE POLICY "tenant_select_assignments" ON assignments
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_insert_assignments" ON assignments;
CREATE POLICY "tenant_insert_assignments" ON assignments
  FOR INSERT TO authenticated
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_update_assignments" ON assignments;
CREATE POLICY "tenant_update_assignments" ON assignments
  FOR UPDATE TO authenticated
  USING (school_id = get_my_school_id())
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_delete_assignments" ON assignments;
CREATE POLICY "tenant_delete_assignments" ON assignments
  FOR DELETE TO authenticated
  USING (school_id = get_my_school_id());

-- --- exams ---
DROP POLICY IF EXISTS "anon_select_exams" ON exams;
DROP POLICY IF EXISTS "anon_insert_exams" ON exams;
DROP POLICY IF EXISTS "anon_update_exams" ON exams;
DROP POLICY IF EXISTS "anon_delete_exams" ON exams;

DROP POLICY IF EXISTS "tenant_select_exams" ON exams;
CREATE POLICY "tenant_select_exams" ON exams
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_insert_exams" ON exams;
CREATE POLICY "tenant_insert_exams" ON exams
  FOR INSERT TO authenticated
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_update_exams" ON exams;
CREATE POLICY "tenant_update_exams" ON exams
  FOR UPDATE TO authenticated
  USING (school_id = get_my_school_id())
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_delete_exams" ON exams;
CREATE POLICY "tenant_delete_exams" ON exams
  FOR DELETE TO authenticated
  USING (school_id = get_my_school_id());

-- --- grade_entries ---
DROP POLICY IF EXISTS "anon_select_grade_entries" ON grade_entries;
DROP POLICY IF EXISTS "anon_insert_grade_entries" ON grade_entries;
DROP POLICY IF EXISTS "anon_update_grade_entries" ON grade_entries;
DROP POLICY IF EXISTS "anon_delete_grade_entries" ON grade_entries;

DROP POLICY IF EXISTS "tenant_select_grade_entries" ON grade_entries;
CREATE POLICY "tenant_select_grade_entries" ON grade_entries
  FOR SELECT TO authenticated
  USING (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_insert_grade_entries" ON grade_entries;
CREATE POLICY "tenant_insert_grade_entries" ON grade_entries
  FOR INSERT TO authenticated
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_update_grade_entries" ON grade_entries;
CREATE POLICY "tenant_update_grade_entries" ON grade_entries
  FOR UPDATE TO authenticated
  USING (school_id = get_my_school_id())
  WITH CHECK (school_id = get_my_school_id());

DROP POLICY IF EXISTS "tenant_delete_grade_entries" ON grade_entries;
CREATE POLICY "tenant_delete_grade_entries" ON grade_entries
  FOR DELETE TO authenticated
  USING (school_id = get_my_school_id());

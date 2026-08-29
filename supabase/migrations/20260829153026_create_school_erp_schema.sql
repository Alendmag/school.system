/*
# Create School ERP Schema with Tenant Isolation

1. New Tables:
   - `schools` - Tenant root table (id, name, type)
   - `academic_years` - Academic year periods per school
   - `terms` - Terms within academic years
   - `subjects` - Subjects/courses per school
   - `classes` - Classes/sections with level (grade) per school
   - `teachers` - Teacher records per school
   - `guardians` - Guardian/parent records per school
   - `students` - Student records per school with class and guardian FK
   - `assignments` - Assignments per school
   - `exams` - Exams per school
   - `grade_entries` - Student grades per school
   - `attendance_records` - Attendance with UNIQUE constraint on (school_id, student_id, class_id, date)
   - `invoices` - Financial invoices per school
   - `payments` - Payments against invoices per school

2. Security:
   - RLS enabled on ALL tables
   - Policies allow anon + authenticated CRUD (no auth in this app)
   - Every table except `schools` has a `school_id` FK for tenant isolation

3. Key Constraints:
   - `attendance_records` has UNIQUE(school_id, student_id, class_id, date) to prevent duplicates (CF-2)
   - All FKs use ON DELETE CASCADE where appropriate
   - Proper indexes on frequently queried columns

4. Important Notes:
   - school_id is on every entity table for server-side tenant enforcement
   - The API layer will derive school_id from session, never from client input
   - The unique attendance constraint prevents duplicate saves at DB level
*/

-- Schools (tenant root)
CREATE TABLE IF NOT EXISTS schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'school',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_schools" ON schools;
CREATE POLICY "anon_select_schools" ON schools FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_schools" ON schools;
CREATE POLICY "anon_insert_schools" ON schools FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_schools" ON schools;
CREATE POLICY "anon_update_schools" ON schools FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_schools" ON schools;
CREATE POLICY "anon_delete_schools" ON schools FOR DELETE TO anon, authenticated USING (true);

-- Academic Years
CREATE TABLE IF NOT EXISTS academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_academic_years" ON academic_years;
CREATE POLICY "anon_select_academic_years" ON academic_years FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_academic_years" ON academic_years;
CREATE POLICY "anon_insert_academic_years" ON academic_years FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_academic_years" ON academic_years;
CREATE POLICY "anon_update_academic_years" ON academic_years FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_academic_years" ON academic_years;
CREATE POLICY "anon_delete_academic_years" ON academic_years FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_academic_years_school ON academic_years(school_id);

-- Terms
CREATE TABLE IF NOT EXISTS terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id uuid NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_terms" ON terms;
CREATE POLICY "anon_select_terms" ON terms FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_terms" ON terms;
CREATE POLICY "anon_insert_terms" ON terms FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_terms" ON terms;
CREATE POLICY "anon_update_terms" ON terms FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_terms" ON terms;
CREATE POLICY "anon_delete_terms" ON terms FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_terms_school ON terms(school_id);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_subjects" ON subjects;
CREATE POLICY "anon_select_subjects" ON subjects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_subjects" ON subjects;
CREATE POLICY "anon_insert_subjects" ON subjects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_subjects" ON subjects;
CREATE POLICY "anon_update_subjects" ON subjects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_subjects" ON subjects;
CREATE POLICY "anon_delete_subjects" ON subjects FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_subjects_school ON subjects(school_id);

-- Classes (sections) with level = grade number
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  level text NOT NULL,
  capacity integer NOT NULL DEFAULT 30,
  advisor_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_classes" ON classes;
CREATE POLICY "anon_select_classes" ON classes FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_classes" ON classes;
CREATE POLICY "anon_insert_classes" ON classes FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_classes" ON classes;
CREATE POLICY "anon_update_classes" ON classes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_classes" ON classes;
CREATE POLICY "anon_delete_classes" ON classes FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_classes_school ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_level ON classes(school_id, level);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  subject_ids text[] DEFAULT '{}',
  qualifications text,
  experience_years integer DEFAULT 0,
  join_date date,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_teachers" ON teachers;
CREATE POLICY "anon_select_teachers" ON teachers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_teachers" ON teachers;
CREATE POLICY "anon_insert_teachers" ON teachers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_teachers" ON teachers;
CREATE POLICY "anon_update_teachers" ON teachers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_teachers" ON teachers;
CREATE POLICY "anon_delete_teachers" ON teachers FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_teachers_school ON teachers(school_id);

-- Guardians
CREATE TABLE IF NOT EXISTS guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  relation text DEFAULT 'أب',
  address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_guardians" ON guardians;
CREATE POLICY "anon_select_guardians" ON guardians FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_guardians" ON guardians;
CREATE POLICY "anon_insert_guardians" ON guardians FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_guardians" ON guardians;
CREATE POLICY "anon_update_guardians" ON guardians FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_guardians" ON guardians;
CREATE POLICY "anon_delete_guardians" ON guardians FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_guardians_school ON guardians(school_id);

-- Students
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id text NOT NULL,
  name text NOT NULL,
  grade_level text NOT NULL DEFAULT '1',
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  guardian_id uuid REFERENCES guardians(id) ON DELETE SET NULL,
  date_of_birth date,
  status text NOT NULL DEFAULT 'active',
  enrollment_date date DEFAULT CURRENT_DATE,
  blood_type text,
  medical_conditions text,
  national_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_guardian ON students(guardian_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_student_id ON students(school_id, student_id);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  due_date date,
  type text NOT NULL DEFAULT 'homework',
  total_marks integer NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_assignments" ON assignments;
CREATE POLICY "anon_select_assignments" ON assignments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_assignments" ON assignments;
CREATE POLICY "anon_insert_assignments" ON assignments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_assignments" ON assignments;
CREATE POLICY "anon_update_assignments" ON assignments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_assignments" ON assignments;
CREATE POLICY "anon_delete_assignments" ON assignments FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_assignments_school ON assignments(school_id);

-- Exams
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title text NOT NULL,
  term_id uuid REFERENCES terms(id) ON DELETE SET NULL,
  type text NOT NULL DEFAULT 'midterm',
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'upcoming',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_exams" ON exams;
CREATE POLICY "anon_select_exams" ON exams FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_exams" ON exams;
CREATE POLICY "anon_insert_exams" ON exams FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_exams" ON exams;
CREATE POLICY "anon_update_exams" ON exams FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_exams" ON exams;
CREATE POLICY "anon_delete_exams" ON exams FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_exams_school ON exams(school_id);

-- Grade Entries
CREATE TABLE IF NOT EXISTS grade_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  assignment_id uuid REFERENCES assignments(id) ON DELETE SET NULL,
  exam_id uuid REFERENCES exams(id) ON DELETE SET NULL,
  score numeric NOT NULL DEFAULT 0,
  feedback text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE grade_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_grade_entries" ON grade_entries;
CREATE POLICY "anon_select_grade_entries" ON grade_entries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_grade_entries" ON grade_entries;
CREATE POLICY "anon_insert_grade_entries" ON grade_entries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_grade_entries" ON grade_entries;
CREATE POLICY "anon_update_grade_entries" ON grade_entries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_grade_entries" ON grade_entries;
CREATE POLICY "anon_delete_grade_entries" ON grade_entries FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_grade_entries_school ON grade_entries(school_id);
CREATE INDEX IF NOT EXISTS idx_grade_entries_student ON grade_entries(student_id);

-- Attendance Records with UNIQUE constraint to prevent duplicates (CF-2)
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'present',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(school_id, student_id, class_id, date)
);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_attendance" ON attendance_records;
CREATE POLICY "anon_select_attendance" ON attendance_records FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_attendance" ON attendance_records;
CREATE POLICY "anon_insert_attendance" ON attendance_records FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_attendance" ON attendance_records;
CREATE POLICY "anon_update_attendance" ON attendance_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_attendance" ON attendance_records;
CREATE POLICY "anon_delete_attendance" ON attendance_records FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_attendance_school ON attendance_records(school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_records(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance_records(class_id, date);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'tuition',
  amount numeric NOT NULL DEFAULT 0,
  due_date date,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_invoices" ON invoices;
CREATE POLICY "anon_select_invoices" ON invoices FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_invoices" ON invoices;
CREATE POLICY "anon_insert_invoices" ON invoices FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_invoices" ON invoices;
CREATE POLICY "anon_update_invoices" ON invoices FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_invoices" ON invoices;
CREATE POLICY "anon_delete_invoices" ON invoices FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_invoices_school ON invoices(school_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_number ON invoices(school_id, invoice_number);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  date date DEFAULT CURRENT_DATE,
  method text NOT NULL DEFAULT 'cash',
  receipt_number text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_payments" ON payments;
CREATE POLICY "anon_select_payments" ON payments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
CREATE POLICY "anon_insert_payments" ON payments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_payments" ON payments;
CREATE POLICY "anon_update_payments" ON payments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_payments" ON payments;
CREATE POLICY "anon_delete_payments" ON payments FOR DELETE TO anon, authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_payments_school ON payments(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);

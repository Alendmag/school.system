export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type InstitutionType = 'school' | 'university' | 'college' | 'institute';
export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  relatedId?: string;
}

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'upcoming' | 'completed';
}

export interface Term {
  id: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface Guardian {
  id: string;
  name: string;
  phone: string;
  email: string;
  relation: string;
  address?: string;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  gradeLevel: string;
  classId?: string;
  guardianId?: string;
  dateOfBirth: string;
  status: 'active' | 'suspended' | 'withdrawn' | 'graduated';
  avatar?: string;
  enrollmentDate: string;
  bloodType?: string;
  medicalConditions?: string;
  routeId?: string;
  stopId?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjectIds: string[];
  qualifications: string;
  experienceYears: number;
  joinDate: string;
  status: 'active' | 'on_leave' | 'resigned';
}

export interface Class {
  id: string;
  name: string;
  level: string;
  capacity: number;
  advisorId?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  departmentId?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentId: string;
  title: string;
  type: 'tuition' | 'books' | 'transport' | 'activities' | 'other';
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled' | 'partial';
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: string;
  method: 'cash' | 'bank_transfer' | 'credit_card';
  receiptNumber: string;
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  classId: string;
  dueDate: string;
  type: 'homework' | 'project' | 'quiz' | 'lab' | 'oral';
  totalMarks: number;
  status: 'active' | 'closed';
}

export interface GradeEntry {
  id: string;
  studentId: string;
  assignmentId?: string;
  examId?: string;
  score: number;
  feedback?: string;
}

export interface Exam {
  id: string;
  title: string;
  termId: string;
  type: 'midterm' | 'final' | 'monthly';
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'academic' | 'alert' | 'info' | 'finance';
  read: boolean;
  userId?: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  totalCopies: number;
  availableCopies: number;
}

export interface BookBorrowing {
  id: string;
  bookId: string;
  studentId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
}

export interface TransportRoute {
  id: string;
  name: string;
  vehicleId: string;
  driverId: string;
  capacity: number;
}

export interface MedicalRecord {
  id: string;
  studentId: string;
  visitDate: string;
  reason: string;
  diagnosis: string;
  treatment: string;
}

export interface MockDatabase {
  users: User[];
  academicYears: AcademicYear[];
  terms: Term[];
  guardians: Guardian[];
  students: Student[];
  classes: Class[];
  subjects: Subject[];
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  invoices: Invoice[];
  payments: Payment[];
  assignments: Assignment[];
  exams: Exam[];
  grades: GradeEntry[];
  notifications: Notification[];
  libraryBooks: LibraryBook[];
  borrowings: BookBorrowing[];
  routes: TransportRoute[];
  medicalRecords: MedicalRecord[];
}

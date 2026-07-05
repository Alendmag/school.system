import { 
  User, Guardian, Student, Class, Subject, 
  Teacher, AttendanceRecord, Invoice, Payment, 
  Assignment, GradeEntry, Notification, MockDatabase,
  AcademicYear, Term, Exam, LibraryBook, BookBorrowing,
  TransportRoute, MedicalRecord
} from './types';

const generateMockData = (): MockDatabase => {
  const academicYears: AcademicYear[] = [
    { id: 'ay1', name: '2023-2024', startDate: '2023-09-01', endDate: '2024-06-30', status: 'completed' },
    { id: 'ay2', name: '2024-2025', startDate: '2024-09-01', endDate: '2025-06-30', status: 'active' },
    { id: 'ay3', name: '2025-2026', startDate: '2025-09-01', endDate: '2026-06-30', status: 'upcoming' },
  ];

  const terms: Term[] = [
    { id: 't1', academicYearId: 'ay2', name: 'الفصل الأول', startDate: '2024-09-01', endDate: '2025-01-15' },
    { id: 't2', academicYearId: 'ay2', name: 'الفصل الثاني', startDate: '2025-02-01', endDate: '2025-06-30' },
  ];

  const subjects: Subject[] = Array.from({ length: 25 }).map((_, i) => ({
    id: `sub${i+1}`,
    name: `مادة ${i+1}`,
    code: `SUB-${i+100}`,
  }));

  const teachers: Teacher[] = Array.from({ length: 60 }).map((_, i) => ({
    id: `t${i+1}`,
    name: `معلم ${i+1}`,
    email: `teacher${i+1}@school.edu`,
    phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
    subjectIds: [`sub${(i % 25) + 1}`, `sub${((i+1) % 25) + 1}`],
    qualifications: 'بكالوريوس التربية',
    experienceYears: Math.floor(Math.random() * 20) + 1,
    joinDate: '2020-09-01',
    status: 'active'
  }));

  const classes: Class[] = Array.from({ length: 30 }).map((_, i) => ({
    id: `c${i+1}`,
    name: `فصل ${i+1}`,
    level: `${(i % 12) + 1}`,
    capacity: 30,
    advisorId: `t${(i % 60) + 1}`
  }));

  const guardians: Guardian[] = Array.from({ length: 300 }).map((_, i) => ({
    id: `g${i+1}`,
    name: `ولي أمر ${i+1}`,
    phone: `09${Math.floor(10000000 + Math.random() * 90000000)}`,
    email: `guardian${i+1}@email.com`,
    relation: 'أب',
    address: 'المدينة، الحي الرئيسي'
  }));

  const students: Student[] = Array.from({ length: 500 }).map((_, i) => ({
    id: `s${i+1}`,
    studentId: `STD-${2024000 + i + 1}`,
    name: `طالب ${i+1}`,
    gradeLevel: `${(i % 12) + 1}`,
    classId: `c${(i % 30) + 1}`,
    guardianId: `g${(i % 300) + 1}`,
    dateOfBirth: '2010-05-14',
    status: 'active',
    enrollmentDate: '2024-09-01',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=s${i+1}`
  }));

  const attendance: AttendanceRecord[] = [];
  const invoices: Invoice[] = [];
  const payments: Payment[] = [];
  const grades: GradeEntry[] = [];
  
  for(let i=0; i<150; i++) {
    attendance.push({
      id: `att${i}`,
      studentId: `s${i+1}`,
      classId: `c${(i % 30) + 1}`,
      date: new Date().toISOString().split('T')[0],
      status: Math.random() > 0.1 ? 'present' : 'absent'
    });
    
    invoices.push({
      id: `inv${i}`,
      invoiceNumber: `INV-${9000+i}`,
      studentId: `s${i+1}`,
      title: 'قسط دراسي',
      type: 'tuition',
      amount: 1500,
      dueDate: '2024-12-01',
      status: Math.random() > 0.4 ? 'paid' : 'pending',
      createdAt: '2024-09-01'
    });
    
    if (invoices[i].status === 'paid') {
      payments.push({
        id: `pay${i}`,
        invoiceId: `inv${i}`,
        amount: 1500,
        date: '2024-11-01',
        method: 'bank_transfer',
        receiptNumber: `REC-${1000+i}`
      });
    }

    grades.push({
      id: `grd${i}`,
      studentId: `s${i+1}`,
      assignmentId: `asg1`,
      score: Math.floor(Math.random() * 20) + 80,
      feedback: 'عمل جيد'
    });
  }

  const libraryBooks: LibraryBook[] = [
    { id: 'b1', title: 'أساسيات الفيزياء', author: 'د. أحمد', category: 'علوم', isbn: '12345', totalCopies: 15, availableCopies: 10 },
    { id: 'b2', title: 'تاريخ العرب', author: 'أ. محمود', category: 'تاريخ', isbn: '67890', totalCopies: 5, availableCopies: 2 }
  ];

  const routes: TransportRoute[] = [
    { id: 'r1', name: 'المسار الشمالي', vehicleId: 'Bus-01', driverId: 'Dr-01', capacity: 40 },
    { id: 'r2', name: 'المسار الجنوبي', vehicleId: 'Bus-02', driverId: 'Dr-02', capacity: 30 }
  ];

  const users: User[] = [
    { id: 'u1', name: 'مدير النظام', email: 'admin@school.edu', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' },
    { id: 'u2', name: teachers[0].name, email: teachers[0].email, role: 'teacher', relatedId: teachers[0].id },
    { id: 'u3', name: students[0].name, email: 'student@school.edu', role: 'student', relatedId: students[0].id },
    { id: 'u4', name: guardians[0].name, email: guardians[0].email, role: 'parent', relatedId: guardians[0].id },
  ];

  return {
    users,
    academicYears,
    terms,
    guardians,
    students,
    classes,
    subjects,
    teachers,
    attendance,
    invoices,
    payments,
    assignments: [
      { id: 'asg1', title: 'اختبار تجريبي', subjectId: 'sub1', classId: 'c1', dueDate: '2024-11-20', type: 'quiz', totalMarks: 100, status: 'active' }
    ],
    exams: [
      { id: 'ex1', title: 'اختبارات منتصف الفصل', termId: 't1', type: 'midterm', startDate: '2024-11-01', endDate: '2024-11-15', status: 'completed' }
    ],
    grades,
    notifications: [],
    libraryBooks,
    borrowings: [],
    routes,
    medicalRecords: []
  };
};

export const INITIAL_DB: MockDatabase = generateMockData();

export const MOCK_STATS = {
  students: 500,
  teachers: 60,
  courses: 25,
  departments: 5,
};

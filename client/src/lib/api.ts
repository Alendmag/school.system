import { supabase } from './supabase';

async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'خطأ في الخادم' }));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  init: () => apiFetch<{ school: any; seeded: boolean }>('/api/init', { method: 'POST' }),

  // Students
  getStudents: (search?: string) =>
    apiFetch<{ data: any[]; count: number }>(`/api/students${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getStudent: (id: string) => apiFetch<any>(`/api/students/${id}`),
  getStudent360: (id: string) => apiFetch<any>(`/api/students/${id}/360`),
  createStudent: (data: any) => apiFetch<any>('/api/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent: (id: string, data: any) =>
    apiFetch<any>(`/api/students/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteStudent: (id: string) => apiFetch<any>(`/api/students/${id}`, { method: 'DELETE' }),

  // Classes
  getClasses: (level?: string) =>
    apiFetch<any[]>(`/api/classes${level ? `?level=${encodeURIComponent(level)}` : ''}`),
  createClass: (data: any) => apiFetch<any>('/api/classes', { method: 'POST', body: JSON.stringify(data) }),
  updateClass: (id: string, data: any) =>
    apiFetch<any>(`/api/classes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteClass: (id: string) => apiFetch<any>(`/api/classes/${id}`, { method: 'DELETE' }),

  // Guardians
  getGuardians: () => apiFetch<any[]>('/api/guardians'),

  // Subjects
  getSubjects: () => apiFetch<any[]>('/api/subjects'),
  createSubject: (data: any) => apiFetch<any>('/api/subjects', { method: 'POST', body: JSON.stringify(data) }),
  updateSubject: (id: string, data: any) =>
    apiFetch<any>(`/api/subjects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSubject: (id: string) => apiFetch<any>(`/api/subjects/${id}`, { method: 'DELETE' }),

  // Teachers
  getTeachers: () => apiFetch<any[]>('/api/teachers'),
  createTeacher: (data: any) => apiFetch<any>('/api/teachers', { method: 'POST', body: JSON.stringify(data) }),
  updateTeacher: (id: string, data: any) =>
    apiFetch<any>(`/api/teachers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTeacher: (id: string) => apiFetch<any>(`/api/teachers/${id}`, { method: 'DELETE' }),

  // Attendance
  getAttendance: (params?: { date?: string; class_id?: string }) => {
    const qs = new URLSearchParams();
    if (params?.date) qs.set('date', params.date);
    if (params?.class_id) qs.set('class_id', params.class_id);
    const q = qs.toString();
    return apiFetch<any[]>(`/api/attendance${q ? `?${q}` : ''}`);
  },
  saveAttendance: (records: any[]) =>
    apiFetch<any[]>('/api/attendance', { method: 'POST', body: JSON.stringify({ records }) }),

  // Invoices & Payments
  getInvoices: (studentId?: string) =>
    apiFetch<any[]>(`/api/invoices${studentId ? `?student_id=${studentId}` : ''}`),
  createInvoice: (data: any) =>
    apiFetch<any>('/api/invoices', { method: 'POST', body: JSON.stringify(data) }),
  getPayments: () => apiFetch<any[]>('/api/payments'),

  // Grades & Assignments
  getGrades: () => apiFetch<any[]>('/api/grades'),
  getAssignments: () => apiFetch<any[]>('/api/assignments'),
  getExams: () => apiFetch<any[]>('/api/exams'),

  // Academic Years
  getAcademicYears: () => apiFetch<any[]>('/api/academic-years'),
  createAcademicYear: (data: any) =>
    apiFetch<any>('/api/academic-years', { method: 'POST', body: JSON.stringify(data) }),
  updateAcademicYear: (id: string, data: any) =>
    apiFetch<any>(`/api/academic-years/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteAcademicYear: (id: string) =>
    apiFetch<any>(`/api/academic-years/${id}`, { method: 'DELETE' }),

  // Terms
  getTerms: (academicYearId?: string) =>
    apiFetch<any[]>(`/api/terms${academicYearId ? `?academic_year_id=${academicYearId}` : ''}`),
  createTerm: (data: any) =>
    apiFetch<any>('/api/terms', { method: 'POST', body: JSON.stringify(data) }),
  updateTerm: (id: string, data: any) =>
    apiFetch<any>(`/api/terms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTerm: (id: string) =>
    apiFetch<any>(`/api/terms/${id}`, { method: 'DELETE' }),

  // Teacher Assignments
  getTeacherAssignments: (params?: { academic_year_id?: string; teacher_id?: string; class_id?: string }) => {
    const qs = new URLSearchParams();
    if (params?.academic_year_id) qs.set('academic_year_id', params.academic_year_id);
    if (params?.teacher_id) qs.set('teacher_id', params.teacher_id);
    if (params?.class_id) qs.set('class_id', params.class_id);
    const q = qs.toString();
    return apiFetch<any[]>(`/api/teacher-assignments${q ? `?${q}` : ''}`);
  },
  createTeacherAssignment: (data: any) =>
    apiFetch<any>('/api/teacher-assignments', { method: 'POST', body: JSON.stringify(data) }),
  deleteTeacherAssignment: (id: string) =>
    apiFetch<any>(`/api/teacher-assignments/${id}`, { method: 'DELETE' }),

  // Reports
  getReportSummary: () => apiFetch<any>('/api/reports/summary'),
};

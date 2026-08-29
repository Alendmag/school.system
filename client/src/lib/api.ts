let currentSchoolId: string | null = null;

export function setCurrentSchoolId(id: string) {
  currentSchoolId = id;
}

export function getCurrentSchoolId(): string | null {
  return currentSchoolId;
}

async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (currentSchoolId) {
    headers['x-school-id'] = currentSchoolId;
  }
  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'خطأ في الخادم' }));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Init / School
  init: () => apiFetch<{ school: any; seeded: boolean }>('/api/init', { method: 'POST' }),
  getSchools: () => apiFetch<any[]>('/api/schools'),

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

  // Guardians
  getGuardians: () => apiFetch<any[]>('/api/guardians'),

  // Subjects
  getSubjects: () => apiFetch<any[]>('/api/subjects'),

  // Teachers
  getTeachers: () => apiFetch<any[]>('/api/teachers'),

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

  // Invoices
  getInvoices: (studentId?: string) =>
    apiFetch<any[]>(`/api/invoices${studentId ? `?student_id=${studentId}` : ''}`),
  createInvoice: (data: any) =>
    apiFetch<any>('/api/invoices', { method: 'POST', body: JSON.stringify(data) }),

  // Payments
  getPayments: () => apiFetch<any[]>('/api/payments'),

  // Grades
  getGrades: () => apiFetch<any[]>('/api/grades'),

  // Assignments
  getAssignments: () => apiFetch<any[]>('/api/assignments'),

  // Exams
  getExams: () => apiFetch<any[]>('/api/exams'),

  // Academic Years
  getAcademicYears: () => apiFetch<any[]>('/api/academic-years'),

  // Terms
  getTerms: () => apiFetch<any[]>('/api/terms'),

  // Reports
  getReportSummary: () => apiFetch<any>('/api/reports/summary'),
};

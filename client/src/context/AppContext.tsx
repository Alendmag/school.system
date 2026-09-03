import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, Theme, InstitutionType, User, Institution } from '../lib/types';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

export interface AppData {
  students: any[];
  classes: any[];
  teachers: any[];
  subjects: any[];
  guardians: any[];
  invoices: any[];
  payments: any[];
  attendance: any[];
  assignments: any[];
  exams: any[];
  grades: any[];
  academicYears: any[];
  terms: any[];
  teacherAssignments: any[];
}

const emptyData: AppData = {
  students: [], classes: [], teachers: [], subjects: [], guardians: [],
  invoices: [], payments: [], attendance: [], assignments: [], exams: [],
  grades: [], academicYears: [], terms: [], teacherAssignments: [],
};

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  institutionType: InstitutionType;
  setInstitutionType: (type: InstitutionType) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  institution: Institution;
  setInstitution: (inst: Institution) => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  data: AppData;
  loading: boolean;
  schoolId: string | null;
  refreshData: () => Promise<void>;
  refreshStudents: () => Promise<void>;
  refreshAttendance: () => Promise<void>;
  refreshInvoices: () => Promise<void>;
  refreshTeachers: () => Promise<void>;
  refreshClasses: () => Promise<void>;
  refreshSubjects: () => Promise<void>;
  refreshAcademicYears: () => Promise<void>;
  refreshTerms: () => Promise<void>;
  refreshTeacherAssignments: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [language, setLanguage] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('light');
  const [institutionType, setInstitutionType] = useState<InstitutionType>('school');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [institution, setInstitution] = useState<Institution>({
    id: 'inst-1', name: 'مدرسة التميز النموذجية', type: 'school',
  });
  const [data, setData] = useState<AppData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [schoolId, setSchoolId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setCurrentUser({
        id: profile.userId,
        name: profile.name,
        email: '',
        role: profile.role as any,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`,
      });
      setSchoolId(profile.schoolId);
    }
  }, [profile]);

  const refreshStudents = useCallback(async () => {
    try {
      const res = await api.getStudents();
      setData(prev => ({ ...prev, students: res.data || [] }));
    } catch (e) { console.error('refreshStudents:', e); }
  }, []);

  const refreshAttendance = useCallback(async () => {
    try {
      const att = await api.getAttendance();
      setData(prev => ({ ...prev, attendance: att || [] }));
    } catch (e) { console.error('refreshAttendance:', e); }
  }, []);

  const refreshInvoices = useCallback(async () => {
    try {
      const inv = await api.getInvoices();
      setData(prev => ({ ...prev, invoices: inv || [] }));
    } catch (e) { console.error('refreshInvoices:', e); }
  }, []);

  const refreshTeachers = useCallback(async () => {
    try {
      const t = await api.getTeachers();
      setData(prev => ({ ...prev, teachers: t || [] }));
    } catch (e) { console.error('refreshTeachers:', e); }
  }, []);

  const refreshClasses = useCallback(async () => {
    try {
      const c = await api.getClasses();
      setData(prev => ({ ...prev, classes: c || [] }));
    } catch (e) { console.error('refreshClasses:', e); }
  }, []);

  const refreshSubjects = useCallback(async () => {
    try {
      const s = await api.getSubjects();
      setData(prev => ({ ...prev, subjects: s || [] }));
    } catch (e) { console.error('refreshSubjects:', e); }
  }, []);

  const refreshAcademicYears = useCallback(async () => {
    try {
      const ay = await api.getAcademicYears();
      setData(prev => ({ ...prev, academicYears: ay || [] }));
    } catch (e) { console.error('refreshAcademicYears:', e); }
  }, []);

  const refreshTerms = useCallback(async () => {
    try {
      const t = await api.getTerms();
      setData(prev => ({ ...prev, terms: t || [] }));
    } catch (e) { console.error('refreshTerms:', e); }
  }, []);

  const refreshTeacherAssignments = useCallback(async () => {
    try {
      const ta = await api.getTeacherAssignments();
      setData(prev => ({ ...prev, teacherAssignments: ta || [] }));
    } catch (e) { console.error('refreshTeacherAssignments:', e); }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [studentsRes, classes, teachers, subjects, guardians, invoices, payments, attendance, assignments, exams, grades, academicYears, terms, teacherAssignments] = await Promise.all([
        api.getStudents(),
        api.getClasses(),
        api.getTeachers(),
        api.getSubjects(),
        api.getGuardians(),
        api.getInvoices(),
        api.getPayments(),
        api.getAttendance(),
        api.getAssignments(),
        api.getExams(),
        api.getGrades(),
        api.getAcademicYears(),
        api.getTerms(),
        api.getTeacherAssignments(),
      ]);
      setData({
        students: studentsRes.data || [],
        classes: classes || [],
        teachers: teachers || [],
        subjects: subjects || [],
        guardians: guardians || [],
        invoices: invoices || [],
        payments: payments || [],
        attendance: attendance || [],
        assignments: assignments || [],
        exams: exams || [],
        grades: grades || [],
        academicYears: academicYears || [],
        terms: terms || [],
        teacherAssignments: teacherAssignments || [],
      });
    } catch (e) { console.error('refreshData:', e); }
  }, []);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    async function init() {
      setLoading(true);
      try {
        await api.init();
        if (!cancelled) await refreshData();
      } catch (e) { console.error('init:', e); }
      if (!cancelled) setLoading(false);
    }
    init();
    return () => { cancelled = true; };
  }, [profile, refreshData]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLanguage = () => setLanguage(prev => prev === 'ar' ? 'en' : 'ar');

  return (
    <AppContext.Provider value={{
      language, setLanguage, theme, setTheme, institutionType, setInstitutionType,
      currentUser, setCurrentUser, institution, setInstitution, toggleTheme, toggleLanguage,
      data, loading, schoolId, refreshData, refreshStudents, refreshAttendance, refreshInvoices,
      refreshTeachers, refreshClasses, refreshSubjects, refreshAcademicYears, refreshTerms,
      refreshTeacherAssignments,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
}

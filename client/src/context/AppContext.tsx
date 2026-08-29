import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, Theme, InstitutionType, User, Institution } from '../lib/types';
import { api, setCurrentSchoolId, getCurrentSchoolId } from '../lib/api';

interface AppData {
  students: any[];
  classes: any[];
  guardians: any[];
  subjects: any[];
  teachers: any[];
  attendance: any[];
  invoices: any[];
  payments: any[];
  grades: any[];
  assignments: any[];
  exams: any[];
  academicYears: any[];
  terms: any[];
}

const EMPTY_DATA: AppData = {
  students: [], classes: [], guardians: [], subjects: [],
  teachers: [], attendance: [], invoices: [], payments: [],
  grades: [], assignments: [], exams: [], academicYears: [], terms: [],
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
  schoolId: string | null;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  refreshStudents: () => Promise<void>;
  refreshAttendance: (params?: { date?: string; class_id?: string }) => Promise<void>;
  refreshInvoices: () => Promise<void>;
}

const defaultUser: User = {
  id: 'u1',
  name: 'د. سامي العلي',
  email: 'admin@school.edu',
  role: 'admin',
};

const defaultInstitution: Institution = {
  id: 'inst-1',
  name: 'مدرسة التميز النموذجية',
  type: 'school',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('light');
  const [institutionType, setInstitutionType] = useState<InstitutionType>('school');
  const [currentUser, setCurrentUser] = useState<User | null>(defaultUser);
  const [institution, setInstitution] = useState<Institution>(defaultInstitution);
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllData = useCallback(async () => {
    if (!getCurrentSchoolId()) return;
    try {
      const [
        studentsRes, classes, guardians, subjects, teachers,
        invoices, payments, grades, assignments, exams, academicYears, terms
      ] = await Promise.all([
        api.getStudents(),
        api.getClasses(),
        api.getGuardians(),
        api.getSubjects(),
        api.getTeachers(),
        api.getInvoices(),
        api.getPayments(),
        api.getGrades(),
        api.getAssignments(),
        api.getExams(),
        api.getAcademicYears(),
        api.getTerms(),
      ]);

      setData({
        students: studentsRes.data || [],
        classes, guardians, subjects, teachers,
        invoices, payments, grades, assignments,
        exams, academicYears, terms,
        attendance: [],
      });
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const result = await api.init();
        const sid = result.school.id;
        setCurrentSchoolId(sid);
        setSchoolId(sid);
        setInstitution({ ...defaultInstitution, id: sid });
        await loadAllData();
      } catch (err: any) {
        console.error('Init failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [loadAllData]);

  const refreshData = useCallback(async () => {
    await loadAllData();
  }, [loadAllData]);

  const refreshStudents = useCallback(async () => {
    try {
      const res = await api.getStudents();
      setData(prev => ({ ...prev, students: res.data || [] }));
    } catch (err: any) {
      console.error('Failed to refresh students:', err);
    }
  }, []);

  const refreshAttendance = useCallback(async (params?: { date?: string; class_id?: string }) => {
    try {
      const records = await api.getAttendance(params);
      setData(prev => ({ ...prev, attendance: records }));
    } catch (err: any) {
      console.error('Failed to refresh attendance:', err);
    }
  }, []);

  const refreshInvoices = useCallback(async () => {
    try {
      const [invoices, payments] = await Promise.all([api.getInvoices(), api.getPayments()]);
      setData(prev => ({ ...prev, invoices, payments }));
    } catch (err: any) {
      console.error('Failed to refresh invoices:', err);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLanguage = () => setLanguage(prev => prev === 'ar' ? 'en' : 'ar');

  return (
    <AppContext.Provider value={{
      language, setLanguage, theme, setTheme,
      institutionType, setInstitutionType,
      currentUser, setCurrentUser,
      institution, setInstitution,
      toggleTheme, toggleLanguage,
      data, schoolId, loading, error,
      refreshData, refreshStudents, refreshAttendance, refreshInvoices,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

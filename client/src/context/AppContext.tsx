import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { Language, Theme, InstitutionType, UserRole, User, Institution, MockDatabase } from '../lib/types';
import { INITIAL_DB } from '../lib/mockData';
import { ERPServices } from '../lib/services';

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
  
  // Mock Database State & Services
  db: MockDatabase;
  setDb: React.Dispatch<React.SetStateAction<MockDatabase>>;
  services: ERPServices;
}

const defaultInstitution: Institution = {
  id: 'inst-1',
  name: 'أكاديمية المستقبل',
  type: 'school',
};

const defaultUser: User = {
  id: 'u1',
  name: 'د. سامي العلي',
  email: 'admin@school.edu',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sami'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('light');
  const [institutionType, setInstitutionType] = useState<InstitutionType>('school');
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_DB.users[0]);
  const [institution, setInstitution] = useState<Institution>({
    ...defaultInstitution,
    type: 'school',
    name: 'مدرسة التميز النموذجية'
  });
  
  // Initialize Mock DB
  const [db, setDb] = useState<MockDatabase>(INITIAL_DB);
  
  // Memoize services to avoid recreating on every render, but update when db changes
  const services = useMemo(() => new ERPServices(db), [db]);

  useEffect(() => {
    // Handle HTML dir and lang attributes
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    // Handle dark mode class
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
      language,
      setLanguage,
      theme,
      setTheme,
      institutionType,
      setInstitutionType,
      currentUser,
      setCurrentUser,
      institution,
      setInstitution,
      toggleTheme,
      toggleLanguage,
      db,
      setDb,
      services
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

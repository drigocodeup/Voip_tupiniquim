import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

type NavSection = 'dashboard' | 'chat' | 'calls' | 'meet' | 'agenda' | 'contacts' | 'settings' | 'admin';

interface AuthContextValue {
  currentUser: { name: string; role: 'admin' | 'user' };
  isAdmin: boolean;
  activeSection: NavSection;
  setActiveSection: (section: NavSection) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser: { name: 'Admin', role: 'admin' },
      isAdmin: true,
      activeSection,
      setActiveSection,
    }),
    [activeSection],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

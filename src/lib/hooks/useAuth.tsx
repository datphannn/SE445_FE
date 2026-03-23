'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  avatar: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, role: AuthUser['role']) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// Mock users database
const MOCK_USERS: (AuthUser & { password: string })[] = [
  { id: '1', name: 'Admin User', email: 'admin@acme.com', password: 'admin123', role: 'admin', avatar: 'AU' },
  { id: '2', name: 'HR Manager', email: 'hr@acme.com', password: 'hr123', role: 'manager', avatar: 'HM' },
];

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    try {
      const saved = localStorage.getItem('acme-auth-user');
      if (saved) setUser(JSON.parse(saved));
    } catch {}
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...authUser } = found;
      setUser(authUser);
      localStorage.setItem('acme-auth-user', JSON.stringify(authUser));
      setIsLoading(false);
      return { success: true };
    }
    setIsLoading(false);
    return { success: false, error: 'Invalid email or password' };
  };

  const register = async (name: string, email: string, password: string, role: AuthUser['role']): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const exists = MOCK_USERS.find(u => u.email === email);
    if (exists) {
      setIsLoading(false);
      return { success: false, error: 'Email already registered' };
    }
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const newUser: AuthUser = {
      id: String(MOCK_USERS.length + 1),
      name, email, role,
      avatar: initials,
    };
    MOCK_USERS.push({ ...newUser, password });
    setUser(newUser);
    localStorage.setItem('acme-auth-user', JSON.stringify(newUser));
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('acme-auth-user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import { createContext, useContext } from 'react';
export interface User {
  _id: string;
  name: string;
  email: string;
  preferences?: { jobTitle?: string; location?: string; remote?: boolean; minSalary?: number; maxSalary?: number };
}
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessionError: string | null;
  refresh: () => Promise<void>;
  setUser: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};


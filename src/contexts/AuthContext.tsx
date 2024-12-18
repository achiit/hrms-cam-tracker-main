import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface User {
  id: string;
  role: 'admin' | 'employee';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (employeeId: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_CREDENTIALS = {
  id: '00000',
  password: 'admin001',
  name: 'Admin'
};

const EMPLOYEE_CREDENTIALS = {
  id: '39466',
  password: 'Aditya@123',
  name: 'Aditya'
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const login = async (employeeId: string, password: string) => {
    // Simple authentication logic for demo
    if (employeeId === ADMIN_CREDENTIALS.id && password === ADMIN_CREDENTIALS.password) {
      setUser({ id: ADMIN_CREDENTIALS.id, role: 'admin', name: ADMIN_CREDENTIALS.name });
      navigate('/admin');
      toast({
        title: "Welcome Admin",
        description: "You have successfully logged in",
      });
    } else if (employeeId === EMPLOYEE_CREDENTIALS.id && password === EMPLOYEE_CREDENTIALS.password) {
      setUser({ id: EMPLOYEE_CREDENTIALS.id, role: 'employee', name: EMPLOYEE_CREDENTIALS.name });
      navigate('/employee');
      toast({
        title: "Welcome Employee",
        description: "You have successfully logged in",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    navigate('/');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
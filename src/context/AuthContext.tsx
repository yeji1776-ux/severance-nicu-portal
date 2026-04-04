import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email?: string | null;
  name: string;
  role: 'parent' | 'admin';
}

interface PatientInfo {
  id: number;
  name: string;
  nickname?: string | null;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  patient: PatientInfo | null;
  currentDepartment: string | null;
  setCurrentDepartment: (slug: string) => void;
  login: (email: string, password: string) => Promise<User>;
  registerParent: (chartNumber: string, name: string) => Promise<User>;
  loginParent: (chartNumber: string) => Promise<User>;
  setNickname: (nickname: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [currentDepartment, setCurrentDepartmentState] = useState<string | null>(
    () => localStorage.getItem('currentDepartment')
  );

  function setCurrentDepartment(slug: string) {
    setCurrentDepartmentState(slug);
    localStorage.setItem('currentDepartment', slug);
  }

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else {
      localStorage.removeItem('nicu-session');
      localStorage.removeItem('nicu-accounts');
      setLoading(false);
    }
  }, []);

  async function fetchUser(t: string) {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ id: data.id, email: data.email, name: data.name, role: data.role });
        if (data.patients?.length > 0) {
          setPatient({ id: data.patients[0].id, name: data.patients[0].name, nickname: data.patients[0].nickname, status: data.patients[0].status });
        }
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch {
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string): Promise<User> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || '로그인에 실패했습니다.');
    }

    const data = await res.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);

    const userData: User = { id: data.user.id, email: data.user.email, name: data.user.name, role: data.user.role };
    setUser(userData);
    return userData;
  }

  async function registerParent(chartNumber: string, name: string): Promise<User> {
    const res = await fetch('/api/auth/register-parent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chartNumber, name }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || '가입에 실패했습니다.');
    }

    const data = await res.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);

    const userData: User = { id: data.user.id, name: data.user.name, role: 'parent' };
    setUser(userData);
    if (data.patient) {
      setPatient(data.patient);
    }
    return userData;
  }

  async function loginParent(chartNumber: string): Promise<User> {
    const res = await fetch('/api/auth/login-parent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chartNumber }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || '로그인에 실패했습니다.');
    }

    const data = await res.json();
    localStorage.setItem('token', data.token);
    setToken(data.token);

    const userData: User = { id: data.user.id, name: data.user.name, role: 'parent' };
    setUser(userData);
    if (data.patient) {
      setPatient(data.patient);
    }
    return userData;
  }

  async function setNickname(nickname: string) {
    if (!patient || !token) return;
    const res = await fetch(`/api/patients/${patient.id}/nickname`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nickname }),
    });
    if (res.ok) {
      setPatient(prev => prev ? { ...prev, nickname: nickname || null } : prev);
    }
  }

  function logout() {
    localStorage.removeItem('currentDepartment');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setPatient(null);
    setCurrentDepartmentState(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, patient, currentDepartment, setCurrentDepartment, login, registerParent, loginParent, setNickname, logout }}>
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

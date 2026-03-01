import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'parent' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  guestEnter: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser(token);
    } else if (localStorage.getItem('guest') === 'true') {
      setUser({ id: 0, email: 'guest@nicu.kr', name: '보호자', role: 'parent' });
      setLoading(false);
    } else {
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

  function guestEnter() {
    const guestUser: User = { id: 0, email: 'guest@nicu.kr', name: '보호자', role: 'parent' };
    setUser(guestUser);
    localStorage.setItem('guest', 'true');
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('guest');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, guestEnter, logout }}>
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

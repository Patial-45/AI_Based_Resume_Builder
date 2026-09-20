import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import axios from 'axios';
import { authAPI, setCsrfToken } from '../services/api';
import { AuthContext, type User } from './auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const revision = useRef(0);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const accept = (data: User & { csrfToken: string }) => {
    const { csrfToken, ...account } = data;
    setCsrfToken(csrfToken);
    setUser(account);
    setSessionError(null);
  };
  const refresh = useCallback(async () => {
    const requestRevision = ++revision.current;
    setLoading(true);
    try { const response = await authAPI.get('/auth/profile', { timeout: 10000 }); if (requestRevision === revision.current) accept(response.data); }
    catch (error) {
      if (requestRevision !== revision.current) return;
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setUser(null); setCsrfToken(null); setSessionError(null);
      } else setSessionError('We could not check your session. Check your connection and retry.');
    } finally { if (requestRevision === revision.current) setLoading(false); }
  }, []);
  useEffect(() => {
    // Retire the legacy credential cache without parsing untrusted stored JSON.
    try { localStorage.removeItem('token'); localStorage.removeItem('user'); } catch { /* Storage may be disabled. */ }
    void refresh();
    const expired = () => { revision.current++; setLoading(false); setSessionError(null); setUser(null); setCsrfToken(null); };
    window.addEventListener('session-expired', expired);
    const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('account-session');
    if (channel) channel.onmessage = () => { void refresh(); };
    return () => { window.removeEventListener('session-expired', expired); channel?.close(); };
  }, [refresh]);
  const notifyTabs = () => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('account-session');
      channel.postMessage('changed'); channel.close();
    }
  };
  const login = async (email: string, password: string) => {
    revision.current++;
    try { accept((await authAPI.post('/auth/login', { email, password }, { timeout: 20000 })).data); notifyTabs(); }
    finally { setLoading(false); }
  };
  const register = async (name: string, email: string, password: string) => {
    revision.current++;
    try { accept((await authAPI.post('/auth/register', { name, email, password }, { timeout: 20000 })).data); notifyTabs(); }
    finally { setLoading(false); }
  };
  const logout = async () => {
    try { await authAPI.post('/auth/logout'); }
    catch (error) { if (!axios.isAxiosError(error) || error.response?.status !== 401) throw error; }
    window.dispatchEvent(new Event('session-logout'));
    revision.current++; setLoading(false); setUser(null); setCsrfToken(null); notifyTabs();
  };
  return <AuthContext.Provider value={{ user, loading, sessionError, refresh, setUser, login, register, logout }}>{children}</AuthContext.Provider>;
};

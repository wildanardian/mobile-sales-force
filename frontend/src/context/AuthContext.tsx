import {
  createContext, useCallback, useContext, useEffect, useLayoutEffect,
  useMemo, useRef, useState, type ReactNode,
} from 'react';
import { isAxiosError, type InternalAxiosRequestConfig } from 'axios';
import { api } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { AccessToken, AuthContextValue, AuthResult, LoginPayload, User } from '../types/auth';

type Retryable = InternalAxiosRequestConfig & { _retry?: boolean };

// 401 dari endpoint ini tidak boleh memicu refresh (mencegah loop)
const isAuthUrl = (url = '') => url.includes('/login') || url.includes('/refresh');

const AuthContext = createContext<AuthContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // undefined = belum dicek ke server, null = belum login, string = sudah login
  const [token, setToken] = useState<AccessToken>(undefined);
  const [user, setUser] = useState<User | null>(null);

  // Satu promise /refresh dipakai bersama: efek mount ganda (StrictMode) dan
  // beberapa 401 sekaligus hanya menghasilkan SATU panggilan. Ini penting karena
  // backend merotasi refresh token; panggilan kedua dengan token lama akan ditolak.
  const refreshing = useRef<Promise<string> | null>(null);
  // Naik setiap login/logout, agar hasil /refresh yang terlambat tidak menimpa sesi baru
  const sessionVersion = useRef(0);

  const refreshSession = useCallback((): Promise<string> => {
    if (!refreshing.current) {
      const version = sessionVersion.current;
      refreshing.current = api
        .post<ApiResponse<AuthResult>>('/refresh')
        .then(({ data }) => {
          if (version === sessionVersion.current) {
            setToken(data.data.access_token);
            setUser(data.data.user);
          }
          return data.data.access_token;
        })
        .catch((error: unknown) => {
          if (version === sessionVersion.current) {
            setToken(null);
            setUser(null);
          }
          throw error;
        })
        .finally(() => {
          refreshing.current = null;
        });
    }
    return refreshing.current;
  }, []);

  // Saat aplikasi dibuka: pulihkan sesi memakai cookie refresh_token (HttpOnly)
  useEffect(() => {
    refreshSession().catch(() => {
      // belum login atau sesi habis: state sudah diset null di refreshSession
    });
  }, [refreshSession]);

  // Request interceptor. useLayoutEffect (bukan useEffect) agar sudah terpasang
  // sebelum efek komponen anak mengirim request pertamanya.
  useLayoutEffect(() => {
    const id = api.interceptors.request.use((config: Retryable) => {
      // Request ulangan (_retry) sudah membawa token baru, jangan ditimpa token lama
      if (token && !config._retry) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return () => api.interceptors.request.eject(id);
  }, [token]);

  // Response interceptor: access token habis -> refresh -> ulangi request sekali
  useLayoutEffect(() => {
    const id = api.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        if (!isAxiosError(error) || !error.config) throw error;

        const original: Retryable = error.config;
        const shouldRefresh =
          error.response?.status === 401 && !original._retry && !isAuthUrl(original.url);
        if (!shouldRefresh) throw error;

        original._retry = true; // request ulangan yang 401 lagi tidak di-refresh lagi
        let newToken: string;
        try {
          newToken = await refreshSession();
        } catch {
          // Refresh gagal: state sudah null, ProtectedRoute mengarahkan ke /login
          throw error;
        }
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      },
    );
    return () => api.interceptors.response.eject(id);
  }, [refreshSession]);

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    const { data } = await api.post<ApiResponse<AuthResult>>('/login', payload);
    sessionVersion.current += 1;
    setToken(data.data.access_token);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.post('/logout');
    } finally {
      // Tetap keluar di sisi klien walau request gagal
      sessionVersion.current += 1;
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ token, user, login, logout }),
    [token, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

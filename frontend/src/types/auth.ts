// src/types/auth.ts

// Role dibatasi 4 nilai, sama dengan enum di backend
export type RoleName = 'mr' | 'dm' | 'rsm' | 'mm';

export interface User {
  id: number;
  name: string;
  email: string;
  role: RoleName;
}

// Body request POST /login
export interface LoginPayload {
  email: string;
  password: string;
}

// Isi `data` dari POST /login dan POST /refresh
// (refresh token TIDAK ada di sini: dikirim sebagai cookie HttpOnly)
export interface AuthResult {
  access_token: string;
  token_type: string;   // "bearer"
  expires_in: number;   // detik, 3600 (JWT_TTL 60 menit)
  user: User;
}

// Status token di memory:
// undefined = belum dicek ke server (tampilkan loading)
// null      = belum login
// string    = sudah login
export type AccessToken = string | null | undefined;

// Bentuk nilai yang disediakan AuthContext
export interface AuthContextValue {
  token: AccessToken;
  user: User | null;
  login: (payload: LoginPayload) => Promise<User>;
  logout: () => Promise<void>;
}
import axios from 'axios';

// Hanya instance axios. Token disisipkan oleh interceptor di AuthProvider.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  withCredentials: true, // agar cookie refresh_token (HttpOnly) ikut terkirim
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

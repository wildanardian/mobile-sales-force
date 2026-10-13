import { isAxiosError } from 'axios';
import type { ApiErrorBody } from '../types/api';

export interface ParsedError {
  message: string;
  fieldErrors: Record<string, string>; // pesan pertama tiap field (422)
  status?: number;
}

const NETWORK_MESSAGE = 'Tidak dapat terhubung ke server.';
const SERVER_MESSAGE = 'Terjadi kesalahan pada server. Silakan coba lagi.';
const FALLBACK_MESSAGE = 'Terjadi kesalahan. Silakan coba lagi.';
const VALIDATION_MESSAGE = 'Data yang dikirim tidak valid.';

// Body error bisa bukan JSON (mis. halaman HTML dari proxy), jadi dicek dulu
const asErrorBody = (data: unknown): ApiErrorBody =>
  typeof data === 'object' && data !== null ? (data as ApiErrorBody) : {};

export function parseError(error: unknown): ParsedError {
  if (!isAxiosError(error)) {
    return { message: FALLBACK_MESSAGE, fieldErrors: {} };
  }

  // Tanpa response: server mati, timeout, atau diblokir CORS
  if (!error.response) {
    return { message: NETWORK_MESSAGE, fieldErrors: {} };
  }

  const { status } = error.response;
  const body = asErrorBody(error.response.data);

  if (status === 422) {
    const fieldErrors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(body.errors ?? {})) {
      if (messages.length > 0) fieldErrors[field] = messages[0];
    }
    return { message: body.message ?? VALIDATION_MESSAGE, fieldErrors, status };
  }

  // 5xx: pesan backend bisa berisi detail internal, jadi tidak ditampilkan
  if (status >= 500) {
    return { message: SERVER_MESSAGE, fieldErrors: {}, status };
  }

  // 401 login salah, 403, 409, dst.: pakai pesan dari backend
  return { message: body.message ?? FALLBACK_MESSAGE, fieldErrors: {}, status };
}

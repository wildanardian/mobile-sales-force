import { api } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { CallActual, CreateCallActualPayload } from '../types/callActual';

export const callActualService = {
  // Kunjungan milik user yang login, terbaru dulu. Sengaja tanpa ?month=:
  // halaman butuh semua kunjungan untuk mencocokkan plan yang sudah dikunjungi.
  async getAll(): Promise<CallActual[]> {
    const res = await api.get<ApiResponse<CallActual[]>>('/call-actuals');
    return res.data.data;
  },

  async create(payload: CreateCallActualPayload): Promise<CallActual> {
    const res = await api.post<ApiResponse<CallActual>>('/call-actuals', payload);
    return res.data.data;
  },
};

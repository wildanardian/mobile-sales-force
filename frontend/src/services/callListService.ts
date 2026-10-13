import { api } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { DecisionRecord, PendingCallList } from '../types/approval';
import type {
  CallList, CreateCallListPayload, DecideCallListPayload, UpdateCallListPayload,
} from '../types/callList';

export const callListService = {
  // Call List milik user yang login, periode terbaru di atas
  async getAll(): Promise<CallList[]> {
    const res = await api.get<ApiResponse<CallList[]>>('/call-lists');
    return res.data.data;
  },

  async getById(id: number): Promise<CallList> {
    const res = await api.get<ApiResponse<CallList>>(`/call-lists/${id}`);
    return res.data.data;
  },

  // Selalu tersimpan sebagai draft (field `submit` sengaja tidak dikirim)
  async create(payload: CreateCallListPayload): Promise<CallList> {
    const res = await api.post<ApiResponse<CallList>>('/call-lists', payload);
    return res.data.data;
  },

  // Di backend, route untuk mengubah dokter bernama /resubmit
  async update(id: number, payload: UpdateCallListPayload): Promise<CallList> {
    const res = await api.patch<ApiResponse<CallList>>(`/call-lists/${id}/resubmit`, payload);
    return res.data.data;
  },

  async submit(id: number): Promise<CallList> {
    const res = await api.patch<ApiResponse<CallList>>(`/call-lists/${id}/submit`);
    return res.data.data;
  },

  // Antrean persetujuan milik atasan yang login (backend yang menyaring bawahan langsung),
  // paling lama menunggu di atas
  async getPendingApproval(): Promise<PendingCallList[]> {
    const res = await api.get<ApiResponse<PendingCallList[]>>('/call-lists/pending-approval');
    return res.data.data;
  },

  // Semua keputusan (approved dan rejected) yang dibuat user login, terbaru dulu
  async getDecisions(): Promise<DecisionRecord[]> {
    const res = await api.get<ApiResponse<DecisionRecord[]>>('/call-lists/decisions');
    return res.data.data;
  },

  // Keputusan atasan langsung. Reject mengembalikan call list ke draft.
  async decide(id: number, payload: DecideCallListPayload): Promise<CallList> {
    const res = await api.patch<ApiResponse<CallList>>(`/call-lists/${id}/approve`, payload);
    return res.data.data;
  },
};

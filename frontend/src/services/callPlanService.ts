import { api } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { CallPlan, CreateCallPlanPayload } from '../types/callPlan';

export const callPlanService = {
  // Call Plan milik user yang login
  async getAll(): Promise<CallPlan[]> {
    const res = await api.get<ApiResponse<CallPlan[]>>('/call-plans');
    return res.data.data;
  },

  // Backend membalas 200 (bukan 201); axios menganggap semua 2xx sukses
  async create(payload: CreateCallPlanPayload): Promise<CallPlan> {
    const res = await api.post<ApiResponse<CallPlan>>('/call-plans', payload);
    return res.data.data;
  },
};

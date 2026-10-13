import type { Doctor } from './master';

export type CallPlanStatus = 'planned' | 'cancelled';

// Baris call_plans apa adanya dari backend, ditambah relasi doctor
export interface CallPlan {
  id: number;
  call_list_id: number;
  user_id: number;
  doctor_id: number;
  plan_date: string; // 'YYYY-MM-DD'
  plan_time: string; // 'HH:mm' pada respons create, 'HH:mm:ss' bila dibaca dari database
  status: CallPlanStatus;
  created_at: string;
  updated_at: string;
  doctor: Doctor;
}

// Body POST /call-plans (user_id dan status ditentukan backend)
export interface CreateCallPlanPayload {
  call_list_id: number;
  doctor_id: number;
  plan_date: string; // 'YYYY-MM-DD'
  plan_time: string; // 'HH:mm'
}

import type { Doctor, Product } from './master';

// Ditentukan backend dari data kunjungan; tidak pernah dikirim dari klien
export type VisitType = 'planned' | 'unplan' | 'non_target';

// Produk seperti yang dikirim di dalam kunjungan (tanpa category)
export type VisitProduct = Pick<Product, 'id' | 'name'>;

// Bentuk CallActualResource di backend
export interface CallActual {
  id: number;
  plan_id: number | null;
  visit_type: VisitType;
  visit_date: string; // 'YYYY-MM-DD'
  check_in: string; // 'HH:mm:ss'
  check_out: string; // 'HH:mm:ss'
  photo_url: string;
  signature_url: string;
  doctor: Doctor;
  products: VisitProduct[];
}

// Body POST /call-actuals (user_id dan visit_type ditentukan backend)
export interface CreateCallActualPayload {
  plan_id: number | null;
  doctor_id: number;
  visit_date: string; // 'YYYY-MM-DD'
  check_in: string; // 'HH:mm:ss'
  check_out: string; // 'HH:mm:ss'
  photo_url: string;
  signature_url: string;
  products: number[];
}

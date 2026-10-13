import { api } from '../lib/api';
import type { ApiResponse } from '../types/api';
import type { MasterCustomer, Product } from '../types/master';

export const masterService = {
  // Backend mengirim semua dokter sekaligus (tanpa parameter pencarian),
  // jadi penyaringan nama dilakukan di frontend
  async getDoctors(): Promise<MasterCustomer[]> {
    const res = await api.get<ApiResponse<MasterCustomer[]>>('/doctors');
    return res.data.data;
  },

  // Semua produk, urut nama
  async getProducts(): Promise<Product[]> {
    const res = await api.get<ApiResponse<Product[]>>('/products');
    return res.data.data;
  },
};

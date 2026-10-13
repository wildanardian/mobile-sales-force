// src/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ValidationErrors {
  [field: string]: string[];
}

export interface ApiErrorBody {
  success?: boolean;
  message?: string;
  errors?: ValidationErrors;
}
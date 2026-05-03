export type Role = "admin" | "manager" | "worker";

export type Id = number | string;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  role: Role;
  created_at?: string;
}

export interface Product {
  id: number;
  name: string;
  code: string;
  image?: string | null;
  supplier?: string | null;
  total_quantity?: number | string | null;
  created_at?: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface Operation {
  id: number;
  product_id: number;
  name: string;
  image?: string | null;
  price: number | string;
  product_code?: string;
  created_at?: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface Assignment {
  id: number;
  worker_id: number;
  operation_id: number;
  created_by?: number | null;
  worker_name?: string;
  operation_name?: string;
  operation_image?: string | null;
  price?: number | string;
  product_code?: string;
  product_name?: string;
  created_at?: string;
  deleted_at?: string | null;
}

export interface Report {
  id: number;
  assignment_id: number;
  quantity: number;
  report_date?: string;
  status?: string;
  worker_name?: string;
  operation_name?: string;
  price?: number | string;
  product_code?: string;
  created_at?: string;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface MessageResponse {
  message: string;
}

export const toFormData = (data: object) => {
  const formData = new FormData();

  Object.entries(data as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    formData.append(key, value instanceof Blob ? value : String(value));
  });

  return formData;
};

export const isFormData = (data: unknown): data is FormData =>
  typeof FormData !== "undefined" && data instanceof FormData;

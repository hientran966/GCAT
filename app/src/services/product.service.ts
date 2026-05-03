import api from "./api";
import {
  Id,
  isFormData,
  MessageResponse,
  PaginatedResponse,
  PaginationParams,
  Product,
  toFormData,
} from "./types";

export interface ProductListParams extends PaginationParams {
  keyword?: string;
}

export interface ProductPayload {
  name: string;
  code: string;
  supplier?: string;
  total_quantity?: number | string;
  file?: File | Blob | null;
}

export const getProducts = async (
  params?: ProductListParams,
): Promise<PaginatedResponse<Product>> => {
  const res = await api.get("/products", { params });
  return res.data;
};

export const getProduct = async (id: Id): Promise<Product> => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

export const createProduct = async (
  data: ProductPayload | FormData,
): Promise<Product> => {
  const body = isFormData(data) ? data : toFormData(data);
  const res = await api.post("/products", body);
  return res.data;
};

export const updateProduct = async (
  id: Id,
  data: Partial<ProductPayload> | FormData,
): Promise<MessageResponse> => {
  const body = isFormData(data) ? data : toFormData(data);
  const res = await api.put(`/products/${id}`, body);
  return res.data;
};

export const deleteProduct = async (id: Id): Promise<MessageResponse> => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

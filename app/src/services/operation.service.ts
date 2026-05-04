import api from "./api";
import {
  Id,
  isFormData,
  MessageResponse,
  Operation,
  PaginatedResponse,
  PaginationParams,
  toFormData,
} from "./types";

export interface OperationListParams extends PaginationParams {
  product_id?: Id;
  keyword?: string;
}

export interface OperationPayload {
  name: string;
  price: number | string;
  product_id: Id;
  file?: File | Blob | null;
}

export const getOperations = async (
  params?: OperationListParams,
): Promise<PaginatedResponse<Operation>> => {
  const res = await api.get("/operations", { params });
  return res.data;
};

export const getOperation = async (id: Id): Promise<Operation> => {
  const res = await api.get(`/operations/${id}`);
  return res.data;
};

export const getOperationsByProduct = async (
  productId: Id,
): Promise<Operation[]> => {
  const res = await api.get(`/operations/product/${productId}`);
  return res.data;
};

export const getUserOperations = async (): Promise<Operation[]> => {
  const res = await api.get(`/operations/me`);
  return res.data;
}

export const createOperation = async (
  data: OperationPayload | FormData,
): Promise<Operation> => {
  const body = isFormData(data) ? data : toFormData(data);
  const res = await api.post("/operations", body);
  return res.data;
};

export const updateOperation = async (
  id: Id,
  data: Partial<OperationPayload> | FormData,
): Promise<MessageResponse> => {
  const body = isFormData(data) ? data : toFormData(data);
  const res = await api.put(`/operations/${id}`, body);
  return res.data;
};

export const deleteOperation = async (id: Id): Promise<MessageResponse> => {
  const res = await api.delete(`/operations/${id}`);
  return res.data;
};

import api from "./api";
import {
  Assignment,
  Id,
  MessageResponse,
  PaginatedResponse,
  PaginationParams,
} from "./types";

export interface AssignmentListParams extends PaginationParams {
  worker_id?: Id;
  product_id?: Id;
}

export interface AssignmentPayload {
  worker_id: Id;
  operation_id: Id;
}

export const getAssignments = async (
  params?: AssignmentListParams,
): Promise<PaginatedResponse<Assignment>> => {
  const res = await api.get("/assignments", { params });
  return res.data;
};

export const getAssignment = async (id: Id): Promise<Assignment> => {
  const res = await api.get(`/assignments/${id}`);
  return res.data;
};

export const getUserAssignments = async (): Promise<Assignment[]> => {
  const res = await api.get(`/assignments/me`);
  return res.data;
}

export const createAssignment = async (
  data: AssignmentPayload,
): Promise<Assignment> => {
  const res = await api.post("/assignments", data);
  return res.data;
};

export const deleteAssignment = async (id: Id): Promise<MessageResponse> => {
  const res = await api.delete(`/assignments/${id}`);
  return res.data;
};

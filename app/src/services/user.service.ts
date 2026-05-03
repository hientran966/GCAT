import api from "./api";
import {
  Id,
  MessageResponse,
  PaginatedResponse,
  PaginationParams,
  Role,
  User,
} from "./types";

export interface UserListParams extends PaginationParams {
  role?: Role;
  keyword?: string;
}

export interface CreateUserPayload {
  phone: string;
  name: string;
  password: string;
  role?: Role;
}

export interface UpdateUserPayload {
  name: string;
  role: Role;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export const getUsers = async (
  params?: UserListParams,
): Promise<PaginatedResponse<User>> => {
  const res = await api.get("/users", { params });
  return res.data;
};

export const getUser = async (id: Id): Promise<User> => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

export const createUser = async (data: CreateUserPayload): Promise<User> => {
  const res = await api.post("/users", data);
  return res.data;
};

export const updateUser = async (
  id: Id,
  data: UpdateUserPayload,
): Promise<MessageResponse> => {
  const res = await api.put(`/users/${id}`, data);
  return res.data;
};

export const changePassword = async (
  id: Id,
  data: ChangePasswordPayload,
): Promise<MessageResponse> => {
  const res = await api.put(`/users/${id}/change-password`, data);
  return res.data;
};

export const deleteUser = async (id: Id): Promise<MessageResponse> => {
  const res = await api.delete(`/users/${id}`);
  return res.data;
};

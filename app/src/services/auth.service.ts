import api from "./api";
import type { User } from "./types";

export interface LoginPayload {
  phone: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface VerifyResponse {
  id: number;
  phone: string;
  role: User["role"];
  iat?: number;
  exp?: number;
}

export const login = async (data: LoginPayload): Promise<LoginResponse> => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const verifyToken = async (): Promise<VerifyResponse> => {
  const res = await api.post("/auth/verify");
  return res.data;
};

import api from "./api";

export const login = async (data: { phone: string; password: string }) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};
import api from "./api";

export const getProducts = async (params?: any) => {
  const res = await api.get("/products", { params });
  return res.data;
};
import api from "./api";

export const createReport = async (data: any) => {
  return api.post("/reports", data);
};
import api from "./api";

export const getAssignments = async () => {
  const res = await api.get("/assignments");
  return res.data;
};
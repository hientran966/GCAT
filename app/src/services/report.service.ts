import api from "./api";
import {
  Id,
  MessageResponse,
  PaginatedResponse,
  PaginationParams,
  Report,
} from "./types";

export interface ReportListParams extends PaginationParams {
  worker_id?: Id;
  from_date?: string;
  to_date?: string;
}

export interface ReportPayload {
  assignment_id: Id;
  quantity: number;
  report_date?: string;
}

export interface SalarySummaryParams {
  worker_id: Id;
  from_date?: string;
  to_date?: string;
}

export interface SalarySummary {
  worker_id: Id;
  total_salary: number | string;
}

export const getReports = async (
  params?: ReportListParams,
): Promise<PaginatedResponse<Report>> => {
  const res = await api.get("/reports", { params });
  return res.data;
};

export const getReport = async (id: Id): Promise<Report> => {
  const res = await api.get(`/reports/${id}`);
  return res.data;
};

export const createReport = async (data: ReportPayload): Promise<Report> => {
  const res = await api.post("/reports", data);
  return res.data;
};

export const createReports = async (
  reports: ReportPayload[],
): Promise<{ data: Report[]; total: number }> => {
  const res = await api.post("/reports/bulk", { reports });
  return res.data;
};

export const updateReport = async (
  id: Id,
  data: Pick<ReportPayload, "quantity">,
): Promise<MessageResponse> => {
  const res = await api.put(`/reports/${id}`, data);
  return res.data;
};

export const deleteReport = async (id: Id): Promise<MessageResponse> => {
  const res = await api.delete(`/reports/${id}`);
  return res.data;
};

export const getSalarySummary = async (
  params: SalarySummaryParams,
): Promise<SalarySummary> => {
  const res = await api.get("/reports/salary/summary", { params });
  return res.data;
};

import apiClient from "./axios";
import { type Tag } from "@/api/tag";

export interface Log {
  logId: string;
  title: string;
  logDate: string;
  tags: Tag[];
}

export interface LogDetail {
  logId: string;
  userId: string;
  title: string;
  content: string;
  logDate: string;
  tags: Tag[];
}

export interface LogList {
  userId: string;
  list: Log[];
}

export const getLogList = async (): Promise<LogList> => {
  const response = await apiClient.get("/api/v1/logs/all");
  return response.data;
};

export const getLogDetail = async (logId: string): Promise<LogDetail> => {
  const response = await apiClient.get(`/api/v1/logs/${logId}`);
  return response.data;
};

export const createLog = async (title: string, content: string, logDate: string, tagIds: string[]): Promise<LogDetail> => {
  const response = await apiClient.post("/api/v1/logs/create", {
    title,
    content,
    logDate,
    tagIds
  });
  return response.data;
};

export const updateLog = async (logId: string, title: string, content: string, logDate: string, tagIds: string[]): Promise<LogDetail> => {
  const response = await apiClient.put(`/api/v1/logs/${logId}`, {
    title,
    content,
    logDate,
    tagIds
  });
  return response.data;
};

export const deleteLog = async (logId: string): Promise<void> => {
  await apiClient.delete(`/api/v1/logs/${logId}`);
}

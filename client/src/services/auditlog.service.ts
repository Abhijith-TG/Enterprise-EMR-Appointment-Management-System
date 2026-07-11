import { api } from "./api.js";
import { type AuditLog } from "../types/index.js";

export const auditlogService = {
  getLogs: async (): Promise<AuditLog[]> => {
    const response = await api.get("/auditlogs");
    return response.data.data;
  },
};

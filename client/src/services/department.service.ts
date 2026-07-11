import { api } from "./api.js";

export const departmentService = {
  getDepartments: async () => {
    const response = await api.get("/departments");
    return response.data.data;
  },
  createDepartment: async (data: { name: string; description?: string }) => {
    const response = await api.post("/departments", data);
    return response.data.data;
  },
};

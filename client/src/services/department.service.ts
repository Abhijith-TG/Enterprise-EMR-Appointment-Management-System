import { api } from "./api.js";

export const departmentService = {
  getDepartments: async () => {
    const response = await api.get("/departments");
    return response.data.data;
  },
};

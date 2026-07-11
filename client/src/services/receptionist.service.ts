import { api } from "./api.js";

export const receptionistService = {
  createReceptionist: async (data: any) => {
    const response = await api.post("/receptionists", data);
    return response.data.data;
  },

  getReceptionists: async (page?: number, limit?: number) => {
    const params = page && limit ? { page, limit } : {};
    const response = await api.get("/receptionists", { params });
    return { data: response.data.data, meta: response.data.meta };
  },

  getReceptionistById: async (id: string) => {
    const response = await api.get(`/receptionists/${id}`);
    return response.data.data;
  },

  updateReceptionist: async (id: string, data: any) => {
    const response = await api.put(`/receptionists/${id}`, data);
    return response.data.data;
  },

  deleteReceptionist: async (id: string) => {
    const response = await api.delete(`/receptionists/${id}`);
    return response.data.data;
  },
};

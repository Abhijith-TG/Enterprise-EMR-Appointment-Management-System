import { api } from "./api.js";

export const receptionistService = {
  createReceptionist: async (data: any) => {
    const response = await api.post("/receptionists", data);
    return response.data.data;
  },

  getReceptionists: async () => {
    const response = await api.get("/receptionists");
    return response.data.data;
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

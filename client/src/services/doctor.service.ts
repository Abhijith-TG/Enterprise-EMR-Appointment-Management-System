import { api } from "./api.js";

export const doctorService = {
  createDoctor: async (data: any) => {
    const response = await api.post("/doctors", data);
    return response.data.data;
  },

  getDoctors: async (page?: number, limit?: number) => {
    const params = page && limit ? { page, limit } : {};
    const response = await api.get("/doctors", { params });
    return { data: response.data.data, meta: response.data.meta };
  },

  getDoctorById: async (id: string) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data.data;
  },

  updateDoctor: async (id: string, data: any) => {
    const response = await api.put(`/doctors/${id}`, data);
    return response.data.data;
  },

  deleteDoctor: async (id: string) => {
    const response = await api.delete(`/doctors/${id}`);
    return response.data.data;
  },
};

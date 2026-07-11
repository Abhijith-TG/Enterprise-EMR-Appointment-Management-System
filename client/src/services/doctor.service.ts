import { api } from "./api.js";

export const doctorService = {
  createDoctor: async (data: any) => {
    const response = await api.post("/doctors", data);
    return response.data.data;
  },

  getDoctors: async () => {
    const response = await api.get("/doctors");
    return response.data.data;
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

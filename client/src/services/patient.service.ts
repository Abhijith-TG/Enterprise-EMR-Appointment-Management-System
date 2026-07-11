import { api } from "./api.js";

export const patientService = {
  createPatient: async (data: any) => {
    const response = await api.post("/patients", data);
    return response.data.data;
  },

  getPatients: async (page?: number, limit?: number) => {
    const params = page && limit ? { page, limit } : {};
    const response = await api.get("/patients", { params });
    return { data: response.data.data, meta: response.data.meta };
  },

  getPatientById: async (id: string) => {
    const response = await api.get(`/patients/${id}`);
    return response.data.data;
  },

  updatePatient: async (id: string, data: any) => {
    const response = await api.put(`/patients/${id}`, data);
    return response.data.data;
  },

  searchPatients: async (query: string) => {
    const response = await api.get("/patients/search", {
      params: { q: query },
    });
    return response.data.data;
  },
};

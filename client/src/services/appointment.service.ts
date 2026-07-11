import { api } from "./api.js";
import { AppointmentStatus } from "../types/index.js";

export const appointmentService = {
  listAppointments: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    doctorId?: string;
    patientId?: string;
    date?: string;
  }) => {
    const response = await api.get("/appointments", { params });
    return response.data; // contains data: appointments[], meta: {...}
  },

  getAvailableSlots: async (doctorId: string, date: string) => {
    const response = await api.get("/appointments/available-slots", {
      params: { doctorId, date },
    });
    return response.data.data;
  },

  createAppointment: async (data: {
    patientId: string;
    doctorId: string;
    appointmentDate: string;
    slotTime: string;
    purpose?: string;
    notes?: string;
  }) => {
    const response = await api.post("/appointments", data);
    return response.data.data;
  },

  updateStatus: async (id: string, status: AppointmentStatus) => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data.data;
  },

  updateAppointment: async (id: string, data: { purpose?: string; notes?: string }) => {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data.data;
  },
};

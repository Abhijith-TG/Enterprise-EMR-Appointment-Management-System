import { api } from "./api.js";

export const scheduleService = {
  createSchedule: async (data: {
    doctorId: string;
    workingDays: string[];
    sessions: { startTime: string; endTime: string }[];
    slotDuration: number;
  }) => {
    const response = await api.post("/schedules", data);
    return response.data.data;
  },

  getScheduleByDoctorId: async (doctorId: string) => {
    const response = await api.get(`/schedules/${doctorId}`);
    return response.data.data;
  },
};

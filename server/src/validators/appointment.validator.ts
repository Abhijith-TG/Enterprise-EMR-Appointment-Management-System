import { z } from "zod";

export const availableSlotSchema = z.object({
    doctorId: z.string(),
    date: z.string(),
});

export const createAppointmentSchema = z.object({
    patientId: z.string(),

    doctorId: z.string(),

    appointmentDate: z.string(),

    slotTime: z.string(),

    purpose: z.string().optional(),

    notes: z.string().optional()
});
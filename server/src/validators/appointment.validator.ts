import { z } from "zod";
import { AppointmentStatus } from "../constants/appointmentStatus.js";

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

export const listAppointmentsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    status: z.nativeEnum(AppointmentStatus).optional(),

    doctorId: z.string().optional(),

    patientId: z.string().optional(),

    date: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
    status: z.enum([
        AppointmentStatus.ARRIVED,
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
    ]),
});

export const updateAppointmentSchema = z.object({
    purpose: z.string().optional(),
    notes: z.string().optional(),
});
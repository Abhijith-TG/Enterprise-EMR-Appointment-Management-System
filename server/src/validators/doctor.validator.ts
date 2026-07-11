import { z } from "zod";

export const createDoctorSchema = z.object({
    firstName: z.string().min(2),

    lastName: z.string().optional(),

    email: z.email(),

    password: z.string().min(8),

    departmentId: z.string(),

    specialization: z.string().min(2),

    consultationFee: z.number().nonnegative()
});

export const updateDoctorSchema = createDoctorSchema.partial();
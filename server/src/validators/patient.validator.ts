import { z } from "zod";
import { Gender } from "../constants/gender.js";

export const createPatientSchema = z.object({
    firstName: z.string().min(2),

    lastName: z.string().optional(),

    gender: z.enum([
        Gender.MALE,
        Gender.FEMALE,
        Gender.OTHER
    ]),

    dob: z.string(),

    mobile: z.string().min(10).max(15),

    email: z.email().optional(),

    address: z.string().optional(),

    primaryContactName: z.string().optional(),

    primaryContactNumber: z.string().optional(),

    relationship: z.string().optional()
});

export const updatePatientSchema =
    createPatientSchema.partial();
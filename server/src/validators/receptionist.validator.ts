import { z } from "zod";

export const createReceptionistSchema = z.object({
    firstName: z.string().min(1, "First name is required"),

    lastName: z.string().optional(),

    email: z.string().email("Invalid email address"),

    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateReceptionistSchema = z.object({
    firstName: z.string().min(1).optional(),

    lastName: z.string().optional(),

    email: z.string().email("Invalid email address").optional(),
});

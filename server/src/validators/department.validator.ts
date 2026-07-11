import { z } from "zod";

export const createDepartmentSchema = z.object({
    name: z.string().min(1, "Department name is required").max(100, "Department name is too long"),
    description: z.string().max(500, "Description is too long").optional(),
});

import { z } from "zod";
import { WorkingDays } from "../constants/workingDays.js";

export const createScheduleSchema = z.object({
    doctorId: z.string(),

    workingDays: z.array(
        z.enum([
            WorkingDays.MONDAY,
            WorkingDays.TUESDAY,
            WorkingDays.WEDNESDAY,
            WorkingDays.THURSDAY,
            WorkingDays.FRIDAY,
            WorkingDays.SATURDAY,
            WorkingDays.SUNDAY,
        ])
    ),

    sessions: z.array(
        z.object({
            startTime: z.string(),
            endTime: z.string(),
        })
    ),

    slotDuration: z.number().min(5),
});
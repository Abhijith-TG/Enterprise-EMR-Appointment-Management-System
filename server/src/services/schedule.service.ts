import { Doctor } from "../models/doctor.model.js";
import { DoctorSchedule } from "../models/doctorSchedule.model.js";
import { ApiError } from "../utils/apiError.js";

export const scheduleService = {

    createSchedule: async (data: any) => {

        const doctor = await Doctor.findById(data.doctorId);

        if (!doctor) {
            throw new ApiError(404, "Doctor not found");
        }

        const existing = await DoctorSchedule.findOne({
            doctor: data.doctorId,
        });

        if (existing) {
            throw new ApiError(
                400,
                "Schedule already exists for this doctor"
            );
        }

        const schedule = await DoctorSchedule.create({
            doctor: data.doctorId,
            workingDays: data.workingDays,
            sessions: data.sessions,
            slotDuration: data.slotDuration,
        });

        return schedule;
    },

    getSchedule: async (doctorId: string) => {

        const schedule = await DoctorSchedule.findOne({
            doctor: doctorId,
        }).populate({
            path: "doctor",
            populate: {
                path: "user",
                select: "-password",
            },
        });

        if (!schedule) {
            throw new ApiError(404, "Schedule not found");
        }

        return schedule;
    },
};
import { Appointment } from "../models/appointment.model.js";
import { DoctorSchedule } from "../models/doctorSchedule.model.js";
import { AppointmentStatus } from "../constants/appointmentStatus.js";
import { ApiError } from "../utils/apiError.js";
import { generateSlots } from "../utils/generateSlots.js";
import { Patient } from "../models/patient.model.js";
import { Doctor } from "../models/doctor.model.js";
import { AuditLog } from "../models/auditlog.model.js";
import { UserRole } from "../constants/roles.js";

// Valid status transitions map
const VALID_TRANSITIONS: Record<string, string[]> = {
    [AppointmentStatus.SCHEDULED]: [
        AppointmentStatus.ARRIVED,
        AppointmentStatus.CANCELLED,
    ],
    [AppointmentStatus.ARRIVED]: [
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
    ],
    [AppointmentStatus.COMPLETED]: [],
    [AppointmentStatus.CANCELLED]: [],
};

export const appointmentService = {

    getAvailableSlots: async ({
        doctorId,
        date,
    }: {
        doctorId: string;
        date: string;
    }) => {

        const schedule = await DoctorSchedule.findOne({
            doctor: doctorId,
        });

        if (!schedule) {
            throw new ApiError(
                404,
                "Doctor schedule not found"
            );
        }

        const selectedDate = new Date(date);

        const dayName = selectedDate.toLocaleDateString(
            "en-US",
            {
                weekday: "long",
            }
        );

        if (!schedule.workingDays.includes(dayName as any)) {
            return [];
        }

        const allSlots: string[] = [];

        for (const session of schedule.sessions) {

            allSlots.push(
                ...generateSlots(
                    session.startTime,
                    session.endTime,
                    schedule.slotDuration
                )
            );

        }

        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const appointments = await Appointment.find({
            doctor: doctorId,
            appointmentDate: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
            status: {
                $ne: AppointmentStatus.CANCELLED,
            },
        });

        const bookedSlots = appointments.map(
            (appointment) => appointment.slotTime
        );

        const availableSlots = allSlots.filter(
            (slot) => !bookedSlots.includes(slot)
        );

        return availableSlots;
    },

    createAppointment: async (data: any, userId: string, userRole: UserRole) => {

        const patient = await Patient.findById(data.patientId);

        if (!patient) {
            throw new ApiError(404, "Patient not found");
        }

        const doctor = await Doctor.findById(data.doctorId);

        if (!doctor) {
            throw new ApiError(404, "Doctor not found");
        }

        const schedule = await DoctorSchedule.findOne({
            doctor: doctor._id
        });

        if (!schedule) {
            throw new ApiError(404, "Doctor schedule not found");
        }

        const selectedDate = new Date(data.appointmentDate);

        // Prevent past-date bookings at backend level
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            throw new ApiError(400, "Cannot book an appointment in the past");
        }

        const dayName = selectedDate.toLocaleDateString("en-US", {
            weekday: "long"
        });

        if (!schedule.workingDays.includes(dayName as any)) {
            throw new ApiError(
                400,
                "Doctor is not available on this day"
            );
        }

        let validSlots: string[] = [];

        for (const session of schedule.sessions) {

            validSlots.push(
                ...generateSlots(
                    session.startTime,
                    session.endTime,
                    schedule.slotDuration
                )
            );

        }

        if (!validSlots.includes(data.slotTime)) {
            throw new ApiError(
                400,
                "Invalid appointment slot"
            );
        }

        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingAppointment = await Appointment.findOne({
            doctor: doctor._id,
            appointmentDate: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            slotTime: data.slotTime,
            status: {
                $ne: AppointmentStatus.CANCELLED
            }
        });

        if (existingAppointment) {
            throw new ApiError(
                400,
                "Slot already booked"
            );
        }

        const appointment = await Appointment.create({

            patient: patient._id,

            doctor: doctor._id,

            department: doctor.department,

            appointmentDate: selectedDate,

            slotTime: data.slotTime,

            purpose: data.purpose,

            notes: data.notes,

            status: AppointmentStatus.SCHEDULED

        });

        await AuditLog.create({
            user: userId,
            role: userRole,
            action: "CREATE_APPOINTMENT",
            entity: "Appointment",
            entityId: appointment._id,
        });

        return await Appointment.findById(appointment._id)
            .populate({
                path: "patient"
            })
            .populate({
                path: "doctor",
                populate: {
                    path: "user",
                    select: "-password"
                }
            })
            .populate("department");

    },

    listAppointments: async (
        query: {
            page: number;
            limit: number;
            status?: string;
            doctorId?: string;
            patientId?: string;
            date?: string;
        },
        currentUser?: { id: string; role: string }
    ) => {

        const filter: Record<string, any> = {};

        if (query.status) {
            filter.status = query.status;
        }

        if (currentUser && currentUser.role === UserRole.DOCTOR) {
            const doctor = await Doctor.findOne({ user: currentUser.id });
            if (!doctor) {
                throw new ApiError(403, "Doctor profile not found");
            }
            filter.doctor = doctor._id;
        } else if (query.doctorId) {
            filter.doctor = query.doctorId;
        }

        if (query.patientId) {
            filter.patient = query.patientId;
        }

        if (query.date) {
            const selectedDate = new Date(query.date);
            const startOfDay = new Date(selectedDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(selectedDate);
            endOfDay.setHours(23, 59, 59, 999);

            filter.appointmentDate = {
                $gte: startOfDay,
                $lte: endOfDay,
            };
        }

        const skip = (query.page - 1) * query.limit;

        const [appointments, total] = await Promise.all([
            Appointment.find(filter)
                .populate({
                    path: "patient",
                })
                .populate({
                    path: "doctor",
                    populate: {
                        path: "user",
                        select: "-password",
                    },
                })
                .populate("department")
                .sort({ appointmentDate: -1, slotTime: -1 })
                .skip(skip)
                .limit(query.limit),
            Appointment.countDocuments(filter),
        ]);

        return {
            appointments,
            meta: {
                page: query.page,
                limit: query.limit,
                total,
                totalPages: Math.ceil(total / query.limit),
            },
        };

    },

    updateAppointmentStatus: async (
        id: string,
        status: AppointmentStatus,
        userId: string,
        userRole: UserRole
    ) => {

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            throw new ApiError(404, "Appointment not found");
        }

        const currentStatus = appointment.status;

        const allowedTransitions = VALID_TRANSITIONS[currentStatus];

        if (!allowedTransitions || !allowedTransitions.includes(status)) {
            throw new ApiError(
                400,
                `Cannot transition from "${currentStatus}" to "${status}"`
            );
        }

        appointment.status = status;

        await appointment.save();

        // Create audit log entry
        await AuditLog.create({
            user: userId,
            role: userRole,
            action: `STATUS_CHANGE:${currentStatus}->${status}`,
            entity: "Appointment",
            entityId: appointment._id,
        });

        return await Appointment.findById(id)
            .populate({
                path: "patient",
            })
            .populate({
                path: "doctor",
                populate: {
                    path: "user",
                    select: "-password",
                },
            })
            .populate("department");

    },

    updateAppointment: async (
        id: string,
        data: { purpose?: string; notes?: string },
        userId: string,
        userRole: UserRole
    ) => {

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            throw new ApiError(404, "Appointment not found");
        }

        if (data.purpose !== undefined) {
            appointment.purpose = data.purpose;
        }

        if (data.notes !== undefined) {
            appointment.notes = data.notes;
        }

        await appointment.save();

        // Create audit log entry
        await AuditLog.create({
            user: userId,
            role: userRole,
            action: "UPDATE_APPOINTMENT",
            entity: "Appointment",
            entityId: appointment._id,
        });

        return await Appointment.findById(id)
            .populate({
                path: "patient",
            })
            .populate({
                path: "doctor",
                populate: {
                    path: "user",
                    select: "-password",
                },
            })
            .populate("department");

    },

    deleteAppointment: async (
        id: string,
        userId: string,
        userRole: UserRole
    ) => {

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            throw new ApiError(404, "Appointment not found");
        }

        const cancellable = [AppointmentStatus.SCHEDULED, AppointmentStatus.ARRIVED];

        if (!cancellable.includes(appointment.status as AppointmentStatus)) {
            throw new ApiError(
                400,
                `Cannot cancel an appointment with status "${appointment.status}"`
            );
        }

        appointment.status = AppointmentStatus.CANCELLED;
        await appointment.save();

        await AuditLog.create({
            user: userId,
            role: userRole,
            action: "CANCEL_APPOINTMENT",
            entity: "Appointment",
            entityId: appointment._id,
        });

        return { message: "Appointment cancelled successfully" };

    },

    markArrived: async (
        id: string,
        userId: string,
        userRole: UserRole
    ) => {

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            throw new ApiError(404, "Appointment not found");
        }

        if (appointment.status !== AppointmentStatus.SCHEDULED) {
            throw new ApiError(
                400,
                `Cannot mark as arrived. Current status is "${appointment.status}"`
            );
        }

        appointment.status = AppointmentStatus.ARRIVED;
        await appointment.save();

        await AuditLog.create({
            user: userId,
            role: userRole,
            action: "MARK_ARRIVED",
            entity: "Appointment",
            entityId: appointment._id,
        });

        return await Appointment.findById(id)
            .populate({ path: "patient" })
            .populate({
                path: "doctor",
                populate: { path: "user", select: "-password" },
            })
            .populate("department");

    },

};
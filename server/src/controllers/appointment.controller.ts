import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { appointmentService } from "../services/appointment.service.js";
import {
    availableSlotSchema,
    createAppointmentSchema,
    listAppointmentsSchema,
    updateAppointmentStatusSchema,
    updateAppointmentSchema,
} from "../validators/appointment.validator.js";

export const getAvailableSlots = asyncHandler(async (req, res) => {

    const query = availableSlotSchema.parse(req.query);

    const slots = await appointmentService.getAvailableSlots(query);

    sendResponse(res, {
        statusCode: 200,
        message: "Available slots fetched successfully",
        data: slots,
    });

});


export const createAppointment = asyncHandler(async (req, res) => {

    const body = createAppointmentSchema.parse(req.body);

    const appointment = await appointmentService.createAppointment(
        body,
        req.user!.id,
        req.user!.role
    );

    sendResponse(res, {
        statusCode: 201,
        message: "Appointment booked successfully",
        data: appointment
    });

});


export const listAppointments = asyncHandler(async (req, res) => {

    const query = listAppointmentsSchema.parse(req.query);

    const result = await appointmentService.listAppointments(query, req.user);

    sendResponse(res, {
        statusCode: 200,
        message: "Appointments fetched successfully",
        data: result.appointments,
        meta: result.meta,
    });

});


export const updateAppointmentStatus = asyncHandler(async (req, res) => {

    const { status } = updateAppointmentStatusSchema.parse(req.body);

    const appointment = await appointmentService.updateAppointmentStatus(
        req.params.id as string,
        status,
        req.user!.id,
        req.user!.role
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Appointment status updated successfully",
        data: appointment,
    });

});


export const updateAppointment = asyncHandler(async (req, res) => {

    const body = updateAppointmentSchema.parse(req.body);

    const appointment = await appointmentService.updateAppointment(
        req.params.id as string,
        body,
        req.user!.id,
        req.user!.role
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Appointment updated successfully",
        data: appointment,
    });

});


export const deleteAppointment = asyncHandler(async (req, res) => {

    const result = await appointmentService.deleteAppointment(
        req.params.id as string,
        req.user!.id,
        req.user!.role
    );

    sendResponse(res, {
        statusCode: 200,
        message: result.message,
        data: null,
    });

});


export const markArrived = asyncHandler(async (req, res) => {

    const appointment = await appointmentService.markArrived(
        req.params.id as string,
        req.user!.id,
        req.user!.role
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Patient marked as arrived",
        data: appointment,
    });

});
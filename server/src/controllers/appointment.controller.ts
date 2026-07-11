import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { appointmentService } from "../services/appointment.service.js";
import { availableSlotSchema, createAppointmentSchema } from "../validators/appointment.validator.js";

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

    const appointment = await appointmentService.createAppointment(body);

    sendResponse(res, {
        statusCode: 201,
        message: "Appointment booked successfully",
        data: appointment
    });

});
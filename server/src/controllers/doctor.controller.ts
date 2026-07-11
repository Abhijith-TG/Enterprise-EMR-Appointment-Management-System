import { createDoctorSchema, updateDoctorSchema } from "../validators/doctor.validator.js";
import { doctorService } from "../services/doctor.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

export const createDoctor = asyncHandler(async (req, res) => {

    const body = createDoctorSchema.parse(req.body);

    const doctor = await doctorService.createDoctor(body);

    sendResponse(res, {
        statusCode: 201,
        message: "Doctor created successfully",
        data: doctor
    });

});


export const getDoctors = asyncHandler(async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await doctorService.getDoctors(page, limit);

    if (page && limit && typeof result === "object" && "doctors" in result) {
        sendResponse(res, {
            statusCode: 200,
            message: "Doctors fetched successfully",
            data: result.doctors,
            meta: result.meta
        });
    } else {
        sendResponse(res, {
            statusCode: 200,
            message: "Doctors fetched successfully",
            data: result
        });
    }

});

export const getDoctorById = asyncHandler(async (req, res) => {

    const doctor = await doctorService.getDoctorById(req.params.id as string);

    sendResponse(res, {
        statusCode: 200,
        message: "Doctor fetched successfully",
        data: doctor
    });

});


export const updateDoctor = asyncHandler(async (req, res) => {

    const body = updateDoctorSchema.parse(req.body);

    const doctor = await doctorService.updateDoctor(
        req.params.id as string,
        body
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Doctor updated successfully",
        data: doctor
    });

});

export const deleteDoctor = asyncHandler(async (req, res) => {

    await doctorService.deleteDoctor(req.params.id as string);

    sendResponse(res, {
        statusCode: 200,
        message: "Doctor deactivated successfully"
    });

});
import { patientService } from "../services/patient.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import {
    createPatientSchema,
    updatePatientSchema
} from "../validators/patient.validator.js";

export const createPatient = asyncHandler(async (req, res) => {

    const body = createPatientSchema.parse(req.body);

    const patient = await patientService.createPatient(body);

    sendResponse(res, {
        statusCode: 201,
        message: "Patient created successfully",
        data: patient
    });

});

export const getPatients = asyncHandler(async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await patientService.getPatients(page, limit);

    if (page && limit && typeof result === "object" && "patients" in result) {
        sendResponse(res, {
            statusCode: 200,
            message: "Patients fetched successfully",
            data: result.patients,
            meta: result.meta
        });
    } else {
        sendResponse(res, {
            statusCode: 200,
            message: "Patients fetched successfully",
            data: result
        });
    }
});

export const getPatientById = asyncHandler(async (req, res) => {

    const patient = await patientService.getPatientById(
        req.params.id as string
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Patient fetched successfully",
        data: patient
    });

});

export const updatePatient = asyncHandler(async (req, res) => {

    const body = updatePatientSchema.parse(req.body);

    const patient = await patientService.updatePatient(
        req.params.id as string ,
        body
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Patient updated successfully",
        data: patient
    });

});

export const searchPatients = asyncHandler(async (req, res) => {

    const patients = await patientService.searchPatients(
        String(req.query.q || "")
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Patients fetched successfully",
        data: patients
    });

});
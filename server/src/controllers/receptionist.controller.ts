import { receptionistService } from "../services/receptionist.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import {
    createReceptionistSchema,
    updateReceptionistSchema,
} from "../validators/receptionist.validator.js";

export const createReceptionist = asyncHandler(async (req, res) => {

    const body = createReceptionistSchema.parse(req.body);

    const receptionist = await receptionistService.createReceptionist(body);

    sendResponse(res, {
        statusCode: 201,
        message: "Receptionist created successfully",
        data: receptionist,
    });

});

export const getReceptionists = asyncHandler(async (req, res) => {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await receptionistService.getReceptionists(page, limit);

    if (page && limit && typeof result === "object" && "receptionists" in result) {
        sendResponse(res, {
            statusCode: 200,
            message: "Receptionists fetched successfully",
            data: result.receptionists,
            meta: result.meta,
        });
    } else {
        sendResponse(res, {
            statusCode: 200,
            message: "Receptionists fetched successfully",
            data: result,
        });
    }
});

export const getReceptionistById = asyncHandler(async (req, res) => {

    const receptionist = await receptionistService.getReceptionistById(
        req.params.id as string
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Receptionist fetched successfully",
        data: receptionist,
    });

});

export const updateReceptionist = asyncHandler(async (req, res) => {

    const body = updateReceptionistSchema.parse(req.body);

    const receptionist = await receptionistService.updateReceptionist(
        req.params.id as string,
        body
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Receptionist updated successfully",
        data: receptionist,
    });

});

export const deleteReceptionist = asyncHandler(async (req, res) => {

    await receptionistService.deleteReceptionist(req.params.id as string);

    sendResponse(res, {
        statusCode: 200,
        message: "Receptionist deactivated successfully",
    });

});

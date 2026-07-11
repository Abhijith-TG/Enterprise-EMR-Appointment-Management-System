import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { scheduleService } from "../services/schedule.service.js";
import { createScheduleSchema } from "../validators/schedule.validator.js";

export const createSchedule = asyncHandler(async (req, res) => {

    const body = createScheduleSchema.parse(req.body);

    const schedule = await scheduleService.createSchedule(body);

    sendResponse(res, {
        statusCode: 201,
        message: "Schedule created successfully",
        data: schedule,
    });

});

export const getSchedule = asyncHandler(async (req, res) => {

    const schedule = await scheduleService.getSchedule(
        req.params.doctorId as string
    );

    sendResponse(res, {
        statusCode: 200,
        message: "Schedule fetched successfully",
        data: schedule,
    });

});
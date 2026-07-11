import { departmentService } from "../services/departments.service.js";
import { sendResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDepartments = asyncHandler(async (req, res) => {

    const departments = await departmentService.getDepartments();

    sendResponse(res, {
        statusCode: 200,
        message: "Departments fetched successfully",
        data: departments
    });

});

export const createDepartment = asyncHandler(async (req, res) => {

    const department = await departmentService.createDepartment(req.body);

    sendResponse(res, {
        statusCode: 201,
        message: "Department created successfully",
        data: department
    });

});
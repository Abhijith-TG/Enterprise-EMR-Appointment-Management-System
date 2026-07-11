import { Department } from "../models/department.model.js";
import { ApiError } from "../utils/apiError.js";

export const departmentService = {
    getDepartments: async () => {
        return await Department.find().sort({ name: 1 });
    },

    createDepartment: async (data: { name: string; description?: string }) => {
        const trimmedName = data.name.trim();
        const existing = await Department.findOne({
            name: { $regex: new RegExp(`^${trimmedName}$`, "i") }
        });

        if (existing) {
            throw new ApiError(400, "Department with this name already exists");
        }

        return await Department.create({
            name: trimmedName,
            description: data.description?.trim(),
        });
    }
};
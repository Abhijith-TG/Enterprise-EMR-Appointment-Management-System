import { Department } from "../models/department.model.js";

export const departmentService = {
    getDepartments: async () => {
        return await Department.find().sort({ name: 1 });
    }
};
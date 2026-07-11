import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { UserRole } from "../constants/roles.js";
import { validate } from "../middlewares/validate.middleware.js";
import { getDepartments, createDepartment } from "../controllers/department.controller.js";
import { createDepartmentSchema } from "../validators/department.validator.js";

const router = Router();

router.get("/", authMiddleware, getDepartments);

router.post(
    "/",
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    validate(createDepartmentSchema),
    createDepartment
);

export default router;
import { Router } from "express";
import { createAppointment, getAvailableSlots } from "../controllers/appointment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { UserRole } from "../constants/roles.js";

const router = Router();

router.get(
    "/available-slots",
    authMiddleware,
    getAvailableSlots
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware(
        UserRole.SUPER_ADMIN,
        UserRole.RECEPTIONIST
    ),
    createAppointment
);

export default router;
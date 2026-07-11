import { Router } from "express";
import {
    createAppointment,
    getAvailableSlots,
    listAppointments,
    updateAppointmentStatus,
    updateAppointment,
    deleteAppointment,
    markArrived,
} from "../controllers/appointment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { UserRole } from "../constants/roles.js";

const router = Router();

router.get(
    "/available-slots",
    authMiddleware,
    getAvailableSlots
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware(
        UserRole.SUPER_ADMIN,
        UserRole.RECEPTIONIST,
        UserRole.DOCTOR
    ),
    listAppointments
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

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(
        UserRole.SUPER_ADMIN,
        UserRole.RECEPTIONIST,
        UserRole.DOCTOR
    ),
    updateAppointment
);

router.patch(
    "/:id/status",
    authMiddleware,
    roleMiddleware(
        UserRole.SUPER_ADMIN,
        UserRole.RECEPTIONIST,
        UserRole.DOCTOR
    ),
    updateAppointmentStatus
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(
        UserRole.SUPER_ADMIN,
        UserRole.RECEPTIONIST
    ),
    deleteAppointment
);

router.post(
    "/:id/arrive",
    authMiddleware,
    roleMiddleware(
        UserRole.SUPER_ADMIN,
        UserRole.RECEPTIONIST
    ),
    markArrived
);

export default router;
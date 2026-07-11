import { Router } from "express";
import { createDoctor, deleteDoctor, getDoctorById, getDoctors, updateDoctor } from "../controllers/doctor.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { UserRole } from "../constants/roles.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    createDoctor
);

router.get(
    "/",
    authMiddleware,
    getDoctors
);

router.get(
    "/:id",
    authMiddleware,
    getDoctorById
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    updateDoctor
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    deleteDoctor
);

export default router;
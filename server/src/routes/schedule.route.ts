import { Router } from "express";
import {
    createSchedule,
    getSchedule,
} from "../controllers/schedule.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { UserRole } from "../constants/roles.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    createSchedule
);

router.get(
    "/:doctorId",
    authMiddleware,
    getSchedule
);

export default router;
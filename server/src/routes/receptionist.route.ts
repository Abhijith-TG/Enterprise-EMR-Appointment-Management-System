import { Router } from "express";
import {
    createReceptionist,
    deleteReceptionist,
    getReceptionistById,
    getReceptionists,
    updateReceptionist,
} from "../controllers/receptionist.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { UserRole } from "../constants/roles.js";

const router = Router();

router.post(
    "/",
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    createReceptionist
);

router.get(
    "/",
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    getReceptionists
);

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    getReceptionistById
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    updateReceptionist
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    deleteReceptionist
);

export default router;

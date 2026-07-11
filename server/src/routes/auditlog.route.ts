import { Router } from "express";
import { listAuditLogs } from "../controllers/auditlog.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";
import { UserRole } from "../constants/roles.js";

const router = Router();

router.get(
    "/",
    authMiddleware,
    roleMiddleware(UserRole.SUPER_ADMIN),
    listAuditLogs
);

export default router;

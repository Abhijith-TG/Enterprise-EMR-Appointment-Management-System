import { Router } from "express";
import { login, refresh, logout } from "../controllers/auth.controller.js";
import { loginSchema } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validate.middleware.js";

const router = Router();

router.post(
    "/login",
    validate(loginSchema),
    login
);

router.post(
    "/refresh",
    refresh
);

router.post(
    "/logout",
    logout
);

export default router;
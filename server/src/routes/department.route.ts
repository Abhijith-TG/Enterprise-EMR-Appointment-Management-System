import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getDepartments } from "../controllers/department.controller.js";


const router = Router()



router.get("/", authMiddleware, getDepartments);


export default router;
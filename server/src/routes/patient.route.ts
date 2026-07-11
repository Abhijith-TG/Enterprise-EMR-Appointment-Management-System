import { Router } from "express";
import * as patientController from "../controllers/patient.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authMiddleware, patientController.createPatient);

router.get("/", authMiddleware, patientController.getPatients);

router.get("/search", authMiddleware, patientController.searchPatients);

router.get("/:id", authMiddleware, patientController.getPatientById);

router.put("/:id", authMiddleware, patientController.updatePatient);

export default router;
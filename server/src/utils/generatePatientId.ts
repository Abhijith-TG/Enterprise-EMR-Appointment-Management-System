import { Patient } from "../models/patient.model.js";

export const generatePatientId = async () => {

    const count = await Patient.countDocuments();

    return `PAT-${String(count + 1).padStart(6, "0")}`;

};
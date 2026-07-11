import mongoose from "mongoose";
import { IPatient } from "../interfaces/patient.interface.js";



const patientSchema = new mongoose.Schema<IPatient>(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    dob: {
      type: Date,
      required: true,
    },

    mobile: {
      type: String,
      required: true,
      index: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    address: String,

    primaryContactName: String,

    primaryContactNumber: String,

    relationship: String,
  },
  {
    timestamps: true,
  }
);

patientSchema.index({ mobile: 1 }, { name: "idx_patient_mobile" });
patientSchema.index({ patientId: 1 }, { unique: true, name: "idx_patient_patientId" });

export const Patient = mongoose.model<IPatient>(
  "Patient",
  patientSchema
);
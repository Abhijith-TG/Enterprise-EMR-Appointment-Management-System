import mongoose from "mongoose";
import { IDoctor } from "../interfaces/doctor.interface.js";



const doctorSchema = new mongoose.Schema<IDoctor>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    consultationFee: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Doctor = mongoose.model<IDoctor>(
  "Doctor",
  doctorSchema
);
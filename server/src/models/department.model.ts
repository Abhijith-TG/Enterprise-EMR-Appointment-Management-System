import mongoose from "mongoose";
import { IDepartment } from "../interfaces/department.interface.js";



const departmentSchema = new mongoose.Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Department = mongoose.model<IDepartment>(
  "Department",
  departmentSchema
);
import mongoose from "mongoose";
import { IDoctorSchedule } from "../interfaces/doctorSchedule.interface.js";
import { WorkingDays } from "../constants/workingDays.js";

const sessionSchema = new mongoose.Schema(
  {
    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const doctorScheduleSchema = new mongoose.Schema<IDoctorSchedule>(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      unique: true,
    },

    workingDays: [
      {
        type: String,
        enum: Object.values(WorkingDays),
      },
    ],

    sessions: [sessionSchema],

    slotDuration: {
      type: Number,
      required: true,
      min: 5,
    },
  },
  {
    timestamps: true,
  }
);

export const DoctorSchedule = mongoose.model<IDoctorSchedule>(
  "DoctorSchedule",
  doctorScheduleSchema
);
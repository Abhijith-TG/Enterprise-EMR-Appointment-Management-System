import mongoose from "mongoose";
import { AppointmentStatus } from "../constants/appointmentStatus.js";
import { IAppointment } from "../interfaces/appointment.interface.js";

const appointmentSchema = new mongoose.Schema<IAppointment>(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    appointmentDate: {
      type: Date,
      required: true,
    },

    slotTime: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.SCHEDULED,
    },
  },
  {
    timestamps: true,
  }
);

export const Appointment = mongoose.model('Appointment',appointmentSchema)
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

appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, slotTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $ne: "Cancelled" } },
    name: "unique_doctor_date_slot_active",
  }
);

appointmentSchema.index({ status: 1 }, { name: "idx_appointment_status" });
appointmentSchema.index({ patient: 1 }, { name: "idx_appointment_patient" });

export const Appointment = mongoose.model('Appointment',appointmentSchema)
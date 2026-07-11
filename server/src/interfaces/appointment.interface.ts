import mongoose from "mongoose";
import { AppointmentStatus } from "../constants/appointmentStatus.js";

export interface IAppointment {

    patient:mongoose.Types.ObjectId;

    doctor:mongoose.Types.ObjectId;

    department:mongoose.Types.ObjectId;

    appointmentDate:Date;

    slotTime:String;

    purpose:String;

    notes:String;

    status: AppointmentStatus;
}
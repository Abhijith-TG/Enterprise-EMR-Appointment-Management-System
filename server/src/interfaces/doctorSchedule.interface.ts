import mongoose from "mongoose";
import { WorkingDays } from "../constants/workingDays.js";

export interface ISession {
  startTime: string;

  endTime: string;
}

export interface IDoctorSchedule {
  doctor: mongoose.Types.ObjectId;

  workingDays: WorkingDays[];

  sessions: ISession[];

  slotDuration: number;
}
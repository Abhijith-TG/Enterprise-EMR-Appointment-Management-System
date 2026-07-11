import mongoose from "mongoose";

export interface IDoctor {
  user: mongoose.Types.ObjectId;

  department: mongoose.Types.ObjectId;

  specialization: string;

  consultationFee: number;
}
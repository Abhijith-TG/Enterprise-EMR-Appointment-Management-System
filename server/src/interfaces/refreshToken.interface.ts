import mongoose from "mongoose";

export interface IRefreshToken  {
    user:mongoose.Types.ObjectId;

    token:String

    expiresAt:Date
}
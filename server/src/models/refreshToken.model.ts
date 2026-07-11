import mongoose from "mongoose";
import { IRefreshToken } from "../interfaces/refreshToken.interface.js";

const refreshTokenSchema = new mongoose.Schema<IRefreshToken>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    token: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const RefreshToken = mongoose.model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);
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

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "ttl_refresh_token_expiry" });
refreshTokenSchema.index({ user: 1 }, { name: "idx_refresh_token_user" });

export const RefreshToken = mongoose.model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);
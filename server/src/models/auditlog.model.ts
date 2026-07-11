import mongoose from "mongoose";
import { IAuditLog } from "../interfaces/auditlog.interface.js";
import { UserRole } from "../constants/roles.js";

const auditLogSchema = new mongoose.Schema<IAuditLog>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
      enum: Object.values(UserRole),
    },

    action: {
      type: String,
      required: true,
    },

    entity: {
      type: String,
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AuditLog = mongoose.model<IAuditLog>(
  "AuditLog",
  auditLogSchema
);
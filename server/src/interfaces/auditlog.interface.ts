import mongoose from "mongoose";
import { UserRole } from "../constants/roles.js";

export interface IAuditLog {
    user:mongoose.Types.ObjectId,

    action:String,

    entity:String,

    role:UserRole,

    entityId:mongoose.Types.ObjectId,

    timestamp:Date
}
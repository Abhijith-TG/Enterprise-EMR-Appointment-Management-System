import mongoose from "mongoose";
import { IUser } from "../interfaces/user.interface.js";
import { UserRole } from "../constants/roles.js";


const userSchema = new mongoose.Schema<IUser>({
    firstName:{
        type: String,
        required: true,
        trim: true
    },

    lastName: {
        type: String,
        trim: true
    },

    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    role:{
        type: String,
        enum: Object.values(UserRole),        
        required: true
    },

    isActive: { 
        type: Boolean,
        default: true
    },

    password: {
        type: String,
        required: true
    }


},
{
    timestamps:true
})


export const User = mongoose.model<IUser>('User', userSchema)
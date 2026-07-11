import mongoose from "mongoose";
import { env } from "./env.js";


export const connectDB = async ()=>{
    try{
        await mongoose.connect(env.MONGO_URI)

        console.log("Database connected!");
    }catch(error:any){
        console.log(error.message || "Database connection failed!")

        process.exit(1);
    }
}


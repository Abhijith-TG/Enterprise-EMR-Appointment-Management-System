import { Request,Response,NextFunction } from "express";
import { ApiError } from "../utils/apiError.js";
import { ZodError } from "zod";

export const globalErrorHandler = (
    err:Error,
    _req:Request,
    res:Response,
    _next:NextFunction
)=>{

    if(err instanceof ApiError){

        return res.status(err.statusCode).json({

            success:false,

            message:err.message

        });

    }


    if (err instanceof ZodError) {


            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: err.issues[0].message,
            });
        }




    return res.status(500).json({

        success:false,

        message:"Internal Server Error"

    });

}
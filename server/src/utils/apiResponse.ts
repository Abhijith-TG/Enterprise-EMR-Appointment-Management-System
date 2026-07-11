import { Response } from "express";


interface ApiResponse<T>{
    statusCode:number;
    success?:boolean;
    message:string,
    data?:T;
    meta?:unknown;
}


export const sendResponse = <T>(res:Response, payload:ApiResponse<T>)=>{
    return res.status(payload.statusCode).json({
        success: payload.success ?? true,
        message: payload.message,
        data: payload.data ?? null,
        meta: payload.meta ?? null
    })
}




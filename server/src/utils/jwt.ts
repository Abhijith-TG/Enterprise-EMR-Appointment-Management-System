import jwt from "jsonwebtoken";
import { env } from "../config/env.js";



interface JwtPayload {
    id: string;
    role: string 
}


export const generateAccessToken = (payload: JwtPayload)=>{
    return jwt.sign(payload, env.JWT_ACCESS_SECRET,{
        expiresIn: "15m",
    })
}

export const generateRefreshToken = (payload: JwtPayload)=>{
    return jwt.sign(payload, env.JWT_REFRESH_SECRET,{
        expiresIn:'7d'
    })
}


export const verifyAccessToken = (token: string) =>{
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export const verifyRefreshToken = (token: string)=>{
    return jwt.verify(token, env.JWT_REFRESH_SECRET)
}

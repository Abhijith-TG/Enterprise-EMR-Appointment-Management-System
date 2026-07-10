import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

const app = express()

app.use(cors())
app.use(helmet())
app.use(cookieParser())


app.use((req:Request, _res:Response, next:NextFunction)=>{
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
})




export default app;
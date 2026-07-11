import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { globalErrorHandler } from './middlewares/globalErrorHandler.js';

const app = express()

app.use(cors())
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(morgan("dev"))

// routes 



app.use(globalErrorHandler)

export default app;
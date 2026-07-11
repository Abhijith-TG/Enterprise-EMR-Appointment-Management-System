import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

const app = express()

app.use(cors())
app.use(helmet())
app.use(cookieParser())
app.use(morgan("dev"))






export default app;
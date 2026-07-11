import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { globalErrorHandler } from './middlewares/globalErrorHandler.js';
import authRoute from './routes/auth.route.js';
import doctorRoutes from './routes/doctor.route.js';
import departmentRoute from './routes/department.route.js';
import scheduleRoutes from "./routes/schedule.route.js";
import appointmentRoutes from "./routes/appointment.route.js";
import receptionistRoutes from "./routes/receptionist.route.js";



const app = express()

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))
app.use(helmet())
app.use(cookieParser())
app.use(express.json())
app.use(morgan("dev"))

// routes 

app.use('/api/v1/auth', authRoute)
app.use("/api/v1/doctors", doctorRoutes);
app.use("/api/v1/departments", departmentRoute);
app.use("/api/v1/schedules", scheduleRoutes);
app.use("/api/v1/appointments", appointmentRoutes);
app.use("/api/v1/receptionists", receptionistRoutes);



app.use(globalErrorHandler)

export default app;
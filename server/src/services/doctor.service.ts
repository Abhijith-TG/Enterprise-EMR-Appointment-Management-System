import { Doctor } from "../models/doctor.model.js";
import { Department } from "../models/department.model.js";
import { User } from "../models/user.model.js";
import { UserRole } from "../constants/roles.js";
import { ApiError } from "../utils/apiError.js";
import { hashPassword } from "../utils/bcrypt.js";

export const doctorService = { 

    createDoctor: async (data: any) => {

        // Check if email already exists
        const existingUser = await User.findOne({
            email: data.email,
        });

        if (existingUser) {
            throw new ApiError(400, "Email already exists");
        }

        // Check department
        const department = await Department.findById(data.departmentId);

        if (!department) {
            throw new ApiError(404, "Department not found");
        }

        // Hash password
        const hashedPassword = await hashPassword(data.password);

        // Create User
        const user = await User.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
            role: UserRole.DOCTOR,
        });

        try {

            // Create Doctor
            const doctor = await Doctor.create({
                user: user._id,
                department: department._id,
                specialization: data.specialization,
                consultationFee: data.consultationFee,
            });

            return await Doctor.findById(doctor._id)
                .populate({
                    path: "user",
                    select: "-password -__v"
                })
                .populate("department");

        } catch (error) {

            // Rollback User if doctor creation fails
            await User.findByIdAndDelete(user._id);

            throw error;
        }



    },


    getDoctors: async () => {

        return await Doctor.find()
            .populate({
                path: "user",
                select: "-password -__v"
            })
            .populate("department")
            .sort({ createdAt: -1 });

    },


    getDoctorById: async (id: string) => {

        const doctor = await Doctor.findById(id)
            .populate({
                path: "user",
                select: "-password -__v"
            })
            .populate("department");

        if (!doctor) {
            throw new ApiError(404, "Doctor not found");
        }

        return doctor;

    },



    updateDoctor: async (id: string, data: any) => {

    const doctor = await Doctor.findById(id);

    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    if (data.departmentId) {

        const department = await Department.findById(data.departmentId);

        if (!department) {
            throw new ApiError(404, "Department not found");
        }

        doctor.department = department._id;
    }

    if (data.specialization) {
        doctor.specialization = data.specialization;
    }

    if (data.consultationFee !== undefined) {
        doctor.consultationFee = data.consultationFee;
    }

    await doctor.save();

    if (
        data.firstName ||
        data.lastName ||
        data.email
    ) {

        await User.findByIdAndUpdate(doctor.user, {

            ...(data.firstName && { firstName: data.firstName }),
            ...(data.lastName && { lastName: data.lastName }),
            ...(data.email && { email: data.email }),

        });

    }

    return await Doctor.findById(id)
        .populate({
            path: "user",
            select: "-password -__v"
        })
        .populate("department");

},

    deleteDoctor: async (id: string) => {

        const doctor = await Doctor.findById(id);

        if (!doctor) {
            throw new ApiError(404, "Doctor not found");
        }

        await User.findByIdAndUpdate(
            doctor.user,
            {
                isActive: false
            }
        );

    }
};
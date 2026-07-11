import { User } from "../models/user.model.js";
import { UserRole } from "../constants/roles.js";
import { ApiError } from "../utils/apiError.js";
import { hashPassword } from "../utils/bcrypt.js";

export const receptionistService = {

    createReceptionist: async (data: {
        firstName: string;
        lastName?: string;
        email: string;
        password: string;
    }) => {

        const existingUser = await User.findOne({
            email: data.email,
        });

        if (existingUser) {
            throw new ApiError(400, "Email already exists");
        }

        const hashedPassword = await hashPassword(data.password);

        const user = await User.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
            role: UserRole.RECEPTIONIST,
        });

        const { password, ...userWithoutPassword } = user.toObject();

        return userWithoutPassword;

    },

    getReceptionists: async (page?: number, limit?: number) => {
        if (page && limit) {
            const skip = (page - 1) * limit;
            const filter = { role: UserRole.RECEPTIONIST };
            const [receptionists, total] = await Promise.all([
                User.find(filter)
                    .select("-password")
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                User.countDocuments(filter)
            ]);

            return {
                receptionists,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };
        }

        return await User.find({
            role: UserRole.RECEPTIONIST,
        })
            .select("-password")
            .sort({ createdAt: -1 });

    },

    getReceptionistById: async (id: string) => {

        const user = await User.findOne({
            _id: id,
            role: UserRole.RECEPTIONIST,
        }).select("-password");

        if (!user) {
            throw new ApiError(404, "Receptionist not found");
        }

        return user;

    },

    updateReceptionist: async (
        id: string,
        data: {
            firstName?: string;
            lastName?: string;
            email?: string;
        }
    ) => {

        const user = await User.findOne({
            _id: id,
            role: UserRole.RECEPTIONIST,
        });

        if (!user) {
            throw new ApiError(404, "Receptionist not found");
        }

        // Check email uniqueness if email is being changed
        if (data.email && data.email !== user.email) {

            const existingUser = await User.findOne({
                email: data.email,
            });

            if (existingUser) {
                throw new ApiError(400, "Email already exists");
            }

        }

        const updated = await User.findByIdAndUpdate(
            id,
            data,
            { new: true }
        ).select("-password");

        return updated;

    },

    deleteReceptionist: async (id: string) => {

        const user = await User.findOne({
            _id: id,
            role: UserRole.RECEPTIONIST,
        });

        if (!user) {
            throw new ApiError(404, "Receptionist not found");
        }

        await User.findByIdAndUpdate(id, {
            isActive: false,
        });

    },

};

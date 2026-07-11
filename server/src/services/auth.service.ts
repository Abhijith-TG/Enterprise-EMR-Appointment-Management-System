import { IUser } from "../interfaces/user.interface.js";
import { RefreshToken } from "../models/refreshToken.model.js";
import { User } from "../models/user.model.js";
import { authRepository } from "../repositories/auth.repository.js"
import { ApiError } from "../utils/apiError.js";
import { comparePassword } from "../utils/bcrypt.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";




export const authService = {

    login: async (email: string, password: string)=>{
        const user = await authRepository.findUserByEmail(email);

        if(!user){
            throw new ApiError(
                401,
                "Invalid email or password!"
            )
        }

        if(!user.isActive){
            throw new ApiError(
                403,
                "User account is inactive!"
            )
        }

        const passwordMatched = await comparePassword(password, user.password);

        if(!passwordMatched){
            throw new ApiError(
                401,
                "Invalid email or password!"
            )
        }


        const accessToken = generateAccessToken({
            id: user._id.toString(),
            role: user.role,
        });

        const refreshToken = generateRefreshToken({
            id: user._id.toString(),
            role: user.role,
        });


        await RefreshToken.create({
            user: user._id,
            token: refreshToken,
            expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000
            ),
        });


        return {
             user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            accessToken,
            refreshToken,
        };


    },

    refresh: async (token: string) => {
        try {
            const payload = verifyRefreshToken(token);
            const tokenDoc = await RefreshToken.findOne({ token, user: payload.id });

            if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
                throw new ApiError(401, "Invalid or expired refresh token");
            }

            const user = await User.findById(payload.id);
            if (!user || !user.isActive) {
                throw new ApiError(403, "User account is disabled");
            }

            const accessToken = generateAccessToken({
                id: user._id.toString(),
                role: user.role,
            });

            return { accessToken };
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(401, "Invalid refresh token");
        }
    },

    logout: async (token: string) => {
        await RefreshToken.deleteOne({ token });
    }

}
import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const authMiddleware = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {

        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            throw new ApiError(401, "Access token required");
        }

        const token = authHeader.split(" ")[1];

        const payload = verifyAccessToken(token);

        const user = await User.findById(payload.id);

        if (!user) {
            throw new ApiError(401, "User not found");
        }

        if (!user.isActive) {
            throw new ApiError(403, "Account is disabled");
        }

        req.user = {
            id: user._id.toString(),
            role: user.role,
        };

        next();
    }
);
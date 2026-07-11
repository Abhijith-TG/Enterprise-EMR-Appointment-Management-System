import { NextFunction, Request, Response } from "express";
import { UserRole } from "../constants/roles.js";
import { ApiError } from "../utils/apiError.js";

export const roleMiddleware =
    (...roles: UserRole[]) =>
    (req: Request, res: Response, next: NextFunction) => {

        if (!req.user) {
            throw new ApiError(401, "Unauthorized");
        }

        if (!roles.includes(req.user.role)) {
            throw new ApiError(
                403,
                "You do not have permission to perform this action"
            );
        }

        next();
    };
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { authService } from "../services/auth.service.js";
import { loginSchema } from "../validators/auth.validator.js";
import { ApiError } from "../utils/apiError.js";

export const login = asyncHandler(async (req, res) => {

    const data = loginSchema.parse(req.body);

    const result = await authService.login(data.email, data.password);

    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false,      
        sameSite: "strict",
    });

    sendResponse(res, {
        statusCode: 200,
        message: "Login successful",
        data: {
            accessToken: result.accessToken,
            user: result.user,
        },
    });

});

export const refresh = asyncHandler(async (req, res) => {

    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
        throw new ApiError(401, "Refresh token required");
    }

    const result = await authService.refresh(refreshToken);

    sendResponse(res, {
        statusCode: 200,
        message: "Token refreshed successfully",
        data: result,
    });

});

export const logout = asyncHandler(async (req, res) => {

    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (refreshToken) {
        await authService.logout(refreshToken);
    }

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
    });

    sendResponse(res, {
        statusCode: 200,
        message: "Logout successful",
    });

});
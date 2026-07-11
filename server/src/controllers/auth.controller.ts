import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { authService } from "../services/auth.service.js";
import { loginSchema } from "../validators/auth.validator.js";

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
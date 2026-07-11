import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";
import { AuditLog } from "../models/auditlog.model.js";

export const listAuditLogs = asyncHandler(async (req, res) => {
    const logs = await AuditLog.find()
        .populate("user", "firstName lastName email")
        .sort({ createdAt: -1 })
        .limit(100);

    sendResponse(res, {
        statusCode: 200,
        message: "Audit logs fetched successfully",
        data: logs,
    });
});

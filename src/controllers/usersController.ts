import { Response } from "express";
import { randomUUID } from "crypto";
import { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { formatUserResponse } from "../utils/response.utils";
import { sendErrorResponse, ApiError } from "../utils/error.utils";
import { logError, logInfo } from "../utils/logger.utils";
import { toIdString } from "../utils/objectId.utils";

/**
 * Get user profile information
 */
export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const user = await User.findById(req.userId).select("-password").lean();
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return res.json(formatUserResponse(user));
  } catch (error: unknown) {
    logError("Get profile error", error);
    sendErrorResponse(res, error, "Failed to get profile");
  }
}

/**
 * Regenerate sharableId for the user
 */
export async function regenerateSharableId(req: AuthRequest, res: Response) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const oldSharableId = user.sharableId;
    user.sharableId = randomUUID();
    await user.save();

    logInfo(`SharableId regenerated for user ${toIdString(user._id)}: ${oldSharableId} -> ${user.sharableId}`);

    return res.json({
      sharableId: user.sharableId,
      message: "Sharable ID regenerated successfully",
    });
  } catch (error: unknown) {
    logError("Regenerate sharableId error", error);
    sendErrorResponse(res, error, "Failed to regenerate sharableId");
  }
}

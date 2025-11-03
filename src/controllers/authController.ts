import { Request, Response } from "express";
import { Types } from "mongoose";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { signupSchema, loginSchema } from "../utils/validation";
import { AuthRequest } from "../middleware/auth";
import { env } from "../config/env";
import { generateInitialSlots } from "../services/slotService";
import { toIdString } from "../utils/objectId.utils";
import { formatUserResponse } from "../utils/response.utils";
import { sendErrorResponse, ApiError } from "../utils/error.utils";
import { logError, logInfo } from "../utils/logger.utils";

const JWT_SECRET = env.JWT_SECRET;

/**
 * Signup - Create new user and generate initial slots
 */
export async function signup(req: Request, res: Response) {
  try {
    const validatedData = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      throw new ApiError(400, "User already exists");
    }

    // Create user
    const user = new User(validatedData);
    await user.save();

    logInfo(`New user signed up: ${toIdString(user._id)} - ${user.email}`);

    // Generate initial slots (from today to end of next month)
    try {
      await generateInitialSlots(user._id as Types.ObjectId);
      logInfo(`Initial slots generated for user: ${toIdString(user._id)}`);
    } catch (error) {
      logError("Failed to generate initial slots", error);
      // Continue even if slot generation fails
    }

    // Generate JWT token
    const token = jwt.sign({ userId: toIdString(user._id) }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json(formatUserResponse(user));
  } catch (error: unknown) {
    logError("Signup error", error);
    sendErrorResponse(res, error, "Failed to create user");
  }
}

/**
 * Login - Authenticate user
 */
export async function login(req: Request, res: Response) {
  try {
    const validatedData = loginSchema.parse(req.body);

    // Find user
    const user = await User.findOne({ email: validatedData.email });
    if (!user) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Check password
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    // Generate JWT token
    const token = jwt.sign({ userId: toIdString(user._id) }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const isProd = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    logInfo(`User logged in: ${toIdString(user._id)} - ${user.email}`);

    res.json(formatUserResponse(user));
  } catch (error: unknown) {
    logError("Login error", error);
    sendErrorResponse(res, error, "Failed to login");
  }
}

/**
 * Logout - Clear authentication cookie
 */
export async function logout(req: Request, res: Response) {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
  res.json({ message: "Logged out successfully" });
}

/**
 * Get current user
 */
export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    res.json(formatUserResponse(user));
  } catch (error: unknown) {
    logError("Get current user error", error);
    sendErrorResponse(res, error, "Failed to get user");
  }
}

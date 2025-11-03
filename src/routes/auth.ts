import express from "express";
import { authMiddleware } from "../middleware/auth";
import * as authController from "../controllers/authController";

const router = express.Router();

// Signup
router.post("/signup", authController.signup);

// Login
router.post("/login", authController.login);

// Logout
router.post("/logout", authController.logout);

// Get current user
router.get("/me", authMiddleware, authController.getCurrentUser);

export default router;

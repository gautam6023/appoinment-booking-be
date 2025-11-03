import express from "express";
import { authMiddleware } from "../middleware/auth";
import * as usersController from "../controllers/usersController";

const router = express.Router();

// Get user profile
router.get("/me", authMiddleware, usersController.getProfile);

// Regenerate sharableId
router.post("/me/regenerate-sharable-id", authMiddleware, usersController.regenerateSharableId);

export default router;

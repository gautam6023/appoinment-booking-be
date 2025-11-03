import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Load environment variables first
dotenv.config();

// Validate environment variables (this will exit if validation fails)
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import authRoutes from "./routes/auth";
import appointmentRoutes from "./routes/appointments";
import userRoutes from "./routes/users";
import { initializeCronJobs } from "./jobs/slotCron";
import { logInfo, logError } from "./utils/logger.utils";

const app = express();
const PORT = env.PORT ? parseInt(env.PORT, 10) : 3001;

// CORS Configuration
app.use(
  cors({
    origin: env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logError("Unhandled error", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logInfo("Database connected successfully");

    // Initialize cron jobs
    initializeCronJobs();

    // Start listening
    app.listen(PORT, () => {
      logInfo(`Server is running on port ${PORT}`);
      logInfo(`CORS enabled for: ${env.FRONTEND_URL || "http://localhost:5173"}`);
    });
  } catch (error) {
    logError("Failed to start server", error);
    process.exit(1);
  }
}

startServer();

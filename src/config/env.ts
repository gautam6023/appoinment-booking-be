import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  PORT: z.string().optional(),
  FRONTEND_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]).optional(),
  SERVER_TIMEZONE: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");
      console.error("❌ Environment variable validation failed:");
      console.error(missingVars);
      console.error("\nPlease check your .env file and ensure all required variables are set.");
      process.exit(1);
    }
    throw error;
  }
}

export const env = validateEnv();

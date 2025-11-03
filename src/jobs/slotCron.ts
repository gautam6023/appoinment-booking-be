import cron from "node-cron";
import { generateMonthlySlots, deletePastUnbookedSlots } from "../services/slotService";
import { logInfo, logError } from "../utils/logger.utils";
import { MONTHLY_SLOT_GENERATION_SCHEDULE, DAILY_CLEANUP_SCHEDULE } from "../constants/slots.constants";

/**
 * Initialize all cron jobs
 */
export function initializeCronJobs() {
  // Run on the 15th of every month at 00:00 (midnight) to generate slots
  // This uses a sliding window approach to ensure users always have ~1.5 months of slots available
  cron.schedule(MONTHLY_SLOT_GENERATION_SCHEDULE, async () => {
    logInfo("Running monthly slot generation cron job...");
    try {
      await generateMonthlySlots();
      logInfo("Monthly slot generation completed successfully");
    } catch (error) {
      logError("Error in monthly slot generation cron job:", error);
    }
  });

  // Run every day at 02:00 AM to delete past unbooked slots
  cron.schedule(DAILY_CLEANUP_SCHEDULE, async () => {
    logInfo("Running daily slot cleanup cron job...");
    try {
      const deletedCount = await deletePastUnbookedSlots();
      logInfo(`Daily slot cleanup completed. Deleted ${deletedCount} past unbooked slots`);
    } catch (error) {
      logError("Error in daily slot cleanup cron job:", error);
    }
  });

  logInfo("Cron jobs initialized:");
  logInfo(`- Monthly slot generation: ${MONTHLY_SLOT_GENERATION_SCHEDULE} (15th of every month at 00:00)`);
  logInfo(`- Daily slot cleanup: ${DAILY_CLEANUP_SCHEDULE} (every day at 02:00)`);
}

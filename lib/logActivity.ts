import { connectDB } from "@/lib/db";
import ActivityLog from "@/models/ActivityLog";
import { Types } from "mongoose";

interface LogActivityOptions {
  projectId: string | Types.ObjectId;
  action: string;
  description: string;
}

/**
 * Fire-and-forget activity logger. Does not throw — logs errors to console.
 */
export async function logActivity(opts: LogActivityOptions): Promise<void> {
  try {
    await connectDB();
    await ActivityLog.create({
      projectId: opts.projectId,
      action: opts.action,
      description: opts.description,
    });
  } catch (err) {
    console.error("[logActivity] Failed to log:", err);
  }
}

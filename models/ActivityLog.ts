import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IActivityLog extends Document {
  projectId: Types.ObjectId;
  action: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    action: { type: String, required: true, trim: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

// Autodelete notification logs older than 30 days (1 month)
ActivityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog ??
  mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);

export default ActivityLog;

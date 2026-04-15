import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ProjectStatus = "active" | "completed" | "on-hold";

export interface IProject extends Document {
  name: string;
  clientName?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: ProjectStatus;
  tags: string[];
  totalValue: number;
  paidAmount: number;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true },
    clientName: { type: String, trim: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "completed", "on-hold"],
      default: "active",
    },
    tags: [{ type: String, trim: true }],
    totalValue: { type: Number, default: 0, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

const Project: Model<IProject> =
  mongoose.models.Project ?? mongoose.model<IProject>("Project", ProjectSchema);

export default Project;

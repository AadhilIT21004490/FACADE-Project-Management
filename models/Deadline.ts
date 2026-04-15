import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type DeadlineType = "milestone" | "payment" | "general";

export interface IDeadline extends Document {
  projectId: Types.ObjectId;
  title: string;
  date: Date;
  type: DeadlineType;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeadlineSchema = new Schema<IDeadline>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["milestone", "payment", "general"],
      default: "general",
    },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Deadline: Model<IDeadline> =
  mongoose.models.Deadline ?? mongoose.model<IDeadline>("Deadline", DeadlineSchema);

export default Deadline;

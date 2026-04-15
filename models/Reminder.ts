import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ReminderType = "payment" | "deadline";

export interface IReminder extends Document {
  projectId: Types.ObjectId;
  title: string;
  date: Date;
  type: ReminderType;
  isSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["payment", "deadline"],
      required: true,
    },
    isSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Reminder: Model<IReminder> =
  mongoose.models.Reminder ?? mongoose.model<IReminder>("Reminder", ReminderSchema);

export default Reminder;

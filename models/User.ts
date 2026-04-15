import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  image?: string;
  preferences: {
    paymentReminders: boolean;
    deadlineReminders: boolean;
    emailNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    image: { type: String },
    preferences: {
      paymentReminders: { type: Boolean, default: true },
      deadlineReminders: { type: Boolean, default: true },
      emailNotifications: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;

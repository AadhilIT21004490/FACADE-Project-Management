import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPayment extends Document {
  projectId: Types.ObjectId;
  amount: number;
  date: Date;
  method: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true },
    method: { type: String, required: true, trim: true },
    notes: { type: String },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment ?? mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICredential extends Document {
  projectId: Types.ObjectId;
  serviceName: string;
  url?: string;
  username?: string;
  password?: string;  // stored AES-256-GCM encrypted
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CredentialSchema = new Schema<ICredential>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    serviceName: { type: String, required: true, trim: true },
    url: { type: String, trim: true },
    username: { type: String, trim: true },
    password: { type: String }, // encrypted via lib/encrypt.ts before saving
    notes: { type: String },
  },
  { timestamps: true }
);

const Credential: Model<ICredential> =
  mongoose.models.Credential ?? mongoose.model<ICredential>("Credential", CredentialSchema);

export default Credential;

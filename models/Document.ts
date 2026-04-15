import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type DocumentCategory = "contract" | "design" | "report" | "other";

export interface IDocument extends Document {
  projectId: Types.ObjectId;
  name: string;
  fileUrl: string;
  publicId: string;
  category: DocumentCategory;
  size?: number;
  fileType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    name: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    category: {
      type: String,
      enum: ["contract", "design", "report", "other"],
      default: "other",
    },
    size: { type: Number },
    fileType: { type: String },
  },
  { timestamps: true }
);

const ProjectDocument: Model<IDocument> =
  mongoose.models.Document ?? mongoose.model<IDocument>("Document", DocumentSchema);

export default ProjectDocument;

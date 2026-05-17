import mongoose, { type Document, Schema } from "mongoose";

// ===========================================
// Project Interface
// ===========================================

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  key: string; // Short prefix like "TF" for TF-001, TF-002
  workspaceId: mongoose.Types.ObjectId;
  settings: {
    defaultAssignee?: mongoose.Types.ObjectId;
    taskPrefix: string;
    taskCounter: number;
  };
  createdBy: mongoose.Types.ObjectId;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================================
// Project Schema
// ===========================================

const projectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: { type: String, maxlength: 2000 },
    key: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 6,
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    settings: {
      defaultAssignee: { type: Schema.Types.ObjectId, ref: "User" },
      taskPrefix: { type: String, required: true },
      taskCounter: { type: Number, default: 0 },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Indexes
projectSchema.index({ workspaceId: 1 });
projectSchema.index({ workspaceId: 1, key: 1 }, { unique: true });

export const Project = mongoose.model<IProject>("Project", projectSchema);

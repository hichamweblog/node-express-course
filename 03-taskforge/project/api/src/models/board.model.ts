import mongoose, { type Document, Schema } from "mongoose";

// ===========================================
// Board Interface
// ===========================================

export interface IBoardColumn {
  _id: mongoose.Types.ObjectId;
  name: string;
  order: number;
  color?: string;
  wipLimit?: number; // Work-In-Progress limit
}

export interface IBoard extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  projectId: mongoose.Types.ObjectId;
  columns: IBoardColumn[];
  settings: {
    showWipLimits: boolean;
    defaultColumn?: mongoose.Types.ObjectId;
  };
  createdBy: mongoose.Types.ObjectId;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================================
// Board Schema
// ===========================================

const boardSchema = new Schema<IBoard>(
  {
    name: {
      type: String,
      required: [true, "Board name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    columns: [
      {
        name: { type: String, required: true, trim: true },
        order: { type: Number, required: true },
        color: { type: String, default: "#6B7280" },
        wipLimit: { type: Number, min: 0 },
      },
    ],
    settings: {
      showWipLimits: { type: Boolean, default: false },
      defaultColumn: { type: Schema.Types.ObjectId },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Indexes
boardSchema.index({ projectId: 1 });

export const Board = mongoose.model<IBoard>("Board", boardSchema);

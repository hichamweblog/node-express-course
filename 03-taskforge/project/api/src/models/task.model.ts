import mongoose, { type Document, Schema } from "mongoose";

// ===========================================
// Task Types
// ===========================================

export type TaskPriority = "urgent" | "high" | "medium" | "low" | "none";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export interface IChecklistItem {
  _id: mongoose.Types.ObjectId;
  text: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: mongoose.Types.ObjectId;
}

export interface ISubtask {
  _id: mongoose.Types.ObjectId;
  title: string;
  isCompleted: boolean;
  assignee?: mongoose.Types.ObjectId;
}

export interface IAttachment {
  _id: mongoose.Types.ObjectId;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: mongoose.Types.ObjectId;
  uploadedAt: Date;
}

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  taskNumber: string; // "TF-001"
  boardId: mongoose.Types.ObjectId;
  columnId: mongoose.Types.ObjectId;
  position: number; // Order within column
  assignees: mongoose.Types.ObjectId[];
  watchers: mongoose.Types.ObjectId[];
  labels: string[];
  priority: TaskPriority;
  dueDate?: Date;
  estimatedHours?: number;
  checklist: IChecklistItem[];
  subtasks: ISubtask[];
  attachments: IAttachment[];
  parentTaskId?: mongoose.Types.ObjectId; // For subtask hierarchy
  isArchived: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================================
// Task Schema
// ===========================================

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: 1,
      maxlength: 300,
    },
    description: { type: String, maxlength: 10000 },
    taskNumber: { type: String, required: true, unique: true },
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
    columnId: { type: Schema.Types.ObjectId, required: true },
    position: { type: Number, required: true, default: 0 },
    assignees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    watchers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    labels: [{ type: String, trim: true }],
    priority: {
      type: String,
      enum: ["urgent", "high", "medium", "low", "none"],
      default: "none",
    },
    dueDate: { type: Date },
    estimatedHours: { type: Number, min: 0 },
    checklist: [
      {
        text: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        completedAt: { type: Date },
        completedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    subtasks: [
      {
        title: { type: String, required: true },
        isCompleted: { type: Boolean, default: false },
        assignee: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    attachments: [
      {
        filename: { type: String, required: true },
        url: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        uploadedBy: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    parentTaskId: { type: Schema.Types.ObjectId, ref: "Task" },
    isArchived: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

// Indexes
taskSchema.index({ boardId: 1, columnId: 1, position: 1 });
taskSchema.index({ assignees: 1 });
taskSchema.index({ labels: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ taskNumber: 1 }, { unique: true });
taskSchema.index(
  { title: "text", description: "text" },
  { weights: { title: 10, description: 5 } },
);

export const Task = mongoose.model<ITask>("Task", taskSchema);

import mongoose, { type Document, Schema } from "mongoose";

// ===========================================
// Comment Interface
// ===========================================

export interface IComment extends Document {
  _id: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string;
  mentions: mongoose.Types.ObjectId[];
  reactions: Array<{
    emoji: string;
    userId: mongoose.Types.ObjectId;
  }>;
  editHistory: Array<{
    content: string;
    editedAt: Date;
  }>;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      maxlength: 5000,
    },
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    reactions: [
      {
        emoji: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      },
    ],
    editHistory: [
      {
        content: { type: String, required: true },
        editedAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

commentSchema.index({ taskId: 1, createdAt: -1 });

export const Comment = mongoose.model<IComment>("Comment", commentSchema);

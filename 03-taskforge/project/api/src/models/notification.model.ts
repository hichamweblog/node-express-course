import mongoose, { type Document, Schema } from "mongoose";

// ===========================================
// Notification Interface
// ===========================================

export type NotificationType =
  | "task_assigned"
  | "task_mentioned"
  | "task_due_soon"
  | "comment_added"
  | "comment_mentioned"
  | "workspace_invite"
  | "board_updated";

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_mentioned",
        "task_due_soon",
        "comment_added",
        "comment_mentioned",
        "workspace_invite",
        "board_updated",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema,
);

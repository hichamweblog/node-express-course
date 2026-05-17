import mongoose, { type Document, Schema } from "mongoose";

// ===========================================
// Activity Interface
// ===========================================

export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "moved"
  | "assigned"
  | "unassigned"
  | "commented"
  | "attached"
  | "archived"
  | "restored";

export type EntityType =
  | "workspace"
  | "project"
  | "board"
  | "task"
  | "comment";

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  action: ActivityAction;
  entityType: EntityType;
  entityId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  workspaceId: mongoose.Types.ObjectId;
  changes?: Record<string, { from: unknown; to: unknown }>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    action: {
      type: String,
      enum: [
        "created",
        "updated",
        "deleted",
        "moved",
        "assigned",
        "unassigned",
        "commented",
        "attached",
        "archived",
        "restored",
      ],
      required: true,
    },
    entityType: {
      type: String,
      enum: ["workspace", "project", "board", "task", "comment"],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    changes: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Time-based queries need this
activitySchema.index({ workspaceId: 1, createdAt: -1 });
activitySchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>("Activity", activitySchema);

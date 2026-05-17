import mongoose, { type Document, Schema } from "mongoose";

// ===========================================
// Workspace Types
// ===========================================

export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export interface IWorkspaceMember {
  userId: mongoose.Types.ObjectId;
  role: WorkspaceRole;
  joinedAt: Date;
}

export interface IWorkspace extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  members: IWorkspaceMember[];
  settings: {
    defaultProjectView: "board" | "list";
    allowGuestAccess: boolean;
  };
  createdBy: mongoose.Types.ObjectId;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================================
// Workspace Schema
// ===========================================

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, maxlength: 500 },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: {
          type: String,
          enum: ["owner", "admin", "member", "viewer"],
          default: "member",
        },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    settings: {
      defaultProjectView: {
        type: String,
        enum: ["board", "list"],
        default: "board",
      },
      allowGuestAccess: { type: Boolean, default: false },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Indexes
workspaceSchema.index({ slug: 1 }, { unique: true });
workspaceSchema.index({ "members.userId": 1 });
workspaceSchema.index({ createdBy: 1 });

export const Workspace = mongoose.model<IWorkspace>(
  "Workspace",
  workspaceSchema,
);

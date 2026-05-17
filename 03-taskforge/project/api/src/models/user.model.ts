import mongoose, { type Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

// ===========================================
// User Interface
// ===========================================

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  avatar?: string;
  preferences: {
    theme: "light" | "dark";
    emailNotifications: boolean;
    mentionNotifications: boolean;
  };
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toPublicJSON(): Omit<IUser, "passwordHash">;
}

// ===========================================
// User Schema
// ===========================================

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Never include in queries by default
    },
    avatar: { type: String },
    preferences: {
      theme: { type: String, enum: ["light", "dark"], default: "light" },
      emailNotifications: { type: Boolean, default: true },
      mentionNotifications: { type: Boolean, default: true },
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// ===========================================
// Indexes
// ===========================================

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ name: "text" });

// ===========================================
// Pre-save: Hash Password
// ===========================================

userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

// ===========================================
// Instance Methods
// ===========================================

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.__v;
  return obj;
};

// ===========================================
// Export
// ===========================================

export const User = mongoose.model<IUser>("User", userSchema);

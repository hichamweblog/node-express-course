# Lesson 2: Mongoose Schemas & Models

## 🎯 Learning Objectives

By the end of this lesson, you'll:

- Understand what Mongoose is and why to use an ODM
- Connect to MongoDB (local and Atlas)
- Define schemas with types, validation, defaults, and required fields
- Configure schema options (timestamps, virtuals, indexes)
- Create models from schemas
- Integrate TypeScript with Mongoose for type safety

---

## 🪝 Hook: Structure in the Chaos

MongoDB's flexibility is powerful—documents can have any shape. But that freedom becomes a liability when:

- One developer stores `email`, another stores `emailAddress`
- Numbers are sometimes strings, sometimes integers
- Required fields are missing because "oops"

**Mongoose brings structure to MongoDB's flexibility.** It's like TypeScript for your database—you define the shape, and Mongoose enforces it.

> **📌 Module Note:** These are standalone examples for learning Mongoose. DevJobs Pro (Module 09) uses PostgreSQL + Drizzle.

---

## 📚 Core Concepts

### What is Mongoose?

Mongoose is an **ODM (Object Document Mapper)** for MongoDB—similar to how Drizzle/Prisma are ORMs for SQL databases.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Without Mongoose                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Your Code  ──────►  MongoDB Driver  ──────►  MongoDB              │
│                                                                     │
│   • Manual validation                                               │
│   • No schema enforcement                                           │
│   • Raw BSON operations                                             │
│   • Repetitive boilerplate                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         With Mongoose                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Your Code  ──────►  Mongoose  ──────►  MongoDB Driver  ──────►  DB│
│                         │                                           │
│                         ├── Schema validation                       │
│                         ├── Type casting                            │
│                         ├── Middleware hooks                        │
│                         ├── Query building                          │
│                         └── TypeScript types                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Schema → Model → Document Lifecycle

```
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│     SCHEMA     │      │     MODEL      │      │    DOCUMENT    │
│                │      │                │      │                │
│  Blueprint     │─────►│  Constructor   │─────►│   Instance     │
│  - Fields      │      │  - CRUD ops    │      │   - Data       │
│  - Types       │      │  - Queries     │      │   - Methods    │
│  - Validation  │      │  - Middleware  │      │   - Save/Delete│
│  - Indexes     │      │                │      │                │
└────────────────┘      └────────────────┘      └────────────────┘
       │                        │                       │
       │                        │                       │
       ▼                        ▼                       ▼
  new Schema({...})       mongoose.model()         Model.create()
                          Model.find()             doc.save()
```

---

## 🔌 Connecting to MongoDB

### Installation

```bash
npm install mongoose
npm install -D @types/mongoose   # TypeScript types (if needed)
```

### Connection Setup

```typescript
// src/config/database.ts
import mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/myapp";

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

// Handle connection events
mongoose.connection.on("disconnected", () => {
  console.log("⚠️ MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed due to app termination");
  process.exit(0);
});
```

### Connection String Formats

```typescript
// Local MongoDB
"mongodb://localhost:27017/myapp";

// MongoDB Atlas (cloud)
"mongodb+srv://username:password@cluster.xxxxx.mongodb.net/myapp?retryWrites=true&w=majority";

// With authentication (local)
"mongodb://username:password@localhost:27017/myapp?authSource=admin";

// Replica set
"mongodb://host1:27017,host2:27017,host3:27017/myapp?replicaSet=myReplicaSet";
```

### Using in Express App

```typescript
// src/app.ts
import express from "express";
import { connectDatabase } from "./config/database.js";

const app = express();

// Connect to MongoDB before starting server
connectDatabase().then(() => {
  app.listen(3000, () => {
    console.log("Server running on port 3000");
  });
});
```

---

## 📋 Schema Definitions

### Basic Schema Structure

```typescript
// src/models/User.ts
import mongoose, { Schema, Document } from "mongoose";

// Define the schema
const userSchema = new Schema({
  name: String, // Shorthand
  email: String,
  age: Number,
  isActive: Boolean,
  createdAt: Date,
});

// Create and export model
export const User = mongoose.model("User", userSchema);
```

### Schema Types

Mongoose supports these types:

| Type         | Example                          | Notes                             |
| ------------ | -------------------------------- | --------------------------------- |
| `String`     | `name: String`                   | Any UTF-8 string                  |
| `Number`     | `age: Number`                    | Integers and floats               |
| `Boolean`    | `isActive: Boolean`              | true/false                        |
| `Date`       | `createdAt: Date`                | JavaScript Date objects           |
| `Buffer`     | `avatar: Buffer`                 | Binary data                       |
| `ObjectId`   | `userId: Schema.Types.ObjectId`  | MongoDB ObjectId                  |
| `Array`      | `tags: [String]`                 | Arrays of any type                |
| `Mixed`      | `metadata: Schema.Types.Mixed`   | Any structure (avoid if possible) |
| `Map`        | `socialLinks: Map`               | Key-value pairs                   |
| `Decimal128` | `price: Schema.Types.Decimal128` | High-precision decimals           |

### Full Schema Options

```typescript
// src/models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";

// TypeScript interface for the document
export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin" | "employer";
  age?: number;
  profile?: {
    bio: string;
    website: string;
    location: string;
  };
  skills: string[];
  isVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for document methods
export interface IUserDocument extends IUser, Document {
  fullName: string; // Virtual
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Interface for model statics
export interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
}

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    // Required string with validation
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true, // Remove whitespace
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    // Email with unique constraint and validation
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Unique index
      lowercase: true, // Convert to lowercase
      trim: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please provide a valid email",
      ],
    },

    // Password (will be hashed)
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't include in queries by default
    },

    // Enum with default
    role: {
      type: String,
      enum: {
        values: ["user", "admin", "employer"],
        message: "{VALUE} is not a valid role",
      },
      default: "user",
    },

    // Optional number with range
    age: {
      type: Number,
      min: [18, "Must be at least 18"],
      max: [120, "Age seems unrealistic"],
    },

    // Nested object (embedded document)
    profile: {
      bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
      },
      website: {
        type: String,
        match: [/^https?:\/\/.+/, "Invalid URL format"],
      },
      location: String,
    },

    // Array of strings
    skills: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length <= 20,
        message: "Cannot have more than 20 skills",
      },
    },

    // Boolean with default
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Optional date
    lastLoginAt: Date,
  },
  {
    // Schema options
    timestamps: true, // Add createdAt, updatedAt
    toJSON: { virtuals: true }, // Include virtuals in JSON
    toObject: { virtuals: true },
  },
);

// Create and export model
export const User = mongoose.model<IUserDocument, IUserModel>(
  "User",
  userSchema,
);
```

---

## ⚙️ Schema Options & Features

### Timestamps

```typescript
const schema = new Schema(
  { name: String },
  { timestamps: true }, // Adds createdAt and updatedAt automatically
);

// Custom field names
const schema = new Schema(
  { name: String },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);
```

### Virtuals (Computed Properties)

```typescript
const userSchema = new Schema({
  firstName: String,
  lastName: String,
});

// Virtual property - not stored in DB
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual("fullName").set(function (name: string) {
  const [first, ...rest] = name.split(" ");
  this.firstName = first;
  this.lastName = rest.join(" ");
});

// Usage
const user = new User({ firstName: "John", lastName: "Doe" });
console.log(user.fullName); // "John Doe"

user.fullName = "Jane Smith";
console.log(user.firstName); // "Jane"
```

### Indexes

```typescript
const userSchema = new Schema({
  email: {
    type: String,
    unique: true, // Creates unique index
    index: true, // Creates regular index
  },
  name: String,
  role: String,
  createdAt: Date,
});

// Compound index
userSchema.index({ role: 1, createdAt: -1 });

// Text index for search
userSchema.index({ name: "text", email: "text" });

// TTL index (documents expire after time)
const sessionSchema = new Schema({
  token: String,
  expiresAt: { type: Date, index: { expires: 0 } }, // Auto-delete when expiresAt passes
});
```

### Instance Methods

```typescript
import bcrypt from "bcrypt";

userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
  };
};

// Usage
const user = await User.findById(id).select("+password");
const isMatch = await user.comparePassword("mypassword");
```

### Static Methods

```typescript
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ isVerified: true, isActive: true });
};

// Usage
const user = await User.findByEmail("john@example.com");
const activeUsers = await User.findActiveUsers();
```

### Middleware (Hooks)

```typescript
import bcrypt from "bcrypt";

// Pre-save hook - hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash if password was modified
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Post-save hook - log after saving
userSchema.post("save", function (doc) {
  console.log(`User ${doc.email} was saved`);
});

// Pre-find hook - exclude soft-deleted
userSchema.pre(/^find/, function (next) {
  // 'this' refers to the query
  this.where({ isDeleted: { $ne: true } });
  next();
});

// Pre-delete hook
userSchema.pre("findOneAndDelete", async function (next) {
  const user = await this.model.findOne(this.getFilter());
  // Clean up related data
  await mongoose.model("Application").deleteMany({ userId: user._id });
  next();
});
```

---

## 🔷 TypeScript Integration

### Full TypeScript Pattern

```typescript
// src/models/Job.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

// 1. Define the interface for the document data
export interface IJob {
  title: string;
  description: string;
  company: Types.ObjectId;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  location: {
    city: string;
    country: string;
    remote: boolean;
  };
  skills: string[];
  type: "full-time" | "part-time" | "contract" | "internship";
  status: "draft" | "active" | "closed";
  applicantCount: number;
  postedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Define interface for instance methods
export interface IJobMethods {
  incrementApplicants(): Promise<IJobDocument>;
  isExpired(): boolean;
}

// 3. Define the document type (data + methods + Document)
export interface IJobDocument extends IJob, IJobMethods, Document {}

// 4. Define interface for static methods
export interface IJobModel extends Model<IJobDocument, {}, IJobMethods> {
  findActiveJobs(): Promise<IJobDocument[]>;
  findByCompany(companyId: Types.ObjectId): Promise<IJobDocument[]>;
}

// 5. Create the schema
const jobSchema = new Schema<IJobDocument, IJobModel, IJobMethods>(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company is required"],
    },
    salary: {
      min: { type: Number, required: true, min: 0 },
      max: { type: Number, required: true },
      currency: { type: String, default: "USD", enum: ["USD", "EUR", "GBP"] },
    },
    location: {
      city: { type: String, required: true },
      country: { type: String, required: true },
      remote: { type: Boolean, default: false },
    },
    skills: {
      type: [String],
      validate: {
        validator: (v: string[]) => v.length >= 1 && v.length <= 15,
        message: "Jobs must have 1-15 skills",
      },
    },
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      default: "full-time",
    },
    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft",
    },
    applicantCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// 6. Add indexes
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ company: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ title: "text", description: "text" });

// 7. Add instance methods
jobSchema.methods.incrementApplicants =
  async function (): Promise<IJobDocument> {
    this.applicantCount += 1;
    return this.save();
  };

jobSchema.methods.isExpired = function (): boolean {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.createdAt < thirtyDaysAgo;
};

// 8. Add static methods
jobSchema.statics.findActiveJobs = function (): Promise<IJobDocument[]> {
  return this.find({ status: "active" }).sort({ createdAt: -1 });
};

jobSchema.statics.findByCompany = function (
  companyId: Types.ObjectId,
): Promise<IJobDocument[]> {
  return this.find({ company: companyId });
};

// 9. Add virtuals
jobSchema.virtual("salaryRange").get(function () {
  return `${this.salary.currency} ${this.salary.min.toLocaleString()} - ${this.salary.max.toLocaleString()}`;
});

// 10. Export the model
export const Job = mongoose.model<IJobDocument, IJobModel>("Job", jobSchema);
```

### Using the Typed Model

```typescript
import { Job, IJob, IJobDocument } from "./models/Job.js";
import { Types } from "mongoose";

// Create a new job - TypeScript checks the shape
const jobData: Partial<IJob> = {
  title: "Senior Node.js Developer",
  description: "Join our team...",
  company: new Types.ObjectId("507f1f77bcf86cd799439011"),
  salary: { min: 80000, max: 120000, currency: "USD" },
  location: { city: "New York", country: "USA", remote: true },
  skills: ["Node.js", "TypeScript", "MongoDB"],
  type: "full-time",
  postedBy: new Types.ObjectId("507f1f77bcf86cd799439012"),
};

const job = await Job.create(jobData);

// TypeScript knows job is IJobDocument
console.log(job.title); // ✅ string
console.log(job.salaryRange); // ✅ virtual
await job.incrementApplicants(); // ✅ instance method

// Static methods are typed too
const activeJobs = await Job.findActiveJobs(); // ✅ IJobDocument[]
```

---

## 🎮 Mini-Tutorial: Create a Complete Schema

Let's create a `Company` schema with full validation:

```typescript
// src/models/Company.ts
import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ICompany {
  name: string;
  slug: string;
  description: string;
  logo?: string;
  website?: string;
  size: "startup" | "small" | "medium" | "large" | "enterprise";
  industry: string;
  locations: {
    city: string;
    country: string;
    isHeadquarters: boolean;
  }[];
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  ownerId: Types.ObjectId;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICompanyDocument extends ICompany, Document {
  jobCount: number; // Virtual
}

export interface ICompanyModel extends Model<ICompanyDocument> {
  findBySlug(slug: string): Promise<ICompanyDocument | null>;
}

const companySchema = new Schema<ICompanyDocument, ICompanyModel>(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      unique: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    logo: {
      type: String,
      match: [/^https?:\/\/.+\.(jpg|jpeg|png|webp|svg)$/i, "Invalid logo URL"],
    },
    website: {
      type: String,
      match: [/^https?:\/\/.+/, "Invalid website URL"],
    },
    size: {
      type: String,
      enum: {
        values: ["startup", "small", "medium", "large", "enterprise"],
        message: "{VALUE} is not a valid company size",
      },
      required: true,
    },
    industry: {
      type: String,
      required: [true, "Industry is required"],
      trim: true,
    },
    locations: [
      {
        city: { type: String, required: true },
        country: { type: String, required: true },
        isHeadquarters: { type: Boolean, default: false },
      },
    ],
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// Auto-generate slug from name
companySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

// Virtual for job count (populated separately)
companySchema.virtual("jobs", {
  ref: "Job",
  localField: "_id",
  foreignField: "company",
});

// Static method
companySchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug });
};

// Indexes
companySchema.index({ slug: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ name: "text", description: "text" });

export const Company = mongoose.model<ICompanyDocument, ICompanyModel>(
  "Company",
  companySchema,
);
```

---

## 🎯 Practice Exercise

Design a `User` schema for a job board with these requirements:

1. **Required fields:** name, email, password, role
2. **Role** can be: 'jobseeker', 'employer', 'admin'
3. **Profile** (optional nested object): bio, avatar, resume URL
4. **Skills** array (for job seekers)
5. Password should be hashed before saving
6. Email should be unique and lowercase
7. Add timestamps
8. Add a method to compare passwords
9. Add a static to find users by role

<details>
<summary>💡 Solution</summary>

```typescript
import mongoose, { Schema, Document, Model, Types } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "jobseeker" | "employer" | "admin";
  profile?: {
    bio?: string;
    avatar?: string;
    resumeUrl?: string;
  };
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserDocument extends IUser, IUserMethods, Document {}

export interface IUserModel extends Model<IUserDocument, {}, IUserMethods> {
  findByRole(role: string): Promise<IUserDocument[]>;
}

const userSchema = new Schema<IUserDocument, IUserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["jobseeker", "employer", "admin"],
      default: "jobseeker",
    },
    profile: {
      bio: { type: String, maxlength: 500 },
      avatar: String,
      resumeUrl: String,
    },
    skills: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance method
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method
userSchema.statics.findByRole = function (role: string) {
  return this.find({ role });
};

export const User = mongoose.model<IUserDocument, IUserModel>(
  "User",
  userSchema,
);
```

</details>

---

## 🐛 5-Minute Debugger

### "MongooseError: Model is not defined"

```typescript
// ❌ Wrong - model not registered yet
import { User } from "./models/User.js";
const user = await User.findById(id); // Error!

// ✅ Fix - ensure connection is established first
await connectDatabase(); // This initializes models
const user = await User.findById(id);
```

### "MongoServerError: E11000 duplicate key error"

```typescript
// ❌ Trying to insert duplicate unique value
await User.create({ email: "john@example.com" });
await User.create({ email: "john@example.com" }); // Error!

// ✅ Handle the error
try {
  await User.create({ email: "john@example.com" });
} catch (error: any) {
  if (error.code === 11000) {
    throw new Error("Email already exists");
  }
  throw error;
}
```

### "MongooseError: Operation timed out"

```typescript
// ❌ Connection string issues
await mongoose.connect("mongodb://wronghost:27017/db");

// ✅ Check connection string and network
// Also add timeout options:
await mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
});
```

---

## 💡 Pro Tips

### 1. Always Define Indexes

```typescript
// Queries without indexes scan entire collection
// Add indexes for fields you query frequently
userSchema.index({ email: 1 }); // Login
userSchema.index({ role: 1, createdAt: -1 }); // Admin dashboard
```

### 2. Use Schema Validation Over Application Validation

```typescript
// ❌ Validating in application code
if (!email || !email.includes('@')) {
  throw new Error('Invalid email');
}

// ✅ Let schema handle it
email: {
  type: String,
  required: true,
  match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
}
```

### 3. Select Only What You Need

```typescript
// ❌ Fetching entire document
const user = await User.findById(id);

// ✅ Project only needed fields
const user = await User.findById(id).select("name email role");
```

### 4. Use `lean()` for Read-Only Operations

```typescript
// ❌ Full Mongoose documents (slower, more memory)
const users = await User.find({ role: "user" });

// ✅ Plain JavaScript objects (faster, less memory)
const users = await User.find({ role: "user" }).lean();
```

---

## ✅ Definition of Done

You've completed this lesson when you can:

- [ ] Explain what Mongoose is and why to use an ODM
- [ ] Connect to MongoDB (local and Atlas)
- [ ] Create schemas with validation, defaults, and required fields
- [ ] Use schema options (timestamps, virtuals, indexes)
- [ ] Create models from schemas
- [ ] Add instance methods and static methods
- [ ] Integrate TypeScript with Mongoose models
- [ ] Debug common Mongoose connection and model errors

---

## ➡️ Next Lesson

Now that you can define schemas and models, let's use them to **Create, Read, Update, and Delete** data.

**[→ Lesson 3: CRUD Operations with Mongoose](./03-crud-operations-mongoose.md)**

---

<blockquote>
💡 <strong>Remember:</strong> Mongoose brings structure to MongoDB. In Module 09, you'll see how Drizzle does the same for PostgreSQL—same patterns, different paradigm!
</blockquote>

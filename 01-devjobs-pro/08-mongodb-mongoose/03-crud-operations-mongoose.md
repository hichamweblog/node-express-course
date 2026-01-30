# Lesson 3: CRUD Operations with Mongoose

## 🎯 Learning Objectives

By the end of this lesson, you'll:

- Create documents using `Model.create()` and `new Model().save()`
- Read documents with `find()`, `findById()`, `findOne()`
- Update documents using various patterns (`findByIdAndUpdate`, `updateOne`)
- Delete documents with `findByIdAndDelete()`, `deleteMany()`
- Apply query options: lean, select, sort, limit, skip
- Implement pagination patterns
- Handle ObjectId properly

---

## 🪝 Hook: The Core of Every Application

Every database-driven application does four things:

- **C**reate new data
- **R**ead existing data
- **U**pdate data when it changes
- **D**elete data that's no longer needed

Master these operations, and you can build almost anything.

> **📌 Module Note:** These CRUD examples are standalone patterns. DevJobs Pro (Module 09) uses PostgreSQL with Drizzle, but the concepts transfer directly.

---

## 📚 CRUD Operation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CRUD Operations                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   CREATE                                                            │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐  │
│   │  Input   │────►│ Validate │────►│  Save    │────►│ Document │  │
│   │  Data    │     │  Schema  │     │  to DB   │     │ Returned │  │
│   └──────────┘     └──────────┘     └──────────┘     └──────────┘  │
│                                                                     │
│   READ                                                              │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐  │
│   │  Query   │────►│  Filter  │────►│  Fetch   │────►│ Documents│  │
│   │  Params  │     │  Build   │     │  from DB │     │ Returned │  │
│   └──────────┘     └──────────┘     └──────────┘     └──────────┘  │
│                                                                     │
│   UPDATE                                                            │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐  │
│   │  Find    │────►│  Apply   │────►│  Save    │────►│ Updated  │  │
│   │  Condition│    │  Changes │     │  to DB   │     │ Document │  │
│   └──────────┘     └──────────┘     └──────────┘     └──────────┘  │
│                                                                     │
│   DELETE                                                            │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐                   │
│   │  Find    │────►│  Remove  │────►│ Confirm  │                   │
│   │  Condition│    │  from DB │     │ Deletion │                   │
│   └──────────┘     └──────────┘     └──────────┘                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📝 CREATE Operations

### Method 1: Model.create()

The simplest way to create documents:

```typescript
import { Job, IJob } from "./models/Job.js";

// Create single document
const job = await Job.create({
  title: "Senior Node.js Developer",
  description: "Join our growing team...",
  company: new Types.ObjectId("507f1f77bcf86cd799439011"),
  salary: { min: 80000, max: 120000, currency: "USD" },
  location: { city: "San Francisco", country: "USA", remote: true },
  skills: ["Node.js", "TypeScript", "MongoDB"],
  type: "full-time",
  status: "active",
  postedBy: new Types.ObjectId("507f1f77bcf86cd799439012"),
});

console.log(job._id); // ObjectId("...")
console.log(job.createdAt); // Date (from timestamps)
```

### Method 2: new Model() + save()

More control over the process:

```typescript
// Create instance (not saved yet)
const job = new Job({
  title: "Frontend Developer",
  description: "React expert needed...",
  // ... other fields
});

// Modify before saving
job.skills.push("GraphQL");

// Validate manually (optional)
await job.validate();

// Save to database
await job.save();

console.log(job._id); // Now has an ID
```

### Creating Multiple Documents

```typescript
// Create many at once
const jobs = await Job.create([
  {
    title: "Backend Developer",
    description: "Node.js position...",
    // ... other fields
  },
  {
    title: "DevOps Engineer",
    description: "Cloud infrastructure...",
    // ... other fields
  },
  {
    title: "Full Stack Developer",
    description: "End-to-end development...",
    // ... other fields
  },
]);

console.log(jobs.length); // 3

// Alternative: insertMany (faster, fewer validations)
const result = await Job.insertMany(
  [
    {
      /* job 1 */
    },
    {
      /* job 2 */
    },
  ],
  { ordered: false },
); // Continue on error
```

### Handling Creation Errors

```typescript
import { Types } from "mongoose";

async function createJob(data: Partial<IJob>) {
  try {
    const job = await Job.create(data);
    return { success: true, data: job };
  } catch (error: any) {
    // Duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return {
        success: false,
        error: `${field} already exists`,
      };
    }

    // Validation error
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      return {
        success: false,
        error: messages.join(", "),
      };
    }

    throw error;
  }
}
```

---

## 📖 READ Operations

### Finding by ID

```typescript
import { Types } from "mongoose";

// Find by ObjectId
const job = await Job.findById("507f1f77bcf86cd799439011");

// findById returns null if not found (no error)
if (!job) {
  throw new Error("Job not found");
}

// Using ObjectId type
const id = new Types.ObjectId("507f1f77bcf86cd799439011");
const job = await Job.findById(id);

// Find one by any field
const job = await Job.findOne({ slug: "senior-nodejs-developer" });
```

### Finding Multiple Documents

```typescript
// Find all active jobs
const jobs = await Job.find({ status: "active" });

// Find with multiple conditions (AND)
const jobs = await Job.find({
  status: "active",
  "location.remote": true,
  "salary.min": { $gte: 80000 },
});

// Find with OR conditions
const jobs = await Job.find({
  $or: [{ "location.city": "San Francisco" }, { "location.city": "New York" }],
});

// Find with IN (match any value in array)
const jobs = await Job.find({
  type: { $in: ["full-time", "contract"] },
});

// Find where array contains value
const jobs = await Job.find({
  skills: "TypeScript", // Jobs that have TypeScript in skills array
});

// Find where array contains all values
const jobs = await Job.find({
  skills: { $all: ["Node.js", "TypeScript"] },
});
```

### Query Operators

```typescript
// Comparison operators
const jobs = await Job.find({
  "salary.min": { $gte: 80000 }, // Greater than or equal
  "salary.max": { $lte: 150000 }, // Less than or equal
  applicantCount: { $gt: 10 }, // Greater than
  "location.city": { $ne: "Boston" }, // Not equal
});

// Existence
const jobs = await Job.find({
  "profile.bio": { $exists: true }, // Field exists
});

// Regex (text search alternative)
const jobs = await Job.find({
  title: { $regex: /developer/i }, // Case-insensitive match
});

// Text search (requires text index)
const jobs = await Job.find({
  $text: { $search: "senior nodejs developer" },
});
```

### Projection (Selecting Fields)

```typescript
// Select specific fields (inclusion)
const jobs = await Job.find({ status: "active" }).select(
  "title company salary location",
);

// Exclude specific fields (exclusion)
const jobs = await Job.find({ status: "active" }).select("-description -__v");

// Select nested fields
const jobs = await Job.find({ status: "active" }).select(
  "title salary.min salary.max location.city",
);

// Note: Can't mix inclusion and exclusion (except _id)
const jobs = await Job.find().select("title -_id"); // ✅ This works
```

### Sorting

```typescript
// Sort ascending (oldest first)
const jobs = await Job.find().sort({ createdAt: 1 });

// Sort descending (newest first)
const jobs = await Job.find().sort({ createdAt: -1 });

// Multiple sort fields
const jobs = await Job.find().sort({ status: 1, createdAt: -1 });

// String shorthand
const jobs = await Job.find().sort("-createdAt title"); // -field = descending
```

### Pagination

```typescript
// Basic pagination
const page = 1;
const limit = 10;
const skip = (page - 1) * limit;

const jobs = await Job.find({ status: "active" })
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit);

// Get total count for pagination metadata
const total = await Job.countDocuments({ status: "active" });

const pagination = {
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
};
```

### Using lean() for Performance

```typescript
// Without lean() - returns Mongoose documents
const jobs = await Job.find({ status: "active" });
// jobs[0] has methods like .save(), virtuals, etc.
// More memory, slower

// With lean() - returns plain JavaScript objects
const jobs = await Job.find({ status: "active" }).lean();
// jobs[0] is just { _id, title, ... }
// Less memory, faster
// ⚠️ No document methods or virtuals!

// Use lean() when:
// - You're just reading data for an API response
// - You don't need to call .save() or document methods
// - Performance matters
```

### Chaining Query Methods

```typescript
// Real-world query example
const jobs = await Job.find({ status: "active" })
  .select("title company salary location skills createdAt")
  .sort({ createdAt: -1 })
  .skip(20)
  .limit(10)
  .populate("company", "name logo")
  .lean();
```

---

## ✏️ UPDATE Operations

### findByIdAndUpdate

```typescript
// Update and return the NEW document
const job = await Job.findByIdAndUpdate(
  "507f1f77bcf86cd799439011",
  {
    title: "Lead Node.js Developer",
    "salary.max": 150000,
  },
  {
    new: true, // Return updated document (default: old)
    runValidators: true, // Run schema validation on update
  },
);

if (!job) {
  throw new Error("Job not found");
}
```

### findOneAndUpdate

```typescript
// Update by any field
const job = await Job.findOneAndUpdate(
  { slug: "senior-nodejs-developer", status: "active" },
  { $inc: { applicantCount: 1 } }, // Increment operator
  { new: true },
);
```

### Update Operators

```typescript
// $set - Set field values
await Job.findByIdAndUpdate(id, {
  $set: {
    title: "New Title",
    "location.city": "New York",
  },
});

// $inc - Increment numeric fields
await Job.findByIdAndUpdate(id, {
  $inc: { applicantCount: 1, viewCount: 1 },
});

// $push - Add to array
await Job.findByIdAndUpdate(id, {
  $push: { skills: "GraphQL" },
});

// $addToSet - Add to array only if not exists
await Job.findByIdAndUpdate(id, {
  $addToSet: { skills: "GraphQL" },
});

// $pull - Remove from array
await Job.findByIdAndUpdate(id, {
  $pull: { skills: "PHP" },
});

// $unset - Remove field
await Job.findByIdAndUpdate(id, {
  $unset: { temporaryField: 1 },
});
```

### updateOne and updateMany

```typescript
// Update one document (doesn't return the document)
const result = await Job.updateOne({ _id: id }, { status: "closed" });
// result: { matchedCount: 1, modifiedCount: 1, ... }

// Update many documents
const result = await Job.updateMany(
  {
    status: "active",
    createdAt: { $lt: thirtyDaysAgo },
  },
  {
    status: "expired",
  },
);
console.log(`Expired ${result.modifiedCount} jobs`);
```

### Update with Validation

```typescript
// ⚠️ By default, findByIdAndUpdate skips validation!
// Always use runValidators: true

const job = await Job.findByIdAndUpdate(
  id,
  { "salary.min": -1000 }, // Invalid!
  {
    new: true,
    runValidators: true, // Now validation runs
  },
);
// Throws ValidationError: salary.min must be >= 0
```

### Find, Modify, Save Pattern

Sometimes you need more control:

```typescript
// Find the document
const job = await Job.findById(id);
if (!job) throw new Error("Not found");

// Modify it
job.title = "Updated Title";
job.skills.push("New Skill");

// Complex logic
if (job.applicantCount > 100) {
  job.status = "popular";
}

// Save (runs all middleware and validation)
await job.save();
```

---

## 🗑️ DELETE Operations

### findByIdAndDelete

```typescript
// Delete and return the deleted document
const job = await Job.findByIdAndDelete("507f1f77bcf86cd799439011");

if (!job) {
  throw new Error("Job not found");
}

console.log(`Deleted job: ${job.title}`);
```

### findOneAndDelete

```typescript
// Delete by any criteria
const job = await Job.findOneAndDelete({
  slug: "old-job",
  status: "closed",
});
```

### deleteOne and deleteMany

```typescript
// Delete one (doesn't return the document)
const result = await Job.deleteOne({ _id: id });
// result: { deletedCount: 1 }

// Delete many
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const result = await Job.deleteMany({
  status: "closed",
  createdAt: { $lt: thirtyDaysAgo },
});
console.log(`Deleted ${result.deletedCount} old jobs`);
```

### Soft Delete Pattern

Instead of actually deleting, mark as deleted:

```typescript
// Add to schema
const jobSchema = new Schema({
  // ... other fields
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
});

// Soft delete function
async function softDeleteJob(id: string) {
  return Job.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
      deletedAt: new Date(),
      status: "deleted",
    },
    { new: true },
  );
}

// Query middleware to exclude soft-deleted
jobSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

// To include deleted items when needed
const allJobs = await Job.find().setOptions({ includeDeleted: true });
```

---

## 🆔 Handling ObjectId

### Creating ObjectIds

```typescript
import { Types } from "mongoose";

// Create new ObjectId
const newId = new Types.ObjectId();

// From string
const id = new Types.ObjectId("507f1f77bcf86cd799439011");

// Check if valid ObjectId string
const isValid = Types.ObjectId.isValid("507f1f77bcf86cd799439011"); // true
const isInvalid = Types.ObjectId.isValid("invalid"); // false
```

### Converting for Queries

```typescript
// Most Mongoose methods accept string or ObjectId
// These are equivalent:
await Job.findById("507f1f77bcf86cd799439011");
await Job.findById(new Types.ObjectId("507f1f77bcf86cd799439011"));

// For manual queries, be explicit
await Job.find({
  company: new Types.ObjectId(companyIdString),
});
```

### Comparing ObjectIds

```typescript
const id1 = new Types.ObjectId("507f1f77bcf86cd799439011");
const id2 = new Types.ObjectId("507f1f77bcf86cd799439011");

// ❌ Wrong - object comparison
console.log(id1 === id2); // false (different objects!)

// ✅ Correct - use equals() method
console.log(id1.equals(id2)); // true

// ✅ Or convert to string
console.log(id1.toString() === id2.toString()); // true
```

---

## 🎮 Mini-Tutorial: Build a Complete CRUD Service

Let's build a job service with all CRUD operations:

```typescript
// src/services/jobService.ts
import { Job, IJob, IJobDocument } from "../models/Job.js";
import { Types } from "mongoose";

interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
}

interface JobFilters {
  status?: string;
  type?: string;
  remote?: boolean;
  skills?: string[];
  salaryMin?: number;
  search?: string;
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const jobService = {
  // CREATE
  async createJob(data: Partial<IJob>): Promise<IJobDocument> {
    const job = await Job.create(data);
    return job;
  },

  // READ - Find by ID
  async getJobById(id: string): Promise<IJobDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Job.findById(id)
      .populate("company", "name logo website")
      .populate("postedBy", "name");
  },

  // READ - Find with filters and pagination
  async getJobs(
    filters: JobFilters = {},
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<IJobDocument>> {
    const { page = 1, limit = 10, sort = "-createdAt" } = options;

    // Build filter query
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.remote !== undefined) {
      query["location.remote"] = filters.remote;
    }

    if (filters.skills?.length) {
      query.skills = { $in: filters.skills };
    }

    if (filters.salaryMin) {
      query["salary.max"] = { $gte: filters.salaryMin };
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .select("-description") // Exclude heavy fields for list
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("company", "name logo")
        .lean(),
      Job.countDocuments(query),
    ]);

    return {
      data: jobs as IJobDocument[],
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  },

  // UPDATE
  async updateJob(
    id: string,
    updates: Partial<IJob>,
  ): Promise<IJobDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    // Don't allow updating certain fields
    const { postedBy, company, ...safeUpdates } = updates as any;

    return Job.findByIdAndUpdate(
      id,
      { $set: safeUpdates },
      { new: true, runValidators: true },
    );
  },

  // UPDATE - Increment applicant count
  async incrementApplicants(id: string): Promise<IJobDocument | null> {
    return Job.findByIdAndUpdate(
      id,
      { $inc: { applicantCount: 1 } },
      { new: true },
    );
  },

  // DELETE
  async deleteJob(id: string): Promise<IJobDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return Job.findByIdAndDelete(id);
  },

  // DELETE - Soft delete
  async archiveJob(id: string): Promise<IJobDocument | null> {
    return Job.findByIdAndUpdate(
      id,
      {
        status: "archived",
        archivedAt: new Date(),
      },
      { new: true },
    );
  },

  // BULK - Close expired jobs
  async closeExpiredJobs(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Job.updateMany(
      {
        status: "active",
        createdAt: { $lt: thirtyDaysAgo },
      },
      {
        status: "expired",
      },
    );

    return result.modifiedCount;
  },
};
```

### Using the Service in Controllers

```typescript
// src/controllers/jobController.ts
import { Request, Response, NextFunction } from "express";
import { jobService } from "../services/jobService.js";

export const jobController = {
  async getJobs(req: Request, res: Response, next: NextFunction) {
    const {
      page,
      limit,
      sort,
      status,
      type,
      remote,
      skills,
      salaryMin,
      search,
    } = req.query;

    const result = await jobService.getJobs(
      {
        status: status as string,
        type: type as string,
        remote: remote === "true",
        skills: skills ? (skills as string).split(",") : undefined,
        salaryMin: salaryMin ? parseInt(salaryMin as string) : undefined,
        search: search as string,
      },
      {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        sort: sort as string,
      },
    );

    res.json({
      success: true,
      ...result,
    });
  },

  async getJob(req: Request, res: Response, next: NextFunction) {
    const job = await jobService.getJobById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    res.json({
      success: true,
      data: job,
    });
  },

  async createJob(req: Request, res: Response, next: NextFunction) {
    const job = await jobService.createJob({
      ...req.body,
      postedBy: req.user!.id, // From auth middleware
    });

    res.status(201).json({
      success: true,
      data: job,
    });
  },

  async updateJob(req: Request, res: Response, next: NextFunction) {
    const job = await jobService.updateJob(req.params.id, req.body);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    res.json({
      success: true,
      data: job,
    });
  },

  async deleteJob(req: Request, res: Response, next: NextFunction) {
    const job = await jobService.deleteJob(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: "Job not found",
      });
    }

    res.json({
      success: true,
      message: "Job deleted",
    });
  },
};
```

---

## 🎯 Practice Exercise

Build a standalone job board CRUD example:

**Requirements:**

1. Create a `Job` model with: title, company, location, salary (min/max), skills[], status
2. Implement these service methods:
   - `createJob(data)` - Create a new job
   - `getJobs(filters)` - Get jobs with optional status filter and pagination
   - `getJobById(id)` - Get single job
   - `updateJob(id, data)` - Update job
   - `deleteJob(id)` - Delete job
3. Handle invalid ObjectIds gracefully
4. Use `lean()` for list queries

<details>
<summary>💡 Solution Starter</summary>

```typescript
import mongoose, { Schema, Types } from "mongoose";

// Connect
await mongoose.connect("mongodb://localhost:27017/jobboard");

// Schema
const jobSchema = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    salary: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    skills: [String],
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
  },
  { timestamps: true },
);

const Job = mongoose.model("Job", jobSchema);

// Service
const jobService = {
  async createJob(data: any) {
    return Job.create(data);
  },

  async getJobs(filters: { status?: string } = {}, page = 1, limit = 10) {
    const query: any = {};
    if (filters.status) query.status = filters.status;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Job.countDocuments(query),
    ]);

    return { data: jobs, total, page, pages: Math.ceil(total / limit) };
  },

  async getJobById(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Job.findById(id);
  },

  async updateJob(id: string, data: any) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Job.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  async deleteJob(id: string) {
    if (!Types.ObjectId.isValid(id)) return null;
    return Job.findByIdAndDelete(id);
  },
};

// Test it
const job = await jobService.createJob({
  title: "Node.js Developer",
  company: "TechCorp",
  location: "Remote",
  salary: { min: 80000, max: 120000 },
  skills: ["Node.js", "TypeScript"],
});
console.log("Created:", job);

const jobs = await jobService.getJobs({ status: "active" });
console.log("Jobs:", jobs);
```

</details>

---

## 🐛 5-Minute Debugger

### "CastError: Cast to ObjectId failed"

```typescript
// ❌ Invalid ObjectId format
await Job.findById("invalid-id");
// CastError: Cast to ObjectId failed for value "invalid-id"

// ✅ Validate first
if (!Types.ObjectId.isValid(id)) {
  throw new Error("Invalid ID format");
}
const job = await Job.findById(id);
```

### "Update not working"

```typescript
// ❌ Forgetting to use update operators
await Job.updateOne(
  { _id: id },
  { title: "New Title" }, // This works, but...
);

// ❌ This doesn't work as expected
await Job.updateOne(
  { _id: id },
  { "salary.min": 90000 }, // Replaces entire salary object!
);

// ✅ Use $set for nested updates
await Job.updateOne({ _id: id }, { $set: { "salary.min": 90000 } });
```

### "Query returns empty array but data exists"

```typescript
// ❌ Wrong field name
await Job.find({ Status: "active" }); // Capital S!

// ❌ Wrong type
await Job.find({ "salary.min": "80000" }); // String vs Number

// ✅ Use exact field names and types
await Job.find({ status: "active" });
await Job.find({ "salary.min": 80000 });
```

---

## 💡 Pro Tips

### 1. Use `lean()` for Read-Only Operations

```typescript
// API response - don't need document methods
const jobs = await Job.find().lean(); // 2-3x faster
```

### 2. Only `select()` What You Need

```typescript
// ❌ Returns everything
const jobs = await Job.find();

// ✅ Returns only needed fields
const jobs = await Job.find().select("title company salary.min location.city");
```

### 3. Index Your Query Fields

```typescript
// If you query by status often, index it
jobSchema.index({ status: 1, createdAt: -1 });
```

### 4. Use `countDocuments()` Not `count()`

```typescript
// ❌ Deprecated
const count = await Job.count({ status: "active" });

// ✅ Current
const count = await Job.countDocuments({ status: "active" });
```

---

## ✅ Definition of Done

You've completed this lesson when you can:

- [ ] Create documents using `Model.create()` and `new Model().save()`
- [ ] Find documents with `findById()`, `findOne()`, `find()`
- [ ] Apply query filters, operators, and projections
- [ ] Use `sort()`, `skip()`, `limit()` for pagination
- [ ] Update documents with `findByIdAndUpdate()` and update operators
- [ ] Delete documents with `findByIdAndDelete()` and `deleteMany()`
- [ ] Use `lean()` appropriately for performance
- [ ] Handle ObjectId validation and comparison
- [ ] Build a complete CRUD service

---

## ➡️ Next Lesson

Now that you know CRUD operations, let's explore how to **connect documents together** with relationships and population.

**[→ Lesson 4: Relationships & Population](./04-relationships-population.md)**

---

<blockquote>
💡 <strong>Remember:</strong> These CRUD patterns apply to any database. In Module 09, you'll see equivalent operations with Drizzle + PostgreSQL for DevJobs Pro!
</blockquote>

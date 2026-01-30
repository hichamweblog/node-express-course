# Lesson 4: Relationships & Population

## 🎯 Learning Objectives

By the end of this lesson, you'll:

- Decide when to embed documents vs use references
- Create references between documents using ObjectId
- Use `populate()` to join referenced documents
- Implement deep population for nested relationships
- Set up virtual population for reverse lookups
- Understand performance implications of different approaches

---

## 🪝 Hook: Connecting Documents

In relational databases, relationships are sacred—foreign keys, join tables, normalized data. In MongoDB, you have choices:

1. **Embed** the data directly (denormalization)
2. **Reference** another document with ObjectId (like foreign keys)

Both are valid. The art is knowing when to use each.

> **📌 Module Note:** These relationship patterns are standalone examples. DevJobs Pro uses PostgreSQL + Drizzle where relationships work differently (SQL JOINs).

---

## 📊 Embedded vs Referenced: Visual Comparison

```
┌─────────────────────────────────────────────────────────────────────┐
│                    EMBEDDED DOCUMENTS                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   User Document                                                     │
│   ┌────────────────────────────────────────────────────────┐        │
│   │  {                                                     │        │
│   │    "_id": ObjectId("user1"),                           │        │
│   │    "name": "Alice",                                    │        │
│   │    "addresses": [                                      │        │
│   │      {                              ◄── Data lives     │        │
│   │        "street": "123 Main St",         INSIDE the    │        │
│   │        "city": "New York"               document      │        │
│   │      },                                                │        │
│   │      {                                                 │        │
│   │        "street": "456 Oak Ave",                        │        │
│   │        "city": "Boston"                                │        │
│   │      }                                                 │        │
│   │    ]                                                   │        │
│   │  }                                                     │        │
│   └────────────────────────────────────────────────────────┘        │
│                                                                     │
│   ✅ One query gets everything                                      │
│   ✅ Atomic updates                                                 │
│   ❌ Data duplication if shared                                     │
│   ❌ 16MB document limit                                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    REFERENCED DOCUMENTS                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   User Document                        Company Document             │
│   ┌──────────────────────────┐        ┌──────────────────────────┐ │
│   │  {                       │        │  {                       │ │
│   │    "_id": ObjectId("u1"),│        │    "_id": ObjectId("c1"),│ │
│   │    "name": "Alice",      │        │    "name": "TechCorp",   │ │
│   │    "company": ───────────┼───────►│    "logo": "...",        │ │
│   │       ObjectId("c1")     │        │    "website": "..."      │ │
│   │  }                       │        │  }                       │ │
│   └──────────────────────────┘        └──────────────────────────┘ │
│             │                                                       │
│             │ populate()                                            │
│             ▼                                                       │
│   ┌──────────────────────────────────────────────────────────────┐ │
│   │  {                                                           │ │
│   │    "_id": ObjectId("u1"),                                    │ │
│   │    "name": "Alice",                                          │ │
│   │    "company": {                        ◄── Populated!        │ │
│   │      "_id": ObjectId("c1"),                                  │ │
│   │      "name": "TechCorp",                                     │ │
│   │      "logo": "...",                                          │ │
│   │      "website": "..."                                        │ │
│   │    }                                                         │ │
│   │  }                                                           │ │
│   └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│   ✅ No data duplication                                            │
│   ✅ Easy to update shared data                                     │
│   ❌ Requires populate() (extra query)                              │
│   ❌ Not as fast as embedding                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📚 When to Embed vs Reference

### Decision Framework

```
┌─────────────────────────────────────────────────────────────────────┐
│                     EMBED OR REFERENCE?                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Ask these questions:                                              │
│                                                                     │
│   1. Is the data always accessed together?                          │
│      YES → Embed    NO → Reference                                  │
│                                                                     │
│   2. Does the child belong to only ONE parent?                      │
│      YES → Embed    NO → Reference                                  │
│                                                                     │
│   3. How often does the child data change?                          │
│      RARELY → Embed    FREQUENTLY → Reference                       │
│                                                                     │
│   4. Is the child data shared across documents?                     │
│      NO → Embed    YES → Reference                                  │
│                                                                     │
│   5. Will the array grow unbounded?                                 │
│      NO → Embed    YES → Reference (or bucket pattern)              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Practical Examples

| Relationship       | Strategy      | Reason                                              |
| ------------------ | ------------- | --------------------------------------------------- |
| User → Addresses   | **Embed**     | Few addresses per user, always accessed with user   |
| User → Orders      | **Reference** | Orders grow unbounded, queried independently        |
| Job → Company      | **Reference** | Company shared by many jobs, updated independently  |
| Job → Skills       | **Embed**     | Small fixed list, always shown with job             |
| Order → Line Items | **Embed**     | Always accessed together, don't exist independently |
| Post → Comments    | **Reference** | Comments can be many, paginated separately          |
| User → Profile     | **Embed**     | 1:1 relationship, always accessed together          |

---

## 📝 Embedding Documents

### Schema with Embedded Documents

```typescript
// src/models/User.ts
import mongoose, { Schema, Document } from "mongoose";

// Embedded schema (no model, just structure)
const addressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    zipCode: String,
    country: { type: String, default: "USA" },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
); // Don't add _id to embedded docs

// Profile as embedded object
const profileSchema = new Schema(
  {
    bio: { type: String, maxlength: 500 },
    avatar: String,
    website: String,
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
    },
  },
  { _id: false },
);

export interface IUser {
  name: string;
  email: string;
  addresses: {
    street: string;
    city: string;
    state?: string;
    zipCode?: string;
    country: string;
    isDefault: boolean;
  }[];
  profile?: {
    bio?: string;
    avatar?: string;
    website?: string;
    socialLinks?: {
      linkedin?: string;
      twitter?: string;
      github?: string;
    };
  };
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // Embedded array
    addresses: {
      type: [addressSchema],
      validate: {
        validator: (v: any[]) => v.length <= 5,
        message: "Cannot have more than 5 addresses",
      },
    },

    // Embedded object
    profile: profileSchema,
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
```

### Working with Embedded Documents

```typescript
// Create user with embedded data
const user = await User.create({
  name: "Alice Johnson",
  email: "alice@example.com",
  addresses: [
    { street: "123 Main St", city: "New York", isDefault: true },
    { street: "456 Oak Ave", city: "Boston", isDefault: false },
  ],
  profile: {
    bio: "Software developer",
    socialLinks: {
      github: "https://github.com/alice",
    },
  },
});

// Read - everything comes in one query
const user = await User.findById(userId);
console.log(user.addresses[0].city); // 'New York'
console.log(user.profile?.bio); // 'Software developer'

// Update embedded array - add new address
await User.findByIdAndUpdate(userId, {
  $push: {
    addresses: { street: "789 Pine Rd", city: "Chicago", isDefault: false },
  },
});

// Update embedded array - modify existing
await User.findByIdAndUpdate(userId, {
  $set: { "addresses.0.city": "Brooklyn" }, // Update first address
});

// Update embedded array - by matching criteria
await User.updateOne(
  { _id: userId, "addresses.city": "Boston" },
  { $set: { "addresses.$.state": "MA" } }, // $ = matched array element
);

// Remove from embedded array
await User.findByIdAndUpdate(userId, {
  $pull: { addresses: { city: "Chicago" } },
});

// Update embedded object
await User.findByIdAndUpdate(userId, {
  $set: {
    "profile.bio": "Senior developer",
    "profile.socialLinks.twitter": "https://twitter.com/alice",
  },
});
```

---

## 🔗 Referencing Documents

### Schema with References

```typescript
// src/models/Company.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICompany {
  name: string;
  logo?: string;
  website?: string;
  industry: string;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, unique: true },
    logo: String,
    website: String,
    industry: { type: String, required: true },
  },
  { timestamps: true },
);

export const Company = mongoose.model("Company", companySchema);
```

```typescript
// src/models/Job.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IJob {
  title: string;
  description: string;
  company: Types.ObjectId; // Reference to Company
  postedBy: Types.ObjectId; // Reference to User
  skills: string[];
  status: "active" | "closed";
}

export interface IJobDocument extends IJob, Document {}

const jobSchema = new Schema<IJobDocument>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    // Reference fields
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company", // Model name to populate from
      required: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    skills: [String],
    status: { type: String, enum: ["active", "closed"], default: "active" },
  },
  { timestamps: true },
);

// Index for common queries
jobSchema.index({ company: 1 });
jobSchema.index({ postedBy: 1 });

export const Job = mongoose.model("Job", jobSchema);
```

### Creating Referenced Documents

```typescript
import { Company } from "./models/Company.js";
import { Job } from "./models/Job.js";
import { User } from "./models/User.js";

// First, create the company
const company = await Company.create({
  name: "TechCorp",
  logo: "https://example.com/logo.png",
  industry: "Technology",
});

// Get a user (employer)
const employer = await User.findOne({ role: "employer" });

// Create job with references (just the ObjectIds)
const job = await Job.create({
  title: "Senior Node.js Developer",
  description: "Join our team...",
  company: company._id, // ObjectId reference
  postedBy: employer!._id, // ObjectId reference
  skills: ["Node.js", "TypeScript"],
});

console.log(job.company); // ObjectId("...") - NOT the company data!
```

---

## 🔄 populate() - Joining Documents

### Basic Population

```
┌─────────────────────────────────────────────────────────────────────┐
│                     populate() Execution Flow                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   1. Query Jobs                                                     │
│   ┌─────────────────────────────┐                                   │
│   │ Job.find({ status: 'active' })                                  │
│   │   .populate('company')                                          │
│   └─────────────────────────────┘                                   │
│               │                                                     │
│               ▼                                                     │
│   2. Mongoose executes first query                                  │
│   ┌─────────────────────────────┐                                   │
│   │ db.jobs.find({ status: 'active' })                              │
│   │ Returns: [                                                      │
│   │   { title: "...", company: ObjectId("c1"), ... },               │
│   │   { title: "...", company: ObjectId("c2"), ... }                │
│   │ ]                                                               │
│   └─────────────────────────────┘                                   │
│               │                                                     │
│               ▼                                                     │
│   3. Mongoose collects unique company IDs                           │
│   ┌─────────────────────────────┐                                   │
│   │ Company IDs: ["c1", "c2"]                                       │
│   └─────────────────────────────┘                                   │
│               │                                                     │
│               ▼                                                     │
│   4. Mongoose executes SECOND query                                 │
│   ┌─────────────────────────────┐                                   │
│   │ db.companies.find({                                             │
│   │   _id: { $in: [ObjectId("c1"), ObjectId("c2")] }                │
│   │ })                                                              │
│   └─────────────────────────────┘                                   │
│               │                                                     │
│               ▼                                                     │
│   5. Mongoose merges results                                        │
│   ┌─────────────────────────────┐                                   │
│   │ [                                                               │
│   │   {                                                             │
│   │     title: "...",                                               │
│   │     company: { _id: "c1", name: "TechCorp", ... }  ◄── Merged!  │
│   │   },                                                            │
│   │   ...                                                           │
│   │ ]                                                               │
│   └─────────────────────────────┘                                   │
│                                                                     │
│   💡 This is NOT a join - it's TWO separate queries!                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Using populate()

```typescript
// Basic populate
const job = await Job.findById(jobId).populate("company");

console.log(job.company);
// Before: ObjectId("...")
// After:  { _id: ObjectId("..."), name: "TechCorp", logo: "...", ... }

// Populate with field selection
const job = await Job.findById(jobId).populate("company", "name logo"); // Only get name and logo

console.log(job.company);
// { _id: ObjectId("..."), name: "TechCorp", logo: "..." }

// Populate multiple refs
const job = await Job.findById(jobId)
  .populate("company", "name logo")
  .populate("postedBy", "name email");

// Or in one call
const job = await Job.findById(jobId).populate([
  { path: "company", select: "name logo" },
  { path: "postedBy", select: "name email" },
]);
```

### Populate with Conditions

```typescript
// Only populate companies in a specific industry
const jobs = await Job.find({ status: "active" }).populate({
  path: "company",
  select: "name logo industry",
  match: { industry: "Technology" }, // Filter condition
});

// Note: Jobs where company doesn't match will have company: null
```

### Deep Population (Nested)

```typescript
// src/models/Application.ts
const applicationSchema = new Schema({
  job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  applicant: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: {
    type: String,
    enum: ["pending", "reviewed", "accepted", "rejected"],
  },
  appliedAt: { type: Date, default: Date.now },
});

export const Application = mongoose.model("Application", applicationSchema);
```

```typescript
// Multi-level population
const application = await Application.findById(applicationId)
  .populate({
    path: "job",
    select: "title company",
    populate: {
      // Nested populate!
      path: "company",
      select: "name logo",
    },
  })
  .populate("applicant", "name email");

console.log(application.job.title); // "Senior Developer"
console.log(application.job.company.name); // "TechCorp" (nested!)
console.log(application.applicant.name); // "Alice"
```

---

## 🔮 Virtual Population

Virtual population creates a "reverse lookup"—finding documents that reference this one.

```typescript
// src/models/Company.ts
const companySchema = new Schema(
  {
    name: { type: String, required: true },
    // ... other fields
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals in JSON output
    toObject: { virtuals: true },
  },
);

// Virtual: Get all jobs for this company
companySchema.virtual("jobs", {
  ref: "Job", // Model to populate from
  localField: "_id", // Field in Company
  foreignField: "company", // Field in Job that references Company
  options: { sort: { createdAt: -1 } }, // Optional: sort results
});

// Virtual: Count of jobs
companySchema.virtual("jobCount", {
  ref: "Job",
  localField: "_id",
  foreignField: "company",
  count: true, // Just return the count
});

export const Company = mongoose.model("Company", companySchema);
```

### Using Virtual Populate

```typescript
// Get company with all its jobs
const company = await Company.findById(companyId).populate("jobs");

console.log(company.name); // "TechCorp"
console.log(company.jobs); // Array of job documents!
console.log(company.jobs.length); // 15

// Get company with job count only
const company = await Company.findById(companyId).populate("jobCount");

console.log(company.jobCount); // 15 (just the number)

// Populate with options
const company = await Company.findById(companyId).populate({
  path: "jobs",
  select: "title status createdAt",
  match: { status: "active" }, // Only active jobs
  options: { limit: 5 }, // Only first 5
});
```

---

## ⚡ Performance Considerations

### The N+1 Problem

```typescript
// ❌ Bad: N+1 queries
const jobs = await Job.find({ status: "active" });
for (const job of jobs) {
  const company = await Company.findById(job.company); // Query for EACH job!
  console.log(job.title, company.name);
}
// If 100 jobs: 1 + 100 = 101 queries!

// ✅ Good: Batch with populate
const jobs = await Job.find({ status: "active" }).populate("company", "name");
for (const job of jobs) {
  console.log(job.title, job.company.name);
}
// Only 2 queries total!
```

### Avoiding Over-Population

```typescript
// ❌ Bad: Populating everything
const jobs = await Job.find()
  .populate("company") // Full company doc
  .populate("postedBy") // Full user doc
  .populate({
    path: "applications",
    populate: {
      path: "applicant", // Full applicant docs for each
      populate: { path: "company" }, // And their companies...
    },
  });
// This is getting out of hand!

// ✅ Good: Only what you need
const jobs = await Job.find()
  .select("title salary.min location.city createdAt") // Minimal job fields
  .populate("company", "name logo") // Only name and logo
  .lean(); // Plain objects
```

### When to Avoid populate()

```typescript
// For hot paths with many concurrent requests, consider:

// Option 1: Denormalize (embed common data)
const jobSchema = new Schema({
  title: String,
  // Embed frequently needed company info
  companyInfo: {
    id: Schema.Types.ObjectId,
    name: String, // Cached
    logo: String, // Cached
  },
});

// Option 2: Use aggregation with $lookup
const jobs = await Job.aggregate([
  { $match: { status: "active" } },
  {
    $lookup: {
      from: "companies",
      localField: "company",
      foreignField: "_id",
      as: "companyData",
    },
  },
  { $unwind: "$companyData" },
  {
    $project: {
      title: 1,
      "companyData.name": 1,
      "companyData.logo": 1,
    },
  },
]);
```

---

## 🎮 Mini-Tutorial: Create Relationships with Population

Let's build a mini job board with proper relationships:

```typescript
// src/models/index.ts
import mongoose, { Schema, Types, Document } from "mongoose";

// ============ Company ============
const companySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    logo: String,
    industry: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// Virtual: jobs for this company
companySchema.virtual("jobs", {
  ref: "Job",
  localField: "_id",
  foreignField: "company",
});

export const Company = mongoose.model("Company", companySchema);

// ============ User ============
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["jobseeker", "employer"],
      default: "jobseeker",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// Virtual: applications by this user
userSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "applicant",
});

export const User = mongoose.model("User", userSchema);

// ============ Job ============
const jobSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    skills: [String],
    status: { type: String, enum: ["active", "closed"], default: "active" },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

// Virtual: applications for this job
jobSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "job",
});

// Virtual: application count
jobSchema.virtual("applicationCount", {
  ref: "Application",
  localField: "_id",
  foreignField: "job",
  count: true,
});

export const Job = mongoose.model("Job", jobSchema);

// ============ Application ============
const applicationSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    coverLetter: String,
    status: {
      type: String,
      enum: ["pending", "reviewed", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// Prevent duplicate applications
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export const Application = mongoose.model("Application", applicationSchema);
```

### Querying with Relationships

```typescript
// Get job listing with company info
async function getJobListing(jobId: string) {
  return Job.findById(jobId)
    .populate("company", "name logo")
    .populate("postedBy", "name");
}

// Get job with all applications
async function getJobWithApplications(jobId: string) {
  return Job.findById(jobId)
    .populate("company", "name logo")
    .populate({
      path: "applications",
      populate: {
        path: "applicant",
        select: "name email",
      },
    });
}

// Get user's applications with job details
async function getUserApplications(userId: string) {
  return Application.find({ applicant: userId })
    .populate({
      path: "job",
      select: "title company status",
      populate: {
        path: "company",
        select: "name logo",
      },
    })
    .sort({ createdAt: -1 });
}

// Get company with all their active jobs
async function getCompanyProfile(companyId: string) {
  return Company.findById(companyId).populate({
    path: "jobs",
    match: { status: "active" },
    select: "title skills createdAt",
    options: { sort: { createdAt: -1 }, limit: 10 },
  });
}

// Get job listing with application count
async function getJobsWithCounts() {
  return Job.find({ status: "active" })
    .populate("company", "name logo")
    .populate("applicationCount")
    .select("title company salary.min applicationCount createdAt")
    .sort({ createdAt: -1 })
    .lean();
}
```

---

## 🎯 Practice Exercise

Analyze relationships in a job board context (theory exercise):

**Given these entities:**

- Users (can be job seekers or employers)
- Companies (owned by employer users)
- Jobs (posted by companies)
- Applications (job seekers applying to jobs)
- Skills (possessed by users, required by jobs)

**Questions:**

1. Which relationships would you **embed** vs **reference**?
2. What virtual relationships would be useful?
3. Design the schemas showing relationships.
4. Write a query to get: "All jobs I haven't applied to yet"

<details>
<summary>💡 Discussion</summary>

**1. Embed vs Reference:**

| Relationship          | Strategy  | Reason                                |
| --------------------- | --------- | ------------------------------------- |
| User → Skills         | Embed     | Small list, always accessed with user |
| Company → Owner       | Reference | Owner is accessed independently       |
| Job → Company         | Reference | Company shared, updated independently |
| Job → Skills Required | Embed     | Small list, always shown with job     |
| Application → Job     | Reference | Job accessed independently            |
| Application → User    | Reference | User accessed independently           |

**2. Useful Virtuals:**

```typescript
// Company
companySchema.virtual("jobs"); // All jobs by this company
companySchema.virtual("activeJobCount"); // Count of active jobs

// User (job seeker)
userSchema.virtual("applications"); // All their applications

// Job
jobSchema.virtual("applications"); // All applications
jobSchema.virtual("applicationCount"); // Count
```

**3. Schema Design:**

```typescript
// User Schema
{
  name: String,
  email: String,
  role: 'jobseeker' | 'employer',
  skills: [String],              // Embedded
  companyId?: ObjectId           // Reference (for employers)
}

// Company Schema
{
  name: String,
  owner: ObjectId,               // Reference to User
  // Virtual: jobs
}

// Job Schema
{
  title: String,
  company: ObjectId,             // Reference
  postedBy: ObjectId,            // Reference
  skillsRequired: [String],      // Embedded
  // Virtual: applications, applicationCount
}

// Application Schema
{
  job: ObjectId,                 // Reference
  applicant: ObjectId,           // Reference
  status: String
}
```

**4. Query: Jobs I haven't applied to**

```typescript
async function getJobsNotAppliedTo(userId: string) {
  // Get jobs I've already applied to
  const myApplications = await Application.find({ applicant: userId })
    .select("job")
    .lean();

  const appliedJobIds = myApplications.map((a) => a.job);

  // Get active jobs excluding those
  return Job.find({
    status: "active",
    _id: { $nin: appliedJobIds },
  })
    .populate("company", "name logo")
    .select("title company skills createdAt")
    .sort({ createdAt: -1 });
}
```

</details>

---

## 🐛 5-Minute Debugger

### "populate() returns null"

```typescript
// ❌ Referenced document doesn't exist
const job = await Job.findById(id).populate("company");
console.log(job.company); // null

// Check: Does the company actually exist?
const company = await Company.findById(job.company);
// If null, the reference points to a deleted document

// ✅ Handle gracefully
const job = await Job.findById(id).populate("company");
if (!job.company) {
  // Handle missing company (deleted?)
}
```

### "Cannot populate path"

```typescript
// ❌ Wrong ref in schema
jobSchema = new Schema({
  company: { type: Schema.Types.ObjectId, ref: "Companies" }, // Wrong!
});

// Collection is 'companies' but model is 'Company'
// ✅ Fix: ref should match MODEL NAME
jobSchema = new Schema({
  company: { type: Schema.Types.ObjectId, ref: "Company" }, // Correct
});
```

### "Circular population causing memory issues"

```typescript
// ❌ Infinite population loop
userSchema.virtual('company', { ref: 'Company', ... });
companySchema.virtual('owner', { ref: 'User', ... });

// Populating both creates infinite depth!
await User.findById(id)
  .populate({
    path: 'company',
    populate: {
      path: 'owner',
      populate: {
        path: 'company',  // Infinite loop!
        ...
      }
    }
  });

// ✅ Fix: Limit population depth, only populate what you need
await User.findById(id)
  .populate('company');  // Stop here
```

---

## 💡 Pro Tips

### 1. Don't Over-Populate

```typescript
// ❌ Loading entire related documents
const jobs = await Job.find().populate("company").populate("postedBy");

// ✅ Only select needed fields
const jobs = await Job.find()
  .populate("company", "name logo")
  .populate("postedBy", "name");
```

### 2. Embed Data That Rarely Changes

```typescript
// For read-heavy paths, cache commonly needed data
const jobSchema = new Schema({
  company: { type: Schema.Types.ObjectId, ref: "Company" },

  // Cached company info (denormalized for speed)
  companySnapshot: {
    name: String,
    logo: String,
  },
});

// Update cache when company changes (via middleware or manually)
```

### 3. Index Your References

```typescript
// Always index fields used in populate
jobSchema.index({ company: 1 });
jobSchema.index({ postedBy: 1 });
applicationSchema.index({ job: 1 });
applicationSchema.index({ applicant: 1 });
```

### 4. Use lean() When Possible

```typescript
// Don't need Mongoose document features? Use lean()
const jobs = await Job.find().populate("company", "name").lean(); // 2-3x faster
```

---

## ✅ Definition of Done

You've completed this lesson when you can:

- [ ] Decide when to embed documents vs use references
- [ ] Create references between documents with ObjectId
- [ ] Use `populate()` to join referenced documents
- [ ] Apply field selection in populate for efficiency
- [ ] Implement deep (nested) population
- [ ] Set up virtual population for reverse lookups
- [ ] Explain performance implications of different approaches
- [ ] Handle common population issues

---

## 🎉 Module 08 Complete!

Congratulations! You now understand MongoDB and Mongoose:

✅ NoSQL concepts and when to use them
✅ Mongoose schemas with validation
✅ CRUD operations
✅ Relationships and population

---

## ➡️ What's Next: Module 09 - PostgreSQL + Drizzle

Now that you understand document databases, it's time to **build DevJobs Pro's actual database** with PostgreSQL and Drizzle ORM.

**Why PostgreSQL for DevJobs Pro?**

- Strong relationships (users ↔ applications ↔ jobs ↔ companies)
- ACID transactions for data integrity
- Complex queries with SQL joins
- Drizzle provides type-safe queries like Mongoose, but for SQL

**[→ Module 09: PostgreSQL + Drizzle ORM](../09-postgresql-drizzle/README.md)** (coming next!)

---

<blockquote>
💡 <strong>Key Takeaway:</strong> MongoDB and PostgreSQL are both excellent databases for different use cases. Now you can evaluate which fits your project's needs. For DevJobs Pro, PostgreSQL's relational strengths win—but you now have MongoDB in your toolkit for future projects!
</blockquote>

# Lesson 1: Input Validation with Zod

## Never Trust User Input

> "I once watched a junior developer spend three days debugging a production crash. The cause? A user entered 'null' as their username—the string 'null', not the value. The code didn't validate input and tried to process it as if it were a real name. Three days. Validation would have caught it in milliseconds."

Every piece of data that enters your API is potentially dangerous. Users make typos. Attackers probe for weaknesses. Bots send garbage. Your job is to stand guard at the gate and ensure only valid data gets through.

This isn't paranoia—it's professionalism.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     THE VALIDATION GATE                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    Incoming Request                                                         │
│          │                                                                  │
│          ▼                                                                  │
│    ┌───────────┐                                                           │
│    │  Request  │   { email: "not-an-email", age: "twenty-five" }           │
│    │   Body    │                                                           │
│    └─────┬─────┘                                                           │
│          │                                                                  │
│          ▼                                                                  │
│    ┌───────────┐                                                           │
│    │    Zod    │   Schema defines expected shape                           │
│    │  Schema   │   z.object({ email: z.string().email(), age: z.number() })│
│    └─────┬─────┘                                                           │
│          │                                                                  │
│    ┌─────┴─────┐                                                           │
│    │           │                                                           │
│    ▼           ▼                                                           │
│  Valid       Invalid                                                        │
│    │           │                                                           │
│    ▼           ▼                                                           │
│ Continue    Return 400                                                      │
│ to handler  with errors                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Why Validation Matters

### Without Validation

```javascript
// ❌ DANGEROUS: No validation
app.post("/users", async (req, res) => {
  const { email, age } = req.body;

  // What if email is undefined?
  // What if age is "twenty-five"?
  // What if req.body is null?

  await db.users.create({ email, age }); // 💥 Potential crash or corruption
  res.json({ success: true });
});
```

### With Validation

```typescript
// ✅ SAFE: Validated input
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(13).max(120),
});

app.post("/users", async (req, res) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }

  // result.data is now typed and guaranteed valid
  await db.users.create(result.data);
  res.json({ success: true });
});
```

---

## Validation Libraries Compared

```
┌───────────────────────────────────────────────────────────────────────────┐
│                    VALIDATION LIBRARY COMPARISON                          │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  FEATURE              JOI           YUP          ZOD                      │
│  ─────────────────────────────────────────────────────────────────────── │
│  TypeScript-first     ❌ Bolt-on    ❌ Bolt-on   ✅ Native               │
│  Type inference       ❌ Manual     ⚠️ Limited   ✅ Automatic            │
│  Bundle size          ~149KB        ~40KB        ~12KB                    │
│  Runtime + Types      ❌ Separate   ❌ Separate  ✅ Single source        │
│  Error messages       Good          Good         Excellent                │
│  Learning curve       Medium        Medium       Easy                     │
│  Async validation     ✅            ✅           ✅                       │
│  Transforms           ✅            ✅           ✅                       │
│                                                                           │
│  VERDICT: Zod wins for TypeScript projects                               │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### Why Zod?

1. **TypeScript-First**: Built from the ground up for TypeScript
2. **Type Inference**: Define schema once, get types automatically
3. **Zero Dependencies**: Small, fast, no baggage
4. **Great DX**: Excellent error messages and IntelliSense

---

## Zod Fundamentals

### Schema Definition

```typescript
import { z } from "zod";

// Primitive types
const stringSchema = z.string();
const numberSchema = z.number();
const booleanSchema = z.boolean();
const dateSchema = z.date();

// With constraints
const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).max(100);
const ageSchema = z.number().int().positive().max(120);

// Optional and nullable
const optionalString = z.string().optional(); // string | undefined
const nullableString = z.string().nullable(); // string | null
const nullishString = z.string().nullish(); // string | null | undefined

// Default values
const roleSchema = z.string().default("user");
```

### Object Schemas

```typescript
// Basic object
const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(13).optional(),
});

// Infer TypeScript type from schema!
type User = z.infer<typeof userSchema>;
// { name: string; email: string; age?: number }

// Nested objects
const profileSchema = z.object({
  user: userSchema,
  address: z.object({
    street: z.string(),
    city: z.string(),
    country: z.string(),
  }),
});

// Partial (all fields optional)
const updateUserSchema = userSchema.partial();
// { name?: string; email?: string; age?: number }

// Pick specific fields
const loginSchema = userSchema.pick({ email: true });
// { email: string }

// Omit fields
const publicUserSchema = userSchema.omit({ email: true });
// { name: string; age?: number }
```

### Array Schemas

```typescript
// Array of strings
const tagsSchema = z.array(z.string());

// Array with constraints
const skillsSchema = z
  .array(z.string().min(1))
  .min(1, "At least one skill required")
  .max(10, "Maximum 10 skills");

// Array of objects
const jobsSchema = z.array(
  z.object({
    title: z.string(),
    company: z.string(),
    salary: z.number().optional(),
  }),
);
```

### Union and Enum Types

```typescript
// Enum (limited set of values)
const statusSchema = z.enum(["draft", "published", "archived"]);
type Status = z.infer<typeof statusSchema>; // 'draft' | 'published' | 'archived'

// Native enum support
enum JobType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  CONTRACT = "contract",
}
const jobTypeSchema = z.nativeEnum(JobType);

// Union (one of multiple types)
const idSchema = z.union([z.string(), z.number()]);
// or shorthand:
const idSchema2 = z.string().or(z.number());

// Discriminated union (tagged union)
const notificationSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("email"), email: z.string().email() }),
  z.object({ type: z.literal("sms"), phone: z.string() }),
  z.object({ type: z.literal("push"), deviceId: z.string() }),
]);
```

---

## Parse vs SafeParse

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     PARSE vs SAFEPARSE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  schema.parse(data)                schema.safeParse(data)                   │
│  ─────────────────                 ──────────────────────                   │
│                                                                             │
│  ┌─────────┐                       ┌─────────┐                              │
│  │  Input  │                       │  Input  │                              │
│  └────┬────┘                       └────┬────┘                              │
│       │                                 │                                   │
│       ▼                                 ▼                                   │
│  ┌─────────┐                       ┌─────────┐                              │
│  │ Validate│                       │ Validate│                              │
│  └────┬────┘                       └────┬────┘                              │
│       │                                 │                                   │
│  ┌────┴────┐                       ┌────┴────┐                              │
│  │         │                       │         │                              │
│  ▼         ▼                       ▼         ▼                              │
│ Valid   Invalid                   Valid   Invalid                           │
│  │         │                       │         │                              │
│  ▼         ▼                       ▼         ▼                              │
│ Return   THROWS                   Return   Return                           │
│ data     ZodError                 { success: true,  { success: false,      │
│                                     data: {...} }     error: ZodError }    │
│                                                                             │
│  USE WHEN:                         USE WHEN:                                │
│  • You want exceptions             • You want to handle errors gracefully  │
│  • In try/catch blocks             • In API validation middleware          │
│  • Fail-fast scenarios             • When you need error details           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### parse() - Throws on Error

```typescript
import { z, ZodError } from "zod";

const schema = z.object({
  email: z.string().email(),
});

try {
  const data = schema.parse({ email: "invalid" });
  console.log(data); // Never reached if invalid
} catch (error) {
  if (error instanceof ZodError) {
    console.log(error.issues);
    // [{ code: 'invalid_string', validation: 'email', path: ['email'], message: 'Invalid email' }]
  }
}
```

### safeParse() - Returns Result Object

```typescript
const result = schema.safeParse({ email: "invalid" });

if (!result.success) {
  // result.error is ZodError
  console.log(result.error.issues);
  return;
}

// result.data is typed and valid
console.log(result.data.email);
```

**Pro Tip**: Use `safeParse` for API validation—it gives you control over error responses.

---

## Custom Error Messages

```typescript
const userSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name cannot be empty")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string({ required_error: "Email is required" })
    .email("Please provide a valid email address"),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number",
    ),

  age: z
    .number({ invalid_type_error: "Age must be a number" })
    .int("Age must be a whole number")
    .min(13, "Must be at least 13 years old")
    .max(120, "Invalid age"),
});
```

### Formatting Errors for API Responses

```typescript
import { z, ZodError } from "zod";

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root";
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
}

// Usage
const result = userSchema.safeParse(req.body);
if (!result.success) {
  res.status(400).json({
    message: "Validation failed",
    errors: formatZodErrors(result.error),
  });
  // { message: 'Validation failed', errors: { email: ['Invalid email'], password: ['Too short'] } }
}
```

---

## Mini-Tutorial: Registration Form Validator

Let's build a complete registration validator for DevJobs Pro.

### Step 1: Define the Schema

```typescript
// src/schemas/auth.schema.ts
import { z } from "zod";

// Password validation regex
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

export const registerSchema = z
  .object({
    firstName: z
      .string({ required_error: "First name is required" })
      .min(1, "First name cannot be empty")
      .max(50, "First name cannot exceed 50 characters")
      .trim(),

    lastName: z
      .string({ required_error: "Last name is required" })
      .min(1, "Last name cannot be empty")
      .max(50, "Last name cannot exceed 50 characters")
      .trim(),

    email: z
      .string({ required_error: "Email is required" })
      .email("Please provide a valid email address")
      .toLowerCase()
      .trim(),

    password: z
      .string({ required_error: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password cannot exceed 100 characters")
      .regex(
        passwordRegex,
        "Password must contain uppercase, lowercase, number, and special character",
      ),

    confirmPassword: z.string({
      required_error: "Please confirm your password",
    }),

    role: z.enum(["candidate", "employer"], {
      errorMap: () => ({
        message: "Role must be either candidate or employer",
      }),
    }),

    acceptTerms: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and conditions" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Error will appear on confirmPassword field
  });

// Infer the type
export type RegisterInput = z.infer<typeof registerSchema>;
```

### Step 2: Create Validation Middleware

```typescript
// src/middleware/validate.ts
import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodSchema } from "zod";

export function validate<T extends ZodSchema>(schema: T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = formatZodErrors(result.error);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Attach validated data to request
    req.body = result.data;
    next();
  };
}

function formatZodErrors(error: ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_root";
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
}
```

### Step 3: Use in Routes

```typescript
// src/routes/auth.routes.ts
import { Router } from "express";
import { registerSchema } from "../schemas/auth.schema";
import { validate } from "../middleware/validate";
import { authController } from "../controllers/auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);

export default router;
```

### Step 4: Controller with Type Safety

```typescript
// src/controllers/auth.controller.ts
import { Request, Response } from "express";
import { RegisterInput } from "../schemas/auth.schema";

export const authController = {
  async register(req: Request, res: Response) {
    // req.body is now validated and typed as RegisterInput
    const { firstName, lastName, email, password, role } =
      req.body as RegisterInput;

    // No need to validate again—Zod already did!
    // Proceed with business logic...

    res.status(201).json({
      success: true,
      message: "Registration successful",
    });
  },
};
```

---

## Practice: DevJobs Pro Validation Schemas

Now it's your turn. Create validation schemas for DevJobs Pro.

### Task 1: Job Posting Schema

```typescript
// TODO: Create src/schemas/job.schema.ts

import { z } from "zod";

// Requirements:
// - title: required, 5-100 characters
// - company: required, 2-100 characters
// - description: required, 50-5000 characters
// - location: required string
// - type: 'full_time' | 'part_time' | 'contract' | 'internship'
// - experience: 'entry' | 'mid' | 'senior' | 'lead'
// - salary: optional object with { min: number, max: number, currency: string }
// - skills: array of strings, 1-15 items, each 1-50 characters
// - remote: boolean, defaults to false
// - applicationDeadline: optional date, must be in the future

export const createJobSchema = z.object({
  // Your implementation here
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
```

### Task 2: Application Schema

```typescript
// TODO: Create src/schemas/application.schema.ts

import { z } from "zod";

// Requirements:
// - jobId: required, valid UUID format
// - coverLetter: optional, max 2000 characters
// - resumeUrl: required, valid URL
// - portfolioUrl: optional, valid URL
// - expectedSalary: optional number, min 0
// - availableFrom: optional date
// - referralSource: optional enum ('linkedin', 'indeed', 'referral', 'company_website', 'other')

export const createApplicationSchema = z.object({
  // Your implementation here
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
```

### Task 3: Search/Filter Schema

```typescript
// TODO: Create src/schemas/search.schema.ts

import { z } from "zod";

// Requirements:
// - query: optional search string
// - type: optional array of job types
// - experience: optional array of experience levels
// - remote: optional boolean
// - salaryMin: optional number
// - salaryMax: optional number
// - location: optional string
// - page: optional number, default 1, min 1
// - limit: optional number, default 20, min 1, max 100
// - sortBy: optional enum ('createdAt', 'salary', 'title')
// - sortOrder: optional enum ('asc', 'desc'), default 'desc'

export const searchJobsSchema = z.object({
  // Your implementation here
});

export type SearchJobsInput = z.infer<typeof searchJobsSchema>;
```

<details>
<summary>💡 Solution: Job Posting Schema</summary>

```typescript
// src/schemas/job.schema.ts
import { z } from "zod";

const salarySchema = z
  .object({
    min: z.number().min(0, "Minimum salary cannot be negative"),
    max: z.number().min(0, "Maximum salary cannot be negative"),
    currency: z
      .string()
      .length(3, "Currency must be 3-letter code (e.g., USD)"),
  })
  .refine((data) => data.max >= data.min, {
    message: "Maximum salary must be greater than or equal to minimum",
    path: ["max"],
  });

export const createJobSchema = z.object({
  title: z
    .string({ required_error: "Job title is required" })
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),

  company: z
    .string({ required_error: "Company name is required" })
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name cannot exceed 100 characters")
    .trim(),

  description: z
    .string({ required_error: "Job description is required" })
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description cannot exceed 5000 characters"),

  location: z
    .string({ required_error: "Location is required" })
    .min(2, "Location must be at least 2 characters")
    .trim(),

  type: z.enum(["full_time", "part_time", "contract", "internship"], {
    errorMap: () => ({ message: "Invalid job type" }),
  }),

  experience: z.enum(["entry", "mid", "senior", "lead"], {
    errorMap: () => ({ message: "Invalid experience level" }),
  }),

  salary: salarySchema.optional(),

  skills: z
    .array(
      z
        .string()
        .min(1)
        .max(50, "Skill name cannot exceed 50 characters")
        .trim(),
    )
    .min(1, "At least one skill is required")
    .max(15, "Cannot exceed 15 skills"),

  remote: z.boolean().default(false),

  applicationDeadline: z
    .string()
    .datetime()
    .transform((str) => new Date(str))
    .refine((date) => date > new Date(), {
      message: "Application deadline must be in the future",
    })
    .optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
```

</details>

---

## Pro Tips vs Junior Traps

| Pro Tip 🎯                                                     | Junior Trap ⚠️                                 |
| -------------------------------------------------------------- | ---------------------------------------------- |
| Validate at the API boundary, trust internally                 | Validate the same data multiple times          |
| Use `z.infer<typeof schema>` for types                         | Manually define types that duplicate schemas   |
| Use `safeParse` for graceful error handling                    | Use `parse` and let errors propagate unhandled |
| Create reusable schema building blocks                         | Copy-paste similar validation logic            |
| Transform data during validation (`.trim()`, `.toLowerCase()`) | Transform after validation in multiple places  |
| Use `.partial()` for update schemas                            | Create separate schemas with optional fields   |
| Put schemas in dedicated files (`*.schema.ts`)                 | Define schemas inline in route handlers        |
| Test validation schemas with edge cases                        | Assume validation "just works"                 |

---

## 5-Minute Debugger 🐛

### Problem: "ZodError: Required" but I sent the data!

````
┌─────────────────────────────────────────────────────────────────────────────┐
│  SYMPTOM: Getting "Required" error even though data is in request           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  POSSIBLE CAUSES:                                                           │
│                                                                             │
│  1. Missing body parser middleware                                          │
│     ───────────────────────────────                                         │
│     ❌ Body is undefined                                                    │
│                                                                             │
│     FIX: Add express.json() BEFORE routes                                   │
│     ```                                                                     │
│     app.use(express.json());                                                │
│     app.use('/api', routes);                                                │
│     ```                                                                     │
│                                                                             │
│  2. Wrong Content-Type header                                               │
│     ─────────────────────────                                               │
│     ❌ Client sending form data, not JSON                                   │
│                                                                             │
│     FIX: Ensure client sends Content-Type: application/json                 │
│                                                                             │
│  3. Null vs undefined confusion                                             │
│     ─────────────────────────                                               │
│     ❌ Sending { name: null } when field is required                        │
│                                                                             │
│     FIX: Use .nullable() if null is valid, or don't send null              │
│                                                                             │
│  4. Validating wrong property                                               │
│     ─────────────────────────                                               │
│     ❌ Schema expects req.body, you're passing req.query                    │
│                                                                             │
│     FIX: Check what you're passing to safeParse                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
````

### Problem: TypeScript doesn't recognize inferred type

```typescript
// ❌ Problem
const schema = z.object({ name: z.string() });
type User = z.infer<typeof schema>;

function processUser(user: User) {
  console.log(user.email); // Error: Property 'email' does not exist
}

// ✅ Solution: The type is correct—you're accessing a field that doesn't exist!
// Check your schema definition.
```

### Problem: Nested validation errors are confusing

```typescript
// ❌ Error path is ['address', 'city'] but hard to understand
const error = result.error.issues[0];
console.log(error.path); // ['address', 'city']

// ✅ Use flatten() for cleaner error structure
const flattened = result.error.flatten();
console.log(flattened.fieldErrors);
// { 'address.city': ['City is required'] }
```

### Debug Checklist

```
□ Is express.json() middleware enabled?
□ Is the request Content-Type set to application/json?
□ Are you validating the right part of the request (body/query/params)?
□ Are null values being sent for required fields?
□ Does the schema match your expected input structure?
□ Are you using safeParse and checking result.success?
```

---

## Definition of Done ✅

Before moving to the next lesson, verify:

- [ ] **Zod installed**: `npm list zod` shows it's installed
- [ ] **Schema created**: At least one validation schema in `src/schemas/`
- [ ] **Validation middleware**: Generic `validate()` middleware function exists
- [ ] **Type inference**: Using `z.infer<typeof schema>` for TypeScript types
- [ ] **Error handling**: Validation errors return 400 with formatted messages
- [ ] **DevJobs schemas**: Created schemas for job, application, and search
- [ ] **Tests**: Edge cases tested (empty strings, wrong types, missing fields)

### Quick Validation Test

Run this to verify your setup:

```bash
# Test that validation rejects bad input
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "invalid"}'

# Should return 400 with validation errors, not 500
```

---

## What's Next?

You've learned to validate input—ensuring data has the right shape and type. But validation doesn't make data _safe_. A perfectly valid email could still contain a malicious script.

In the next lesson, we'll learn **Data Sanitization**—how to clean potentially dangerous content from user input.

---

## Navigation

| Previous                          | Current                                 | Next                                                     |
| --------------------------------- | --------------------------------------- | -------------------------------------------------------- |
| [Module 10 Overview](./README.md) | **Lesson 1: Input Validation with Zod** | [Lesson 2: Data Sanitization](./02-data-sanitization.md) |

# Lesson 02: Built-in Middleware

## 🎯 Hook: Express Comes Batteries Included

Express ships with powerful built-in middleware that handles the most common tasks: parsing JSON, handling form data, and serving static files. These aren't optional extras—they're essential for any real application.

The catch? Most developers use them incorrectly or with insecure defaults. Let's fix that.

---

## 📚 Theory: The Built-in Middleware

Express 5 includes three built-in middleware functions:

| Middleware             | Purpose                     | Common Use           |
| ---------------------- | --------------------------- | -------------------- |
| `express.json()`       | Parse JSON request bodies   | API endpoints        |
| `express.urlencoded()` | Parse URL-encoded form data | HTML forms           |
| `express.static()`     | Serve static files          | Images, CSS, uploads |

### The Body Parsing Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        REQUEST BODY PARSING FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

  Client sends POST /api/jobs
  Content-Type: application/json
  Body: {"title": "Node.js Developer", "salary": 80000}
            │
            ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                         express.json()                                   │
  │                                                                          │
  │  1. Check Content-Type header                                           │
  │     └── Is it application/json? ────► NO ───► Skip, call next()         │
  │                │                                                         │
  │               YES                                                        │
  │                │                                                         │
  │  2. Check body size                                                     │
  │     └── Is it within limit? ────────► NO ───► 413 Payload Too Large     │
  │                │                                                         │
  │               YES                                                        │
  │                │                                                         │
  │  3. Parse JSON                                                          │
  │     └── Valid JSON? ────────────────► NO ───► 400 Bad Request           │
  │                │                                                         │
  │               YES                                                        │
  │                │                                                         │
  │  4. Attach to req.body                                                  │
  │     req.body = { title: "Node.js Developer", salary: 80000 }            │
  │                │                                                         │
  │                ▼                                                         │
  │            next()                                                        │
  └─────────────────────────────────────────────────────────────────────────┘
            │
            ▼
      Route Handler
      req.body.title ──► "Node.js Developer"
```

---

## 💻 Code Examples

### Example 1: express.json() - Parse JSON Bodies

```typescript
import express from "express";

const app = express();

// Basic usage
app.use(express.json());

// With options (recommended for production)
app.use(
  express.json({
    limit: "10kb", // Maximum body size (default: '100kb')
    strict: true, // Only accept arrays and objects (default: true)
    type: "application/json", // Content-Type to parse (default: 'application/json')
  }),
);

// Route that uses parsed body
app.post("/api/jobs", (req, res) => {
  console.log(req.body); // { title: 'Node.js Developer', ... }
  res.status(201).json({ success: true, data: req.body });
});
```

**Options Explained:**

| Option   | Default              | Description                                                    |
| -------- | -------------------- | -------------------------------------------------------------- |
| `limit`  | `'100kb'`            | Maximum body size. Use small values to prevent DoS attacks     |
| `strict` | `true`               | Only parse objects and arrays. Set `false` to parse primitives |
| `type`   | `'application/json'` | Content-Type(s) to parse                                       |
| `verify` | `undefined`          | Function to verify body before parsing                         |

### Example 2: express.urlencoded() - Parse Form Data

```typescript
// HTML form submission
// <form method="POST" action="/api/contact">
//   <input name="name" value="John">
//   <input name="email" value="john@example.com">
// </form>

// Sends: name=John&email=john@example.com

app.use(
  express.urlencoded({
    extended: true, // Use qs library for rich objects (recommended)
    limit: "10kb", // Maximum body size
    parameterLimit: 1000, // Maximum number of parameters
  }),
);

app.post("/api/contact", (req, res) => {
  console.log(req.body); // { name: 'John', email: 'john@example.com' }
  res.json({ received: req.body });
});
```

**The `extended` Option:**

```typescript
// extended: false (querystring library)
// Only parses flat key-value pairs
// user[name]=John  →  { 'user[name]': 'John' }

// extended: true (qs library) - RECOMMENDED
// Parses nested objects and arrays
// user[name]=John  →  { user: { name: 'John' } }
// colors[]=red&colors[]=blue  →  { colors: ['red', 'blue'] }
```

### Example 3: express.static() - Serve Static Files

```typescript
import path from "path";

// Serve files from 'public' directory
app.use(express.static("public"));
// GET /style.css → serves public/style.css

// Serve with virtual path prefix
app.use("/static", express.static("public"));
// GET /static/style.css → serves public/style.css

// Serve with absolute path (recommended)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// With options
app.use(
  "/assets",
  express.static("public", {
    maxAge: "1d", // Cache for 1 day
    etag: true, // Enable ETags for caching
    lastModified: true, // Send Last-Modified header
    index: false, // Disable directory index (default: 'index.html')
    dotfiles: "ignore", // Ignore dotfiles (.gitignore, etc.)
    fallthrough: true, // Continue to next middleware if file not found
  }),
);
```

**Static File Directory Structure:**

```
project/
├── public/              ← Static files
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── images/
│       └── logo.png
├── uploads/             ← User uploaded files
│   └── resumes/
│       └── resume-123.pdf
└── src/
    └── app.ts
```

### Example 4: Verify Function for Security

```typescript
// Save raw body for webhook signature verification
app.use(
  express.json({
    limit: "10kb",
    verify: (req, res, buf, encoding) => {
      // 'buf' is the raw Buffer before parsing
      // Store it for signature verification (webhooks, etc.)
      (req as any).rawBody = buf.toString(
        (encoding as BufferEncoding) || "utf8",
      );
    },
  }),
);

// Stripe webhook example
app.post("/webhooks/stripe", (req, res) => {
  const signature = req.headers["stripe-signature"];
  const rawBody = (req as any).rawBody;

  // Verify webhook signature using raw body
  // stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
});
```

---

## 🛠️ Mini-Tutorial: Configure Built-in Middleware Properly

Set up all built-in middleware with production-ready options:

```typescript
// src/app.ts
import express, { Request, Response, NextFunction } from "express";
import path from "path";

const app = express();

// ═══════════════════════════════════════════════════════════════
// BODY PARSING MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

// Parse JSON bodies
// - 10kb limit prevents large payload attacks
// - Only accepts objects and arrays (strict: true)
app.use(
  express.json({
    limit: "10kb",
    strict: true,
  }),
);

// Parse URL-encoded bodies (form submissions)
// - extended: true allows nested objects
// - Same 10kb limit for consistency
app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
    parameterLimit: 1000,
  }),
);

// ═══════════════════════════════════════════════════════════════
// STATIC FILES MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

// Public static files (CSS, JS, images for frontend)
app.use(
  express.static(path.join(__dirname, "../public"), {
    maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
    etag: true,
    lastModified: true,
    index: false, // Don't serve index.html automatically
    dotfiles: "ignore",
  }),
);

// User uploads (resumes, company logos)
// Served from /uploads path
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    maxAge: "7d", // Uploads cached for a week
    etag: true,
    // Security: Don't allow listing directory contents
    index: false,
    // Additional security headers would be added via helmet
  }),
);

// ═══════════════════════════════════════════════════════════════
// TEST ROUTES
// ═══════════════════════════════════════════════════════════════

// Test JSON parsing
app.post("/api/test/json", (req: Request, res: Response) => {
  res.json({
    message: "JSON body received",
    body: req.body,
    contentType: req.get("Content-Type"),
  });
});

// Test URL-encoded parsing
app.post("/api/test/form", (req: Request, res: Response) => {
  res.json({
    message: "Form body received",
    body: req.body,
    contentType: req.get("Content-Type"),
  });
});

// Test static files
app.get("/api/test/uploads", (req: Request, res: Response) => {
  res.json({
    message: "Upload a file and access it at /uploads/<filename>",
    uploadPath: path.join(__dirname, "../uploads"),
  });
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING FOR BODY PARSING
// ═══════════════════════════════════════════════════════════════

// Handle body parsing errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Check if it's a body parsing error
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      error: "Invalid JSON in request body",
    });
    return;
  }

  // Check for payload too large
  if (err.message === "request entity too large") {
    res.status(413).json({
      success: false,
      error: "Request body too large. Maximum size is 10kb.",
    });
    return;
  }

  next(err);
});

export default app;
```

**Directory Setup Script:**

```bash
# Create static file directories
mkdir -p public/css public/js public/images
mkdir -p uploads/resumes uploads/logos

# Create sample files
echo "body { font-family: sans-serif; }" > public/css/style.css
echo "console.log('DevJobs Pro');" > public/js/app.js
```

---

## 🎯 Practice: Configure DevJobs Pro Built-in Middleware

Create this configuration for DevJobs Pro:

```typescript
// src/config/middleware.ts
import express, { Express } from "express";
import path from "path";

export const configureBuiltInMiddleware = (app: Express): void => {
  // JSON parsing with appropriate limits
  app.use(
    express.json({
      limit: "10kb", // Sufficient for job listings, applications
      strict: true,
    }),
  );

  // Form data (for potential HTML form submissions)
  app.use(
    express.urlencoded({
      extended: true,
      limit: "10kb",
    }),
  );

  // Resume uploads - larger limit, longer cache
  app.use(
    "/uploads/resumes",
    express.static(path.join(process.cwd(), "uploads/resumes"), {
      maxAge: "7d",
      etag: true,
      // Set Content-Disposition to trigger download
      setHeaders: (res, filePath) => {
        res.setHeader("Content-Disposition", "attachment");
      },
    }),
  );

  // Company logos - standard image serving
  app.use(
    "/uploads/logos",
    express.static(path.join(process.cwd(), "uploads/logos"), {
      maxAge: "30d", // Logos don't change often
      etag: true,
    }),
  );

  // Public assets
  app.use(
    "/public",
    express.static(path.join(process.cwd(), "public"), {
      maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
      etag: true,
    }),
  );
};

// Usage in app.ts
// import { configureBuiltInMiddleware } from './config/middleware';
// configureBuiltInMiddleware(app);
```

---

## 💡 Pro Tips

### 1. Set Body Size Limits for Security

```typescript
// ❌ DANGEROUS: No limit (default 100kb might still be too large)
app.use(express.json());

// ✅ SECURE: Explicit small limit
app.use(express.json({ limit: "10kb" }));

// For file upload endpoints, use separate middleware
import multer from "multer";
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
app.post("/api/upload", upload.single("resume"), handler);
```

### 2. Use Different Limits for Different Routes

```typescript
// Small limit for most routes
app.use("/api", express.json({ limit: "10kb" }));

// Larger limit for specific endpoints that need it
app.use("/api/import", express.json({ limit: "1mb" }));
```

### 3. Static Files Should Have Cache Headers

```typescript
// Development: No caching (see changes immediately)
app.use(
  express.static("public", {
    maxAge: 0,
  }),
);

// Production: Cache aggressively
app.use(
  express.static("public", {
    maxAge: "1y",
    immutable: true, // For files with hash in name
  }),
);
```

### 4. Serve Static Files Before API Routes

```typescript
// ✅ CORRECT ORDER: Static files first (no need to hit route handler)
app.use(express.static("public"));
app.use("/api", apiRoutes);

// This means GET /style.css is handled quickly by static middleware
// without going through all API middleware
```

---

## 🐛 5-Minute Debugger

### Problem 1: "req.body is undefined"

**Symptom:** `req.body` is always `undefined` or `{}`.

**Causes & Fixes:**

```typescript
// Cause 1: Middleware not applied
// ❌ Missing express.json()
app.post("/api/jobs", (req, res) => {
  console.log(req.body); // undefined
});

// ✅ Fix: Add middleware BEFORE routes
app.use(express.json());
app.post("/api/jobs", (req, res) => {
  console.log(req.body); // { ... }
});

// ───────────────────────────────────────────────────

// Cause 2: Wrong Content-Type header
// Client sending: Content-Type: text/plain

// ✅ Fix: Client must send correct header
// Content-Type: application/json

// ───────────────────────────────────────────────────

// Cause 3: Middleware applied after route
// ❌ Wrong order
app.post("/api/jobs", handler);
app.use(express.json()); // Too late!

// ✅ Fix: Middleware before routes
app.use(express.json());
app.post("/api/jobs", handler);
```

### Problem 2: "PayloadTooLargeError" or "413 Request Entity Too Large"

**Symptom:** Large requests fail with 413 error.

```typescript
// Cause: Body exceeds limit
app.use(express.json({ limit: "10kb" }));
// Client sends 50kb body → 413 error

// Fix 1: Increase limit if needed (be careful!)
app.use(express.json({ limit: "100kb" }));

// Fix 2: Different limits for different routes
const smallBody = express.json({ limit: "10kb" });
const largeBody = express.json({ limit: "1mb" });

app.use("/api", smallBody);
app.use("/api/import", largeBody);
```

### Problem 3: "Static Files Not Serving"

```typescript
// Cause 1: Wrong path
app.use(express.static("public")); // Relative path
// Current working directory might not be what you expect

// ✅ Fix: Use absolute path
import path from "path";
app.use(express.static(path.join(__dirname, "../public")));

// ───────────────────────────────────────────────────

// Cause 2: File doesn't exist
// GET /style.css → 404
// Check: Does public/style.css actually exist?

// ───────────────────────────────────────────────────

// Cause 3: Route handler matches first
app.get("/:file", (req, res) => {
  res.send("Route handler!");
});
app.use(express.static("public")); // Never reached!

// ✅ Fix: Static middleware before catch-all routes
app.use(express.static("public"));
app.get("/:file", handler);
```

### Problem 4: "SyntaxError: Unexpected token"

**Symptom:** JSON parsing fails.

```typescript
// Client sends invalid JSON: { title: 'Job' } (single quotes)
// Valid JSON requires double quotes: { "title": "Job" }

// Handle gracefully:
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({
      success: false,
      error: "Invalid JSON format",
      hint: "Ensure you're sending valid JSON with double quotes",
    });
    return;
  }
  next(err);
});
```

---

## 📋 Definition of Done

By the end of this lesson, you should be able to:

- [ ] Configure `express.json()` with appropriate limits
- [ ] Understand the difference between `extended: true` and `extended: false`
- [ ] Serve static files with proper caching headers
- [ ] Debug "req.body undefined" issues
- [ ] Handle body parsing errors gracefully
- [ ] Set up different limits for different routes

---

## 🔗 Navigation

| Previous                                                                 | Up                                   | Next                                                       |
| ------------------------------------------------------------------------ | ------------------------------------ | ---------------------------------------------------------- |
| [← Middleware Concept & Lifecycle](./01-middleware-concept-lifecycle.md) | [Module 05: Middleware](./README.md) | [Third-Party Middleware →](./03-third-party-middleware.md) |

---

## 📚 Further Reading

- [express.json() Documentation](https://expressjs.com/en/api.html#express.json)
- [express.urlencoded() Documentation](https://expressjs.com/en/api.html#express.urlencoded)
- [express.static() Documentation](https://expressjs.com/en/api.html#express.static)
- [body-parser Security Notes](https://github.com/expressjs/body-parser#security)

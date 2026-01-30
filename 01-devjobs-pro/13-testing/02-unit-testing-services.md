# Lesson 2: Unit Testing Services

## 🎯 Hook: Test Your Business Logic in Isolation

**Your service layer is the heart of your application.** It contains the business rules, the logic that makes your app valuable. When that logic breaks, everything breaks.

Unit tests let you verify each piece of business logic in complete isolation—no database, no network, no external services. Just your code and your assertions.

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIT TEST ISOLATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Real Application             │    Unit Test Environment       │
│   ─────────────────            │    ─────────────────────       │
│                                │                                │
│   ┌─────────┐                  │    ┌─────────┐                 │
│   │ Service │                  │    │ Service │  ← What we test │
│   └────┬────┘                  │    └────┬────┘                 │
│        │                       │         │                      │
│   ┌────┴────┐                  │    ┌────┴────┐                 │
│   │Database │ Real             │    │  MOCK   │  Controlled     │
│   │  API    │ Dependencies     │    │  MOCK   │  Mocks          │
│   │ Email   │                  │    │  MOCK   │                 │
│   └─────────┘                  │    └─────────┘                 │
│                                │                                │
│   Slow, Unpredictable          │    Fast, Predictable           │
│   Hard to set up               │    Easy to set up              │
│   Tests real integration       │    Tests business logic        │
│                                │                                │
└─────────────────────────────────────────────────────────────────┘
```

**Why isolation matters:**

- **Speed**: Unit tests run in milliseconds
- **Reliability**: No flaky tests from network issues
- **Focus**: Test one thing at a time
- **Debugging**: When a test fails, you know exactly what broke

---

## 📚 Theory: Unit Testing Principles

### What Makes a Good Unit Test?

```
┌─────────────────────────────────────────────────────────────────┐
│                  THE F.I.R.S.T PRINCIPLES                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  F - FAST                                                       │
│      Unit tests should run in milliseconds                      │
│      If tests are slow, developers won't run them               │
│                                                                 │
│  I - INDEPENDENT                                                │
│      Tests shouldn't depend on each other                       │
│      Tests can run in any order                                 │
│                                                                 │
│  R - REPEATABLE                                                 │
│      Same result every time, on any machine                     │
│      No random, no time-dependent, no network                   │
│                                                                 │
│  S - SELF-VALIDATING                                            │
│      Pass or fail, no manual checking                           │
│      Clear assertions that tell you what broke                  │
│                                                                 │
│  T - TIMELY                                                     │
│      Written at the right time (before or with code)            │
│      Not as an afterthought                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Testing Pure Functions vs Functions with Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│           PURE FUNCTIONS vs FUNCTIONS WITH DEPENDENCIES         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   PURE FUNCTIONS (Easy to Test)                                 │
│   ─────────────────────────────                                 │
│   • Same input always gives same output                         │
│   • No side effects                                             │
│   • No external dependencies                                    │
│                                                                 │
│   Input ──────► Function ──────► Output                         │
│        (deterministic transformation)                           │
│                                                                 │
│   Example: calculateTax(100) → always 10                        │
│                                                                 │
│   ─────────────────────────────────────────────────────────     │
│                                                                 │
│   FUNCTIONS WITH DEPENDENCIES (Need Mocking)                    │
│   ──────────────────────────────────────────                    │
│   • Depend on external services                                 │
│   • Have side effects                                           │
│   • Need database, APIs, file system                            │
│                                                                 │
│   Input ──► Function ──► Output                                 │
│                 │                                               │
│                 ├──► Database (mock this)                       │
│                 ├──► Email API (mock this)                      │
│                 └──► Logger (mock this)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Mocking with Vitest

Vitest provides powerful mocking utilities:

| Function                  | Purpose                                     |
| ------------------------- | ------------------------------------------- |
| `vi.fn()`                 | Create a mock function                      |
| `vi.mock('module')`       | Mock an entire module                       |
| `vi.spyOn(obj, 'method')` | Spy on (and optionally mock) object methods |
| `vi.mocked(fn)`           | Get typed mock for TypeScript               |
| `.mockReturnValue(val)`   | Mock return value                           |
| `.mockResolvedValue(val)` | Mock async return value                     |
| `.mockRejectedValue(err)` | Mock async rejection                        |
| `.mockImplementation(fn)` | Custom mock implementation                  |

---

## 💻 Code Examples

### Testing Pure Utility Functions

**JavaScript:**

```javascript
// src/utils/validation.js
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isStrongPassword(password) {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasMinLength && hasUppercase && hasLowercase && hasNumber;
}

export function sanitizeJobTitle(title) {
  return title.trim().replace(/\s+/g, " ").replace(/[<>]/g, "");
}

export function calculateSalaryRange(min, max) {
  if (min > max) {
    throw new Error("Minimum salary cannot exceed maximum");
  }
  const mid = Math.round((min + max) / 2);
  return { min, max, mid, range: max - min };
}
```

```javascript
// tests/unit/utils/validation.test.js
import { describe, it, expect } from "vitest";
import {
  isValidEmail,
  isStrongPassword,
  sanitizeJobTitle,
  calculateSalaryRange,
} from "@/utils/validation";

describe("Validation Utilities", () => {
  describe("isValidEmail", () => {
    it("should accept valid emails", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
      expect(isValidEmail("user+tag@example.org")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("no@domain")).toBe(false);
      expect(isValidEmail("@nodomain.com")).toBe(false);
      expect(isValidEmail("spaces not@allowed.com")).toBe(false);
    });
  });

  describe("isStrongPassword", () => {
    it("should accept strong passwords", () => {
      expect(isStrongPassword("SecurePass1")).toBe(true);
      expect(isStrongPassword("MyP@ssw0rd")).toBe(true);
    });

    it("should reject weak passwords", () => {
      // Too short
      expect(isStrongPassword("Short1")).toBe(false);
      // No uppercase
      expect(isStrongPassword("lowercase1")).toBe(false);
      // No lowercase
      expect(isStrongPassword("UPPERCASE1")).toBe(false);
      // No number
      expect(isStrongPassword("NoNumbers")).toBe(false);
    });
  });

  describe("sanitizeJobTitle", () => {
    it("should trim whitespace", () => {
      expect(sanitizeJobTitle("  Developer  ")).toBe("Developer");
    });

    it("should collapse multiple spaces", () => {
      expect(sanitizeJobTitle("Senior   Software   Engineer")).toBe(
        "Senior Software Engineer",
      );
    });

    it("should remove dangerous characters", () => {
      expect(sanitizeJobTitle("Developer<script>")).toBe("Developerscript");
    });
  });

  describe("calculateSalaryRange", () => {
    it("should calculate salary range correctly", () => {
      const result = calculateSalaryRange(50000, 80000);

      expect(result.min).toBe(50000);
      expect(result.max).toBe(80000);
      expect(result.mid).toBe(65000);
      expect(result.range).toBe(30000);
    });

    it("should throw when min exceeds max", () => {
      expect(() => calculateSalaryRange(100000, 50000)).toThrow(
        "Minimum salary cannot exceed maximum",
      );
    });
  });
});
```

**TypeScript:**

```typescript
// src/utils/validation.ts
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isStrongPassword(password: string): boolean {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);

  return hasMinLength && hasUppercase && hasLowercase && hasNumber;
}

export function sanitizeJobTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ").replace(/[<>]/g, "");
}

export interface SalaryRange {
  min: number;
  max: number;
  mid: number;
  range: number;
}

export function calculateSalaryRange(min: number, max: number): SalaryRange {
  if (min > max) {
    throw new Error("Minimum salary cannot exceed maximum");
  }
  const mid = Math.round((min + max) / 2);
  return { min, max, mid, range: max - min };
}
```

```typescript
// tests/unit/utils/validation.test.ts
import { describe, it, expect } from "vitest";
import {
  isValidEmail,
  isStrongPassword,
  sanitizeJobTitle,
  calculateSalaryRange,
} from "@/utils/validation";

describe("Validation Utilities", () => {
  describe("isValidEmail", () => {
    it("should accept valid emails", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("user.name@domain.co.uk")).toBe(true);
      expect(isValidEmail("user+tag@example.org")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(isValidEmail("")).toBe(false);
      expect(isValidEmail("invalid")).toBe(false);
      expect(isValidEmail("no@domain")).toBe(false);
      expect(isValidEmail("@nodomain.com")).toBe(false);
      expect(isValidEmail("spaces not@allowed.com")).toBe(false);
    });
  });

  describe("isStrongPassword", () => {
    it("should accept strong passwords", () => {
      expect(isStrongPassword("SecurePass1")).toBe(true);
      expect(isStrongPassword("MyP@ssw0rd")).toBe(true);
    });

    it("should reject weak passwords", () => {
      expect(isStrongPassword("Short1")).toBe(false);
      expect(isStrongPassword("lowercase1")).toBe(false);
      expect(isStrongPassword("UPPERCASE1")).toBe(false);
      expect(isStrongPassword("NoNumbers")).toBe(false);
    });
  });

  describe("sanitizeJobTitle", () => {
    it("should trim whitespace", () => {
      expect(sanitizeJobTitle("  Developer  ")).toBe("Developer");
    });

    it("should collapse multiple spaces", () => {
      expect(sanitizeJobTitle("Senior   Software   Engineer")).toBe(
        "Senior Software Engineer",
      );
    });

    it("should remove dangerous characters", () => {
      expect(sanitizeJobTitle("Developer<script>")).toBe("Developerscript");
    });
  });

  describe("calculateSalaryRange", () => {
    it("should calculate salary range correctly", () => {
      const result = calculateSalaryRange(50000, 80000);

      expect(result.min).toBe(50000);
      expect(result.max).toBe(80000);
      expect(result.mid).toBe(65000);
      expect(result.range).toBe(30000);
    });

    it("should throw when min exceeds max", () => {
      expect(() => calculateSalaryRange(100000, 50000)).toThrow(
        "Minimum salary cannot exceed maximum",
      );
    });
  });
});
```

### Mocking Database Calls

**JavaScript:**

```javascript
// src/services/user.service.js
import { db } from "@/db";
import bcrypt from "bcrypt";

export const userService = {
  async findById(id) {
    const user = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    return user.rows[0] || null;
  },

  async findByEmail(email) {
    const user = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return user.rows[0] || null;
  },

  async create(userData) {
    const { email, password, name } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *",
      [email, hashedPassword, name],
    );

    return result.rows[0];
  },

  async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  },
};
```

```javascript
// tests/unit/services/user.service.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { userService } from "@/services/user.service";
import { db } from "@/db";
import bcrypt from "bcrypt";

// Mock the database module
vi.mock("@/db", () => ({
  db: {
    query: vi.fn(),
  },
}));

// Mock bcrypt for predictable tests
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      // Arrange
      const mockUser = { id: "123", email: "test@example.com", name: "John" };
      db.query.mockResolvedValue({ rows: [mockUser] });

      // Act
      const result = await userService.findById("123");

      // Assert
      expect(result).toEqual(mockUser);
      expect(db.query).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = $1",
        ["123"],
      );
    });

    it("should return null when user not found", async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await userService.findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create user with hashed password", async () => {
      // Arrange
      const userData = {
        email: "new@example.com",
        password: "SecurePass1",
        name: "New User",
      };
      const hashedPassword = "hashed_password_xyz";
      const createdUser = { id: "456", ...userData, password: hashedPassword };

      bcrypt.hash.mockResolvedValue(hashedPassword);
      db.query.mockResolvedValue({ rows: [createdUser] });

      // Act
      const result = await userService.create(userData);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith("SecurePass1", 10);
      expect(db.query).toHaveBeenCalledWith(
        "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *",
        ["new@example.com", hashedPassword, "New User"],
      );
      expect(result).toEqual(createdUser);
    });
  });

  describe("verifyPassword", () => {
    it("should return true for correct password", async () => {
      const user = { password: "hashed_password" };
      bcrypt.compare.mockResolvedValue(true);

      const result = await userService.verifyPassword(user, "correctpassword");

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "correctpassword",
        "hashed_password",
      );
    });

    it("should return false for incorrect password", async () => {
      const user = { password: "hashed_password" };
      bcrypt.compare.mockResolvedValue(false);

      const result = await userService.verifyPassword(user, "wrongpassword");

      expect(result).toBe(false);
    });
  });
});
```

**TypeScript:**

```typescript
// src/services/user.service.ts
import { db } from "@/db";
import bcrypt from "bcrypt";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "candidate" | "employer" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: User["role"];
}

export const userService = {
  async findById(id: string): Promise<User | null> {
    const result = await db.query<User>("SELECT * FROM users WHERE id = $1", [
      id,
    ]);
    return result.rows[0] || null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const result = await db.query<User>(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    return result.rows[0] || null;
  },

  async create(userData: CreateUserInput): Promise<User> {
    const { email, password, name, role = "candidate" } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query<User>(
      "INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [email, hashedPassword, name, role],
    );

    return result.rows[0];
  },

  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  },
};
```

```typescript
// tests/unit/services/user.service.test.ts
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { userService, User } from "@/services/user.service";
import { db } from "@/db";
import bcrypt from "bcrypt";

// Mock the database module
vi.mock("@/db", () => ({
  db: {
    query: vi.fn(),
  },
}));

// Mock bcrypt for predictable tests
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

// Get typed mocks
const mockDbQuery = db.query as Mock;
const mockBcryptHash = bcrypt.hash as Mock;
const mockBcryptCompare = bcrypt.compare as Mock;

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      // Arrange
      const mockUser: Partial<User> = {
        id: "123",
        email: "test@example.com",
        name: "John",
      };
      mockDbQuery.mockResolvedValue({ rows: [mockUser] });

      // Act
      const result = await userService.findById("123");

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockDbQuery).toHaveBeenCalledWith(
        "SELECT * FROM users WHERE id = $1",
        ["123"],
      );
    });

    it("should return null when user not found", async () => {
      mockDbQuery.mockResolvedValue({ rows: [] });

      const result = await userService.findById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create user with hashed password", async () => {
      // Arrange
      const userData = {
        email: "new@example.com",
        password: "SecurePass1",
        name: "New User",
      };
      const hashedPassword = "hashed_password_xyz";
      const createdUser = {
        id: "456",
        ...userData,
        password: hashedPassword,
        role: "candidate" as const,
      };

      mockBcryptHash.mockResolvedValue(hashedPassword);
      mockDbQuery.mockResolvedValue({ rows: [createdUser] });

      // Act
      const result = await userService.create(userData);

      // Assert
      expect(mockBcryptHash).toHaveBeenCalledWith("SecurePass1", 10);
      expect(mockDbQuery).toHaveBeenCalledWith(
        "INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING *",
        ["new@example.com", hashedPassword, "New User", "candidate"],
      );
      expect(result).toEqual(createdUser);
    });
  });

  describe("verifyPassword", () => {
    it("should return true for correct password", async () => {
      const user = { password: "hashed_password" } as User;
      mockBcryptCompare.mockResolvedValue(true);

      const result = await userService.verifyPassword(user, "correctpassword");

      expect(result).toBe(true);
      expect(mockBcryptCompare).toHaveBeenCalledWith(
        "correctpassword",
        "hashed_password",
      );
    });

    it("should return false for incorrect password", async () => {
      const user = { password: "hashed_password" } as User;
      mockBcryptCompare.mockResolvedValue(false);

      const result = await userService.verifyPassword(user, "wrongpassword");

      expect(result).toBe(false);
    });
  });
});
```

### Mocking External Services

**JavaScript:**

```javascript
// src/services/email.service.js
import nodemailer from "nodemailer";
import { config } from "@/config";

export const emailService = {
  transporter: null,

  initialize() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  },

  async sendWelcomeEmail(user) {
    const html = this.renderTemplate("welcome", { name: user.name });

    return this.transporter.sendMail({
      from: config.email.from,
      to: user.email,
      subject: "Welcome to DevJobs Pro!",
      html,
    });
  },

  async sendApplicationNotification(job, applicant) {
    const html = this.renderTemplate("application", {
      jobTitle: job.title,
      applicantName: applicant.name,
    });

    return this.transporter.sendMail({
      from: config.email.from,
      to: job.employer.email,
      subject: `New Application: ${job.title}`,
      html,
    });
  },

  renderTemplate(templateName, data) {
    // Simple template rendering
    const templates = {
      welcome: `<h1>Welcome, ${data.name}!</h1><p>Thanks for joining DevJobs Pro.</p>`,
      application: `<h1>New Application!</h1><p>${data.applicantName} applied for ${data.jobTitle}</p>`,
    };
    return templates[templateName] || "";
  },
};
```

```javascript
// tests/unit/services/email.service.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { emailService } from "@/services/email.service";

describe("EmailService", () => {
  let mockSendMail;

  beforeEach(() => {
    // Create mock sendMail function
    mockSendMail = vi.fn().mockResolvedValue({ messageId: "123" });

    // Mock the transporter
    emailService.transporter = {
      sendMail: mockSendMail,
    };

    vi.clearAllMocks();
  });

  describe("renderTemplate", () => {
    it("should render welcome template with user name", () => {
      const html = emailService.renderTemplate("welcome", { name: "John" });

      expect(html).toContain("Welcome, John!");
      expect(html).toContain("Thanks for joining DevJobs Pro");
    });

    it("should render application template", () => {
      const html = emailService.renderTemplate("application", {
        jobTitle: "Senior Developer",
        applicantName: "Jane Doe",
      });

      expect(html).toContain("Jane Doe");
      expect(html).toContain("Senior Developer");
    });

    it("should return empty string for unknown template", () => {
      const html = emailService.renderTemplate("unknown", {});
      expect(html).toBe("");
    });
  });

  describe("sendWelcomeEmail", () => {
    it("should send welcome email to new user", async () => {
      const user = { email: "john@example.com", name: "John" };

      await emailService.sendWelcomeEmail(user);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
          subject: "Welcome to DevJobs Pro!",
          html: expect.stringContaining("Welcome, John!"),
        }),
      );
    });
  });

  describe("sendApplicationNotification", () => {
    it("should notify employer of new application", async () => {
      const job = {
        title: "Full Stack Developer",
        employer: { email: "hr@company.com" },
      };
      const applicant = { name: "Jane Doe" };

      await emailService.sendApplicationNotification(job, applicant);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "hr@company.com",
          subject: "New Application: Full Stack Developer",
        }),
      );
    });
  });
});
```

**TypeScript:**

```typescript
// src/services/email.service.ts
import nodemailer, { Transporter } from "nodemailer";
import { config } from "@/config";

interface User {
  email: string;
  name: string;
}

interface Job {
  title: string;
  employer: {
    email: string;
  };
}

interface Applicant {
  name: string;
}

type TemplateData = {
  name?: string;
  jobTitle?: string;
  applicantName?: string;
};

export const emailService = {
  transporter: null as Transporter | null,

  initialize(): void {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  },

  async sendWelcomeEmail(user: User): Promise<void> {
    const html = this.renderTemplate("welcome", { name: user.name });

    await this.transporter!.sendMail({
      from: config.email.from,
      to: user.email,
      subject: "Welcome to DevJobs Pro!",
      html,
    });
  },

  async sendApplicationNotification(
    job: Job,
    applicant: Applicant,
  ): Promise<void> {
    const html = this.renderTemplate("application", {
      jobTitle: job.title,
      applicantName: applicant.name,
    });

    await this.transporter!.sendMail({
      from: config.email.from,
      to: job.employer.email,
      subject: `New Application: ${job.title}`,
      html,
    });
  },

  renderTemplate(templateName: string, data: TemplateData): string {
    const templates: Record<string, string> = {
      welcome: `<h1>Welcome, ${data.name}!</h1><p>Thanks for joining DevJobs Pro.</p>`,
      application: `<h1>New Application!</h1><p>${data.applicantName} applied for ${data.jobTitle}</p>`,
    };
    return templates[templateName] || "";
  },
};
```

```typescript
// tests/unit/services/email.service.test.ts
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { emailService } from "@/services/email.service";

describe("EmailService", () => {
  let mockSendMail: Mock;

  beforeEach(() => {
    // Create mock sendMail function
    mockSendMail = vi.fn().mockResolvedValue({ messageId: "123" });

    // Mock the transporter
    emailService.transporter = {
      sendMail: mockSendMail,
    } as any;

    vi.clearAllMocks();
  });

  describe("renderTemplate", () => {
    it("should render welcome template with user name", () => {
      const html = emailService.renderTemplate("welcome", { name: "John" });

      expect(html).toContain("Welcome, John!");
      expect(html).toContain("Thanks for joining DevJobs Pro");
    });

    it("should render application template", () => {
      const html = emailService.renderTemplate("application", {
        jobTitle: "Senior Developer",
        applicantName: "Jane Doe",
      });

      expect(html).toContain("Jane Doe");
      expect(html).toContain("Senior Developer");
    });

    it("should return empty string for unknown template", () => {
      const html = emailService.renderTemplate("unknown", {});
      expect(html).toBe("");
    });
  });

  describe("sendWelcomeEmail", () => {
    it("should send welcome email to new user", async () => {
      const user = { email: "john@example.com", name: "John" };

      await emailService.sendWelcomeEmail(user);

      expect(mockSendMail).toHaveBeenCalledTimes(1);
      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "john@example.com",
          subject: "Welcome to DevJobs Pro!",
          html: expect.stringContaining("Welcome, John!"),
        }),
      );
    });
  });

  describe("sendApplicationNotification", () => {
    it("should notify employer of new application", async () => {
      const job = {
        title: "Full Stack Developer",
        employer: { email: "hr@company.com" },
      };
      const applicant = { name: "Jane Doe" };

      await emailService.sendApplicationNotification(job, applicant);

      expect(mockSendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "hr@company.com",
          subject: "New Application: Full Stack Developer",
        }),
      );
    });
  });
});
```

### Test Data Factories

**TypeScript:**

```typescript
// tests/factories/job.factory.ts
import { vi } from "vitest";

export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  salaryMin: number;
  salaryMax: number;
  requirements: string[];
  employerId: string;
  status: "draft" | "published" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

type JobInput = Partial<Job>;

let jobIdCounter = 1;

export function createJob(overrides: JobInput = {}): Job {
  const id = overrides.id || `job_${jobIdCounter++}`;

  return {
    id,
    title: "Senior Software Engineer",
    description: "We are looking for an experienced developer...",
    company: "Tech Corp",
    location: "San Francisco, CA",
    type: "full-time",
    salaryMin: 100000,
    salaryMax: 150000,
    requirements: ["5+ years experience", "TypeScript", "Node.js"],
    employerId: "employer_1",
    status: "published",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createRemoteJob(overrides: JobInput = {}): Job {
  return createJob({
    type: "remote",
    location: "Remote",
    ...overrides,
  });
}

export function createDraftJob(overrides: JobInput = {}): Job {
  return createJob({
    status: "draft",
    ...overrides,
  });
}

export function createJobWithSalary(min: number, max: number): Job {
  return createJob({
    salaryMin: min,
    salaryMax: max,
  });
}

export function resetJobFactory(): void {
  jobIdCounter = 1;
}
```

---

## 🎓 Mini-Tutorial: Test a User Service with Mocked Database

Let's build a complete test suite for an auth service.

**JavaScript (src/services/auth.service.js):**

```javascript
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "@/db";
import { config } from "@/config";

export class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthenticationError";
    this.statusCode = 401;
  }
}

export const authService = {
  async register(email, password, name) {
    // Check if user exists
    const existing = await db.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      throw new AuthenticationError("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await db.query(
      "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name",
      [email, hashedPassword, name],
    );

    return result.rows[0];
  },

  async login(email, password) {
    // Find user
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new AuthenticationError("Invalid credentials");
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: { id: user.id, email: user.email, name: user.name },
      accessToken,
      refreshToken,
    };
  },

  generateAccessToken(user) {
    return jwt.sign({ userId: user.id, email: user.email }, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiresIn,
    });
  },

  generateRefreshToken(user) {
    return jwt.sign({ userId: user.id }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  },

  verifyAccessToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new AuthenticationError("Invalid or expired token");
    }
  },
};
```

**Test File (tests/unit/services/auth.service.test.js):**

```javascript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService, AuthenticationError } from "@/services/auth.service";
import { db } from "@/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "@/config";

// Mock dependencies
vi.mock("@/db", () => ({
  db: { query: vi.fn() },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

vi.mock("@/config", () => ({
  config: {
    jwt: {
      secret: "test-secret",
      refreshSecret: "test-refresh-secret",
      accessExpiresIn: "15m",
      refreshExpiresIn: "7d",
    },
  },
}));

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    const validInput = {
      email: "new@example.com",
      password: "SecurePass1",
      name: "New User",
    };

    it("should register a new user successfully", async () => {
      // Arrange
      db.query
        .mockResolvedValueOnce({ rows: [] }) // No existing user
        .mockResolvedValueOnce({
          rows: [{ id: "123", email: validInput.email, name: validInput.name }],
        });
      bcrypt.hash.mockResolvedValue("hashed_password");

      // Act
      const result = await authService.register(
        validInput.email,
        validInput.password,
        validInput.name,
      );

      // Assert
      expect(result).toEqual({
        id: "123",
        email: validInput.email,
        name: validInput.name,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(validInput.password, 10);
    });

    it("should throw error if email already exists", async () => {
      db.query.mockResolvedValueOnce({ rows: [{ id: "1" }] });

      await expect(
        authService.register(
          validInput.email,
          validInput.password,
          validInput.name,
        ),
      ).rejects.toThrow(AuthenticationError);
      await expect(
        authService.register(
          validInput.email,
          validInput.password,
          validInput.name,
        ),
      ).rejects.toThrow("Email already registered");
    });
  });

  describe("login", () => {
    const mockUser = {
      id: "123",
      email: "user@example.com",
      password: "hashed_password",
      name: "Test User",
    };

    it("should login with valid credentials", async () => {
      // Arrange
      db.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign
        .mockReturnValueOnce("access_token_123")
        .mockReturnValueOnce("refresh_token_456");

      // Act
      const result = await authService.login("user@example.com", "password123");

      // Assert
      expect(result).toEqual({
        user: { id: "123", email: "user@example.com", name: "Test User" },
        accessToken: "access_token_123",
        refreshToken: "refresh_token_456",
      });
    });

    it("should throw error for non-existent user", async () => {
      db.query.mockResolvedValue({ rows: [] });

      await expect(
        authService.login("nonexistent@example.com", "password"),
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw error for wrong password", async () => {
      db.query.mockResolvedValue({ rows: [mockUser] });
      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login("user@example.com", "wrongpassword"),
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("generateAccessToken", () => {
    it("should generate JWT with correct payload", () => {
      const user = { id: "123", email: "user@example.com" };
      jwt.sign.mockReturnValue("generated_token");

      const token = authService.generateAccessToken(user);

      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: "123", email: "user@example.com" },
        "test-secret",
        { expiresIn: "15m" },
      );
      expect(token).toBe("generated_token");
    });
  });

  describe("verifyAccessToken", () => {
    it("should return decoded payload for valid token", () => {
      const decoded = { userId: "123", email: "user@example.com" };
      jwt.verify.mockReturnValue(decoded);

      const result = authService.verifyAccessToken("valid_token");

      expect(result).toEqual(decoded);
      expect(jwt.verify).toHaveBeenCalledWith("valid_token", "test-secret");
    });

    it("should throw AuthenticationError for invalid token", () => {
      jwt.verify.mockImplementation(() => {
        throw new Error("invalid token");
      });

      expect(() => authService.verifyAccessToken("invalid_token")).toThrow(
        AuthenticationError,
      );
    });
  });
});
```

---

## 🏗️ Practice: DevJobs Pro Unit Tests

Create comprehensive unit tests for the DevJobs Pro services.

### Task 1: Auth Service Tests

Test all authentication functions:

- Password hashing
- JWT generation and verification
- User registration with validation
- Login with various scenarios (success, wrong password, non-existent user)

### Task 2: Job Service Tests

```typescript
// tests/unit/services/job.service.test.ts

import { describe, it, expect, vi, beforeEach } from "vitest";
import { jobService } from "@/services/job.service";
import {
  createJob,
  createRemoteJob,
  resetJobFactory,
} from "../../factories/job.factory";

describe("JobService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetJobFactory();
  });

  describe("filterJobs", () => {
    const jobs = [
      createJob({ type: "full-time", location: "New York" }),
      createJob({ type: "remote", location: "Remote" }),
      createJob({ type: "contract", location: "San Francisco" }),
    ];

    it("should filter by job type", () => {
      const result = jobService.filterJobs(jobs, { type: "full-time" });
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe("full-time");
    });

    it("should filter by location", () => {
      const result = jobService.filterJobs(jobs, { location: "Remote" });
      expect(result).toHaveLength(1);
    });

    it("should apply multiple filters", () => {
      const result = jobService.filterJobs(jobs, {
        type: "remote",
        location: "Remote",
      });
      expect(result).toHaveLength(1);
    });

    it("should return all jobs when no filters", () => {
      const result = jobService.filterJobs(jobs, {});
      expect(result).toHaveLength(3);
    });
  });

  describe("validateSalaryRange", () => {
    it("should accept valid salary range", () => {
      expect(() => jobService.validateSalaryRange(50000, 100000)).not.toThrow();
    });

    it("should throw for invalid range", () => {
      expect(() => jobService.validateSalaryRange(100000, 50000)).toThrow();
    });

    it("should throw for negative salary", () => {
      expect(() => jobService.validateSalaryRange(-10000, 50000)).toThrow();
    });
  });
});
```

### Task 3: Email Service Tests

Test email template rendering and sending logic (as shown earlier).

---

## 💡 Pro Tips vs Junior Traps

| Pro Tip                                                                                | Junior Trap                                                  |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **One assertion per concept** - Test one behavior at a time for clear failure messages | Giant tests with 20 assertions that are hard to debug        |
| **Use factories for test data** - Consistent, reusable test fixtures                   | Copy-pasting the same object definition in every test        |
| **Test edge cases explicitly** - Empty arrays, null, undefined, boundary values        | Only testing happy path scenarios                            |
| **Mock at the boundary** - Mock databases and external APIs, not internal functions    | Mocking everything, including the code you're trying to test |
| **Name tests like sentences** - "should return 404 when user not found"                | "test1", "it works", "handles error"                         |
| **Keep tests focused** - Each test file for one module                                 | Huge test files with unrelated tests                         |
| **Test error messages** - Verify the error content, not just that an error was thrown  | `expect(fn).toThrow()` without checking the message          |

---

## 🐛 5-Minute Debugger

### Problem: Mock not working

```typescript
// Real function still being called!
```

**Quick Fixes:**

1. **Check module path in mock matches import:**

```typescript
// Your import
import { userService } from "@/services/user.service";

// Your mock - paths must match exactly!
vi.mock("@/services/user.service"); // ✅
vi.mock("./services/user.service"); // ❌ Different path!
```

2. **Provide mock implementation:**

```typescript
// ❌ Empty mock
vi.mock("@/db");

// ✅ Mock with implementation
vi.mock("@/db", () => ({
  db: {
    query: vi.fn().mockResolvedValue({ rows: [] }),
  },
}));
```

3. **Reset mocks between tests:**

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});
```

---

### Problem: Unexpected async behavior

```typescript
// Test passes but should fail
it("should reject invalid input", () => {
  // This doesn't work as expected
  validateAsync(null).catch((e) => {
    expect(e).toBeDefined();
  });
});
```

**Quick Fixes:**

1. **Use async/await:**

```typescript
it("should reject invalid input", async () => {
  await expect(validateAsync(null)).rejects.toThrow();
});
```

2. **Return the promise:**

```typescript
it("should reject invalid input", () => {
  return expect(validateAsync(null)).rejects.toThrow();
});
```

---

### Problem: Test pollution (tests affect each other)

```typescript
// Test 2 fails because Test 1 modified shared state
```

**Quick Fixes:**

1. **Reset state in beforeEach:**

```typescript
beforeEach(() => {
  // Reset any modified state
  vi.resetModules();
  vi.clearAllMocks();
});
```

2. **Use factory functions instead of shared objects:**

```typescript
// ❌ Shared mutable state
const testUser = { name: "John" };

// ✅ Factory creates fresh object each time
const createTestUser = () => ({ name: "John" });
```

3. **Isolate test database:**

```typescript
beforeEach(async () => {
  await clearTestDatabase();
});
```

---

## ✅ Definition of Done Checklist

Before moving to the next lesson, verify:

- [ ] **Pure utility functions tested** with multiple scenarios
- [ ] **Service layer tests created** with mocked dependencies
- [ ] **vi.mock() works correctly** for database and external services
- [ ] **Test factories created** for User, Job, and Application entities
- [ ] **Edge cases covered** (null, empty, boundary values)
- [ ] **Error conditions tested** (invalid input, missing data)
- [ ] **Async tests pass reliably** with proper await usage
- [ ] **All unit tests pass** - run `npm test run`

### Quick Verification

```bash
# Run unit tests
npm test run tests/unit

# Expected: All tests passing
# ✓ tests/unit/services/auth.service.test.ts
# ✓ tests/unit/services/job.service.test.ts
# ✓ tests/unit/services/email.service.test.ts
# ✓ tests/unit/utils/validation.test.ts
```

---

## 🔗 Navigation

| Previous                                                                | Home                          | Next                                                                     |
| ----------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| [← Lesson 1: Testing Fundamentals](./01-testing-fundamentals-vitest.md) | [Module 13 Home](./README.md) | [Lesson 3: Integration Testing →](./03-integration-testing-supertest.md) |

---

## 📚 Additional Resources

- [Vitest Mocking API](https://vitest.dev/api/mock.html)
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)
- [Martin Fowler: Unit Testing](https://martinfowler.com/bliki/UnitTest.html)
- [Effective Unit Testing Patterns](https://www.toptal.com/qa/how-to-write-testable-code-and-why-it-matters)

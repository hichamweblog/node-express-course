# Lesson 1: Testing Fundamentals with Vitest

## 🎯 Hook: Tests Save You from 3 AM Production Bugs

**Picture this:** It's 3 AM. Your phone buzzes. Production is down. Users can't log in. You trace the bug to a "simple" refactor you made yesterday—a one-line change that broke the authentication flow. No tests caught it because... there weren't any tests.

Now picture the alternative: You make the same refactor. Hit save. Your test suite runs in 2 seconds. Red. The auth tests failed. You fix the bug before it ever leaves your machine. You sleep soundly that night.

**Tests aren't extra work—they're insurance.** Every test you write is a future bug you'll never have to debug in production.

```
┌─────────────────────────────────────────────────────────────────┐
│                    WITHOUT TESTS vs WITH TESTS                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   WITHOUT TESTS                 │    WITH TESTS                 │
│   ─────────────                 │    ──────────                 │
│   Code → Push → Deploy          │    Code → Test → Push → Deploy│
│              ↓                  │           ↓                   │
│   Bug in Production 😱          │    Bug Caught Locally 😎      │
│              ↓                  │           ↓                   │
│   3 AM Alert                    │    Fix in 5 minutes           │
│              ↓                  │           ↓                   │
│   Debug for hours               │    Ship with confidence       │
│              ↓                  │                               │
│   Hotfix, stress, regret        │                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Theory: The Testing Pyramid & Test Runner Fundamentals

### The Testing Pyramid

The testing pyramid is a strategy for balancing test types. More tests at the base (fast, cheap), fewer at the top (slow, expensive).

```
┌─────────────────────────────────────────────────────────────────┐
│                      THE TESTING PYRAMID                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                            /\                                   │
│                           /  \           E2E Tests              │
│                          / E2E\          • Full user flows      │
│                         /______\         • Browser automation   │
│                        /        \        • ~5% of tests         │
│                       /Integration\      Integration Tests      │
│                      /   Tests    \      • API endpoints        │
│                     /______________\     • Database queries     │
│                    /                \    • ~20% of tests        │
│                   /    Unit Tests    \   Unit Tests             │
│                  /                    \  • Pure functions       │
│                 /______________________\ • Business logic       │
│                                          • ~75% of tests        │
│                                                                 │
│   Speed:     FAST ←─────────────────────────────────────→ SLOW  │
│   Cost:      CHEAP ←────────────────────────────────→ EXPENSIVE │
│   Isolation: HIGH ←─────────────────────────────────────→ LOW   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| Test Type       | What It Tests                | Speed        | Dependencies   |
| --------------- | ---------------------------- | ------------ | -------------- |
| **Unit**        | Individual functions/classes | Milliseconds | None (mocked)  |
| **Integration** | Multiple components together | Seconds      | Database, APIs |
| **E2E**         | Full application flows       | Minutes      | Everything     |

### Test Lifecycle: Setup → Act → Assert → Teardown

Every test follows the same pattern, often called "AAA" (Arrange, Act, Assert):

```
┌─────────────────────────────────────────────────────────────────┐
│                      TEST LIFECYCLE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐                                               │
│  │   SETUP      │  Arrange: Prepare test data, mocks, state     │
│  │  (Arrange)   │  • Create test user                           │
│  └──────┬───────┘  • Mock database                              │
│         │          • Set initial state                          │
│         ▼                                                       │
│  ┌──────────────┐                                               │
│  │    ACT       │  Act: Execute the code being tested           │
│  │   (Action)   │  • Call the function                          │
│  └──────┬───────┘  • Make the request                           │
│         │          • Trigger the event                          │
│         ▼                                                       │
│  ┌──────────────┐                                               │
│  │   ASSERT     │  Assert: Verify the expected outcome          │
│  │  (Verify)    │  • Check return value                         │
│  └──────┬───────┘  • Verify side effects                        │
│         │          • Confirm state changes                      │
│         ▼                                                       │
│  ┌──────────────┐                                               │
│  │  TEARDOWN    │  Cleanup: Reset state for next test           │
│  │  (Cleanup)   │  • Clear mocks                                │
│  └──────────────┘  • Reset database                             │
│                    • Restore original state                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why Vitest Over Jest?

| Feature                | Vitest              | Jest                    |
| ---------------------- | ------------------- | ----------------------- |
| **TypeScript Support** | Native, zero config | Needs babel/ts-jest     |
| **ES Modules**         | Native support      | Requires transformation |
| **Speed**              | Faster (uses Vite)  | Slower                  |
| **Hot Module Reload**  | Built-in            | Not available           |
| **Jest Compatibility** | Drop-in replacement | -                       |
| **Configuration**      | Simpler             | More complex            |

**Vitest is the modern choice for TypeScript projects.** It uses the same configuration as Vite, provides instant feedback with watch mode, and requires minimal setup.

---

## 💻 Code Examples

### Your First Vitest Test

Let's start with the simplest possible test:

**JavaScript:**

```javascript
// tests/first.test.js
import { describe, it, expect } from "vitest";

// A simple function to test
function add(a, b) {
  return a + b;
}

// describe: Groups related tests
describe("add function", () => {
  // it: Defines a single test case
  it("should add two positive numbers", () => {
    // Arrange
    const a = 2;
    const b = 3;

    // Act
    const result = add(a, b);

    // Assert
    expect(result).toBe(5);
  });

  it("should handle negative numbers", () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it("should handle zero", () => {
    expect(add(0, 5)).toBe(5);
    expect(add(5, 0)).toBe(5);
  });
});
```

**TypeScript:**

```typescript
// tests/first.test.ts
import { describe, it, expect } from "vitest";

// A simple function to test
function add(a: number, b: number): number {
  return a + b;
}

// describe: Groups related tests
describe("add function", () => {
  // it: Defines a single test case
  it("should add two positive numbers", () => {
    // Arrange
    const a = 2;
    const b = 3;

    // Act
    const result = add(a, b);

    // Assert
    expect(result).toBe(5);
  });

  it("should handle negative numbers", () => {
    expect(add(-1, -2)).toBe(-3);
  });

  it("should handle zero", () => {
    expect(add(0, 5)).toBe(5);
    expect(add(5, 0)).toBe(5);
  });
});
```

### Common Matchers

```typescript
import { describe, it, expect } from "vitest";

describe("Vitest Matchers", () => {
  // Equality
  it("equality matchers", () => {
    expect(1 + 1).toBe(2); // Strict equality (===)
    expect({ a: 1 }).toEqual({ a: 1 }); // Deep equality
    expect([1, 2, 3]).toContain(2); // Array contains
  });

  // Truthiness
  it("truthiness matchers", () => {
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
    expect(null).toBeNull();
    expect(undefined).toBeUndefined();
    expect("value").toBeDefined();
  });

  // Numbers
  it("number matchers", () => {
    expect(10).toBeGreaterThan(5);
    expect(5).toBeLessThan(10);
    expect(0.1 + 0.2).toBeCloseTo(0.3); // Floating point
  });

  // Strings
  it("string matchers", () => {
    expect("hello world").toContain("world");
    expect("hello@test.com").toMatch(/\S+@\S+\.\S+/); // Regex
  });

  // Objects and Arrays
  it("object/array matchers", () => {
    expect({ name: "John", age: 30 }).toHaveProperty("name");
    expect([1, 2, 3]).toHaveLength(3);
    expect({ a: 1, b: 2 }).toMatchObject({ a: 1 }); // Partial match
  });

  // Exceptions
  it("exception matchers", () => {
    const throwError = () => {
      throw new Error("Something went wrong");
    };
    expect(throwError).toThrow();
    expect(throwError).toThrow("Something went wrong");
    expect(throwError).toThrow(Error);
  });
});
```

### Test Lifecycle Hooks

**JavaScript:**

```javascript
// tests/lifecycle.test.js
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";

describe("Test Lifecycle Demo", () => {
  let database;
  let testUser;

  // Runs once before all tests in this describe block
  beforeAll(async () => {
    console.log("🚀 Setting up test database...");
    database = await connectToTestDatabase();
  });

  // Runs once after all tests in this describe block
  afterAll(async () => {
    console.log("🧹 Cleaning up test database...");
    await database.disconnect();
  });

  // Runs before EACH test
  beforeEach(async () => {
    console.log("📝 Creating fresh test user...");
    testUser = await database.createUser({
      email: "test@example.com",
      name: "Test User",
    });
  });

  // Runs after EACH test
  afterEach(async () => {
    console.log("🗑️ Removing test user...");
    await database.deleteUser(testUser.id);
  });

  it("should find the test user", async () => {
    const found = await database.findUser(testUser.id);
    expect(found.email).toBe("test@example.com");
  });

  it("should update the test user", async () => {
    await database.updateUser(testUser.id, { name: "Updated Name" });
    const found = await database.findUser(testUser.id);
    expect(found.name).toBe("Updated Name");
  });
});
```

**TypeScript:**

```typescript
// tests/lifecycle.test.ts
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";

interface User {
  id: string;
  email: string;
  name: string;
}

interface Database {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  createUser(data: Omit<User, "id">): Promise<User>;
  findUser(id: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
}

describe("Test Lifecycle Demo", () => {
  let database: Database;
  let testUser: User;

  // Runs once before all tests in this describe block
  beforeAll(async () => {
    console.log("🚀 Setting up test database...");
    database = await connectToTestDatabase();
  });

  // Runs once after all tests in this describe block
  afterAll(async () => {
    console.log("🧹 Cleaning up test database...");
    await database.disconnect();
  });

  // Runs before EACH test
  beforeEach(async () => {
    console.log("📝 Creating fresh test user...");
    testUser = await database.createUser({
      email: "test@example.com",
      name: "Test User",
    });
  });

  // Runs after EACH test
  afterEach(async () => {
    console.log("🗑️ Removing test user...");
    await database.deleteUser(testUser.id);
  });

  it("should find the test user", async () => {
    const found = await database.findUser(testUser.id);
    expect(found?.email).toBe("test@example.com");
  });

  it("should update the test user", async () => {
    await database.updateUser(testUser.id, { name: "Updated Name" });
    const found = await database.findUser(testUser.id);
    expect(found?.name).toBe("Updated Name");
  });
});
```

### Testing Async Code

**JavaScript:**

```javascript
// tests/async.test.js
import { describe, it, expect, vi } from "vitest";

// Simulated async function
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error("User not found");
  }
  return response.json();
}

describe("Async Testing", () => {
  // Method 1: async/await (recommended)
  it("should fetch user data with async/await", async () => {
    // Mock the fetch function
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "123", name: "John" }),
    });

    const user = await fetchUserData("123");

    expect(user.name).toBe("John");
    expect(fetch).toHaveBeenCalledWith("/api/users/123");
  });

  // Method 2: Returning a promise
  it("should fetch user data returning promise", () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "456", name: "Jane" }),
    });

    // Return the promise - Vitest will wait for it
    return fetchUserData("456").then((user) => {
      expect(user.name).toBe("Jane");
    });
  });

  // Testing rejected promises
  it("should handle fetch errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    await expect(fetchUserData("999")).rejects.toThrow("User not found");
  });

  // Testing with timeouts
  it("should handle slow operations", async () => {
    const slowFunction = () =>
      new Promise((resolve) => setTimeout(() => resolve("done"), 100));

    const result = await slowFunction();
    expect(result).toBe("done");
  }, 5000); // Custom timeout: 5 seconds
});
```

**TypeScript:**

```typescript
// tests/async.test.ts
import { describe, it, expect, vi, Mock } from "vitest";

interface User {
  id: string;
  name: string;
}

// Simulated async function
async function fetchUserData(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  if (!response.ok) {
    throw new Error("User not found");
  }
  return response.json();
}

describe("Async Testing", () => {
  // Method 1: async/await (recommended)
  it("should fetch user data with async/await", async () => {
    // Mock the fetch function
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "123", name: "John" }),
    }) as Mock;

    const user = await fetchUserData("123");

    expect(user.name).toBe("John");
    expect(fetch).toHaveBeenCalledWith("/api/users/123");
  });

  // Method 2: Returning a promise
  it("should fetch user data returning promise", () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "456", name: "Jane" }),
    }) as Mock;

    // Return the promise - Vitest will wait for it
    return fetchUserData("456").then((user) => {
      expect(user.name).toBe("Jane");
    });
  });

  // Testing rejected promises
  it("should handle fetch errors", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    }) as Mock;

    await expect(fetchUserData("999")).rejects.toThrow("User not found");
  });

  // Testing with custom timeout
  it("should handle slow operations", async () => {
    const slowFunction = (): Promise<string> =>
      new Promise((resolve) => setTimeout(() => resolve("done"), 100));

    const result = await slowFunction();
    expect(result).toBe("done");
  }, 5000); // Custom timeout: 5 seconds
});
```

---

## 🎓 Mini-Tutorial: Configure Vitest for TypeScript Express Project

Let's set up Vitest from scratch in your DevJobs Pro project.

### Step 1: Install Dependencies

```bash
# Core testing libraries
npm install -D vitest @vitest/coverage-v8

# Types for better autocomplete
npm install -D @types/node
```

### Step 2: Create Vitest Configuration

**JavaScript (vitest.config.js):**

```javascript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Global test settings
    globals: true, // Enable global test functions (describe, it, expect)

    // Environment
    environment: "node", // Use Node.js environment

    // File patterns
    include: ["tests/**/*.test.{js,ts}", "src/**/*.test.{js,ts}"],
    exclude: ["node_modules", "dist"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{js,ts}"],
      exclude: ["src/**/*.test.{js,ts}", "src/**/*.d.ts", "src/types/**"],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    // Setup files (run before each test file)
    setupFiles: ["./tests/setup.js"],

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Watch mode settings
    watch: true,
    watchExclude: ["node_modules", "dist"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**TypeScript (vitest.config.ts):**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // Global test settings
    globals: true, // Enable global test functions (describe, it, expect)

    // Environment
    environment: "node", // Use Node.js environment

    // File patterns
    include: ["tests/**/*.test.{js,ts}", "src/**/*.test.{js,ts}"],
    exclude: ["node_modules", "dist"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{js,ts}"],
      exclude: ["src/**/*.test.{js,ts}", "src/**/*.d.ts", "src/types/**"],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },

    // Setup files (run before each test file)
    setupFiles: ["./tests/setup.ts"],

    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // Watch mode settings
    watch: true,
    watchExclude: ["node_modules", "dist"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Step 3: Create Test Setup File

**JavaScript (tests/setup.js):**

```javascript
import { beforeAll, afterAll, afterEach, vi } from "vitest";

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/devjobs_test";

// Global setup - runs once before all tests
beforeAll(async () => {
  console.log("🧪 Starting test suite...");
});

// Global teardown - runs once after all tests
afterAll(async () => {
  console.log("✅ Test suite complete");
});

// Cleanup after each test
afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks();

  // Reset all mocks to original implementation
  vi.resetAllMocks();
});

// Extend expect with custom matchers (optional)
// expect.extend({
//   toBeValidEmail(received) {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const pass = emailRegex.test(received);
//     return {
//       pass,
//       message: () => `expected ${received} to ${pass ? 'not ' : ''}be a valid email`,
//     };
//   },
// });
```

**TypeScript (tests/setup.ts):**

```typescript
import { beforeAll, afterAll, afterEach, vi } from "vitest";

// Set test environment variables
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/devjobs_test";

// Global setup - runs once before all tests
beforeAll(async () => {
  console.log("🧪 Starting test suite...");
});

// Global teardown - runs once after all tests
afterAll(async () => {
  console.log("✅ Test suite complete");
});

// Cleanup after each test
afterEach(() => {
  // Clear all mocks
  vi.clearAllMocks();

  // Reset all mocks to original implementation
  vi.resetAllMocks();
});

// Extend Vitest types for custom matchers (optional)
// declare module 'vitest' {
//   interface Assertion<T = unknown> {
//     toBeValidEmail(): T;
//   }
// }
```

### Step 4: Add Scripts to package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

### Step 5: Create Your First Real Test

**JavaScript (tests/unit/utils/string.test.js):**

```javascript
import { describe, it, expect } from "vitest";

// Import function from your source code
// import { slugify, capitalize, truncate } from '@/utils/string';

// For demo, we'll define these inline
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function truncate(text, length, suffix = "...") {
  if (text.length <= length) return text;
  return text.slice(0, length) + suffix;
}

describe("String Utilities", () => {
  describe("slugify", () => {
    it("should convert text to lowercase slug", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should handle special characters", () => {
      expect(slugify("Hello, World!")).toBe("hello-world");
    });

    it("should trim whitespace", () => {
      expect(slugify("  spaced out  ")).toBe("spaced-out");
    });

    it("should handle multiple spaces", () => {
      expect(slugify("too   many   spaces")).toBe("too-many-spaces");
    });

    it("should handle empty string", () => {
      expect(slugify("")).toBe("");
    });
  });

  describe("capitalize", () => {
    it("should capitalize first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("should lowercase remaining letters", () => {
      expect(capitalize("HELLO")).toBe("Hello");
    });

    it("should handle empty string", () => {
      expect(capitalize("")).toBe("");
    });
  });

  describe("truncate", () => {
    it("should truncate long strings", () => {
      expect(truncate("This is a long string", 10)).toBe("This is a ...");
    });

    it("should not truncate short strings", () => {
      expect(truncate("Short", 10)).toBe("Short");
    });

    it("should use custom suffix", () => {
      expect(truncate("Long text here", 5, "…")).toBe("Long …");
    });
  });
});
```

**TypeScript (tests/unit/utils/string.test.ts):**

```typescript
import { describe, it, expect } from "vitest";

// Import function from your source code
// import { slugify, capitalize, truncate } from '@/utils/string';

// For demo, we'll define these inline
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function capitalize(text: string): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function truncate(text: string, length: number, suffix = "..."): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + suffix;
}

describe("String Utilities", () => {
  describe("slugify", () => {
    it("should convert text to lowercase slug", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should handle special characters", () => {
      expect(slugify("Hello, World!")).toBe("hello-world");
    });

    it("should trim whitespace", () => {
      expect(slugify("  spaced out  ")).toBe("spaced-out");
    });

    it("should handle multiple spaces", () => {
      expect(slugify("too   many   spaces")).toBe("too-many-spaces");
    });

    it("should handle empty string", () => {
      expect(slugify("")).toBe("");
    });
  });

  describe("capitalize", () => {
    it("should capitalize first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
    });

    it("should lowercase remaining letters", () => {
      expect(capitalize("HELLO")).toBe("Hello");
    });

    it("should handle empty string", () => {
      expect(capitalize("")).toBe("");
    });
  });

  describe("truncate", () => {
    it("should truncate long strings", () => {
      expect(truncate("This is a long string", 10)).toBe("This is a ...");
    });

    it("should not truncate short strings", () => {
      expect(truncate("Short", 10)).toBe("Short");
    });

    it("should use custom suffix", () => {
      expect(truncate("Long text here", 5, "…")).toBe("Long …");
    });
  });
});
```

### Step 6: Run Your Tests

```bash
# Run all tests once
npm test run

# Run tests in watch mode (re-runs on file changes)
npm test

# Run with coverage report
npm run test:coverage

# Run with UI (visual test runner)
npm run test:ui
```

---

## 🏗️ Practice: DevJobs Pro Test Setup

Now let's set up the complete testing infrastructure for DevJobs Pro.

### Project Structure

```
devjobs-pro/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── tests/
│   ├── setup.ts           # Global test configuration
│   ├── factories/         # Test data factories
│   │   ├── index.ts
│   │   ├── user.factory.ts
│   │   └── job.factory.ts
│   ├── utils/             # Test helpers
│   │   ├── db.ts
│   │   └── auth.ts
│   ├── unit/              # Unit tests
│   │   └── services/
│   └── integration/       # Integration tests
│       └── api/
├── vitest.config.ts
└── package.json
```

### Create Test Factory (tests/factories/user.factory.ts)

```typescript
import { vi } from "vitest";

interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: "candidate" | "employer" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

type UserInput = Partial<User>;

let userIdCounter = 1;

export function createUser(overrides: UserInput = {}): User {
  const id = `user_${userIdCounter++}`;

  return {
    id,
    email: `user${userIdCounter}@example.com`,
    password: "$2b$10$hashedpassword", // Pre-hashed "password123"
    name: `Test User ${userIdCounter}`,
    role: "candidate",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createEmployer(overrides: UserInput = {}): User {
  return createUser({
    role: "employer",
    email: `employer${userIdCounter}@company.com`,
    name: `Employer ${userIdCounter}`,
    ...overrides,
  });
}

export function createAdmin(overrides: UserInput = {}): User {
  return createUser({
    role: "admin",
    email: `admin${userIdCounter}@devjobs.com`,
    name: `Admin ${userIdCounter}`,
    ...overrides,
  });
}

// Reset counter between test suites
export function resetUserFactory(): void {
  userIdCounter = 1;
}
```

### Create Test Database Helper (tests/utils/db.ts)

```typescript
import { vi } from "vitest";

// Mock database connection for unit tests
export const mockDb = {
  query: vi.fn(),
  transaction: vi.fn(),
};

// For integration tests with real database
export async function setupTestDatabase(): Promise<void> {
  // Connect to test database
  // Run migrations
  // Seed with initial data if needed
  console.log("📦 Test database ready");
}

export async function teardownTestDatabase(): Promise<void> {
  // Clean up test data
  // Close connections
  console.log("🧹 Test database cleaned");
}

export async function clearTables(): Promise<void> {
  // Clear all tables between tests
  // Preserve order to handle foreign keys
}
```

---

## 💡 Pro Tips vs Junior Traps

| Pro Tip                                                                                                        | Junior Trap                                                                  |
| -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Write tests that fail first** - Verify your test actually tests something by seeing it fail before it passes | Writing tests after the code and assuming they work without seeing them fail |
| **Test behavior, not implementation** - Test what function does, not how it does it                            | Testing internal details that break when you refactor                        |
| **Keep tests independent** - Each test should work in isolation                                                | Tests that depend on other tests running first                               |
| **Use descriptive test names** - "should return 404 when user not found" tells you exactly what broke          | Vague names like "test1" or "should work"                                    |
| **Coverage isn't everything** - 80% meaningful coverage > 100% trivial coverage                                | Chasing 100% coverage with useless tests                                     |
| **Test edge cases** - Empty arrays, null values, boundaries                                                    | Only testing the happy path                                                  |
| **Fast tests get run** - Keep unit tests under 100ms                                                           | Slow tests that developers skip                                              |

---

## 🐛 5-Minute Debugger

### Problem: "Cannot find module" in tests

```
Error: Cannot find module '@/services/auth.service'
```

**Quick Fixes:**

1. **Check vitest.config.ts aliases:**

```typescript
// vitest.config.ts
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

2. **Check tsconfig.json paths:**

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

3. **Try relative imports as a test:**

```typescript
// Instead of
import { x } from "@/utils";
// Try
import { x } from "../../src/utils";
```

---

### Problem: Async test timeout

```
Error: Test timed out in 5000ms.
```

**Quick Fixes:**

1. **Increase timeout for specific test:**

```typescript
it("should handle slow operation", async () => {
  // test code
}, 30000); // 30 second timeout
```

2. **Check for missing await:**

```typescript
// ❌ Wrong: Promise not awaited
it("should fetch data", () => {
  fetchData().then((data) => expect(data).toBeDefined());
});

// ✅ Correct: Await the promise
it("should fetch data", async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});
```

3. **Check for hanging promises:**

```typescript
// ❌ Opens connection but never closes
const db = await connectDB();

// ✅ Always clean up
afterEach(async () => {
  await db.close();
});
```

---

### Problem: Mocking not working

```typescript
// Mock seems to be ignored, real function still called
```

**Quick Fixes:**

1. **Mock BEFORE importing:**

```typescript
// ❌ Wrong order
import { userService } from "@/services/user.service";
vi.mock("@/services/user.service");

// ✅ Correct: Mock hoists automatically but be explicit
vi.mock("@/services/user.service", () => ({
  userService: {
    findById: vi.fn(),
  },
}));
import { userService } from "@/services/user.service";
```

2. **Check mock implementation:**

```typescript
// ❌ Returns undefined
vi.mock("@/db");

// ✅ Provide implementation
vi.mock("@/db", () => ({
  query: vi.fn().mockResolvedValue([]),
}));
```

3. **Reset mocks between tests:**

```typescript
afterEach(() => {
  vi.clearAllMocks(); // Clears call history
  vi.resetAllMocks(); // Resets implementations
});
```

---

## ✅ Definition of Done Checklist

Before moving to the next lesson, verify:

- [ ] **Vitest is configured** in `vitest.config.ts` with coverage settings
- [ ] **Test scripts added** to `package.json` (test, test:watch, test:coverage)
- [ ] **Setup file created** in `tests/setup.ts` with environment variables
- [ ] **Test directory structure** created (unit, integration, factories, utils)
- [ ] **First test passes** - run `npm test` and see green output
- [ ] **Test factories created** for User and Job entities
- [ ] **Coverage report works** - run `npm run test:coverage`
- [ ] **Understand** describe, it, expect, beforeEach, afterEach

### Quick Verification

```bash
# Run this to verify setup
npm test run

# Expected output:
# ✓ tests/unit/utils/string.test.ts (5 tests)
# Test Files  1 passed (1)
# Tests  5 passed (5)
```

---

## 🔗 Navigation

| Previous                                                           | Home                          | Next                                                               |
| ------------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------ |
| [← Module 12: File Uploads](../12-file-uploads-services/README.md) | [Module 13 Home](./README.md) | [Lesson 2: Unit Testing Services →](./02-unit-testing-services.md) |

---

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Testing JavaScript - Kent C. Dodds](https://testingjavascript.com/)
- [The Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

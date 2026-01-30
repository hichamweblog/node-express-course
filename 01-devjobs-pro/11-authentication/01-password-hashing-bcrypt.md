# Lesson 1: Password Hashing with bcrypt

## 🎯 Hook: Store Passwords Correctly or Become a Security Headline

> _"Company X exposes 150 million user passwords stored in plain text"_

You've seen these headlines. Adobe, LinkedIn, RockYou—all made the same catastrophic mistake. Plain text passwords. When (not if) their databases were breached, every user's password was immediately compromised.

Here's the uncomfortable truth: **your database will eventually be accessed by someone who shouldn't have access**. An SQL injection, a misconfigured backup, a disgruntled employee, a compromised admin account. The question isn't whether your password storage will be tested—it's whether it will pass the test.

In this lesson, you'll learn to store passwords so that even a complete database breach doesn't expose a single user's password.

---

## 📚 Theory: The Science of Secure Password Storage

### Why Plain Text Passwords Are Catastrophic

Let's be crystal clear about what happens with plain text passwords:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLAIN TEXT DISASTER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User Database (what attacker sees):                          │
│   ┌──────────────────────────────────────────────────────┐     │
│   │ id │ email              │ password        │ role     │     │
│   ├────┼────────────────────┼─────────────────┼──────────┤     │
│   │ 1  │ alice@email.com    │ MyDog2024!      │ seeker   │     │
│   │ 2  │ bob@company.com    │ password123     │ employer │     │
│   │ 3  │ admin@devjobs.com  │ AdminSecret99   │ admin    │     │
│   └──────────────────────────────────────────────────────┘     │
│                                                                 │
│   Attacker immediately has:                                    │
│   ✗ All passwords in seconds                                   │
│   ✗ Access to users' other accounts (password reuse)           │
│   ✗ Admin access to your system                                │
│   ✗ Basis for targeted phishing attacks                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Hashing vs Encryption: Know the Difference

This is a common point of confusion. Let's clear it up:

```
┌─────────────────────────────────────────────────────────────────┐
│                  ENCRYPTION vs HASHING                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ENCRYPTION (Two-way):                                        │
│   ┌────────────┐    encrypt     ┌────────────┐                 │
│   │ "password" │ ──────────────▶│ "x7#kL9..." │                │
│   └────────────┘    ◀──────────  └────────────┘                │
│                      decrypt                                   │
│                                                                 │
│   • Reversible with the right key                              │
│   • Used for: data that needs to be read later                 │
│   • Problem: If attacker gets the key, game over               │
│                                                                 │
│   ─────────────────────────────────────────────────────────    │
│                                                                 │
│   HASHING (One-way):                                           │
│   ┌────────────┐     hash      ┌────────────────────────┐      │
│   │ "password" │ ─────────────▶│ "$2b$12$LQv3c1y..." │      │
│   └────────────┘               └────────────────────────┘      │
│                        ✗ Cannot reverse                        │
│                                                                 │
│   • Intentionally irreversible                                 │
│   • Used for: passwords (verify, never retrieve)               │
│   • Security: Even with hash, can't get original               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key insight**: You never need to know a user's password. You only need to verify that what they typed matches what they registered with. Hashing is perfect for this.

### The bcrypt Algorithm: Designed for Passwords

Not all hash functions are suitable for passwords. MD5 and SHA-256 are fast—too fast. An attacker with a GPU can try billions of SHA-256 hashes per second.

bcrypt was specifically designed for password hashing with three critical features:

```
┌─────────────────────────────────────────────────────────────────┐
│                    bcrypt COMPONENTS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. COST FACTOR (Work Factor)                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ Cost = 10: ~100ms to hash                               │  │
│   │ Cost = 12: ~400ms to hash (recommended)                 │  │
│   │ Cost = 14: ~1.6s to hash                                │  │
│   │                                                         │  │
│   │ Each +1 doubles the time                                │  │
│   │ Attacker trying 1 billion passwords at cost=12:         │  │
│   │ → 400ms × 1,000,000,000 = 12.7 YEARS                    │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   2. SALT (Random, unique per password)                        │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ Same password, different salts:                         │  │
│   │ "password" + salt1 → "$2b$12$ABC...xyz"                 │  │
│   │ "password" + salt2 → "$2b$12$DEF...uvw"                 │  │
│   │                                                         │  │
│   │ Prevents: Rainbow tables, identifying same passwords    │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   3. HASH OUTPUT (Contains everything needed)                  │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ $2b$12$LQv3c1yqBWVHxkd0LHAOWeY.fLYrHvQLwHN3Y3Y7vD6O...  │  │
│   │  │  │  │                       │                        │  │
│   │  │  │  │                       └── Hash (31 chars)      │  │
│   │  │  │  └── Salt (22 chars)                              │  │
│   │  │  └── Cost factor (12)                                │  │
│   │  └── Algorithm version (2b)                             │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Password Hashing Flow

Here's how registration and login work with hashed passwords:

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRATION FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User Input          bcrypt Process           Database         │
│   ┌─────────┐        ┌─────────────┐         ┌─────────────┐   │
│   │ "MyPass │   1.   │ Generate    │    3.   │ Store hash  │   │
│   │  word!" │ ──────▶│ random salt │ ──────▶ │ only (60    │   │
│   └─────────┘        └──────┬──────┘         │ chars)      │   │
│                             │                └─────────────┘   │
│                        2.   ▼                                  │
│                      ┌─────────────┐                           │
│                      │ Hash with   │                           │
│                      │ salt + cost │                           │
│                      │ factor      │                           │
│                      └─────────────┘                           │
│                                                                 │
│   Result: $2b$12$Q4g... (salt embedded, original lost forever) │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    LOGIN VERIFICATION                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User Input              bcrypt.compare                       │
│   ┌─────────┐            ┌─────────────────┐                   │
│   │ "MyPass │      1.    │ Extract salt    │                   │
│   │  word!" │ ──────────▶│ from stored     │                   │
│   └─────────┘            │ hash            │                   │
│                          └────────┬────────┘                   │
│   Stored Hash                     │                            │
│   ┌─────────────┐           2.    ▼                            │
│   │ $2b$12$Q4g..│      ┌─────────────────┐                     │
│   └──────┬──────┘      │ Re-hash input   │                     │
│          │             │ with same salt  │                     │
│          │             │ and cost        │                     │
│          │             └────────┬────────┘                     │
│          │                      │                              │
│          │                 3.   ▼                              │
│          │             ┌─────────────────┐                     │
│          └────────────▶│ Compare hashes  │                     │
│                        │ (timing-safe)   │                     │
│                        └────────┬────────┘                     │
│                                 │                              │
│                            4.   ▼                              │
│                        ┌─────────────────┐                     │
│                        │ true or false   │                     │
│                        └─────────────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### bcrypt vs Argon2: Which to Choose?

```
┌─────────────────────────────────────────────────────────────────┐
│                bcrypt vs Argon2 COMPARISON                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   BCRYPT                          ARGON2                       │
│   ──────────────────────         ──────────────────────        │
│   ✓ Battle-tested (1999)         ✓ Modern (2015)               │
│   ✓ Universal support            ✓ Memory-hard (GPU resistant) │
│   ✓ Simple API                   ✓ Winner of PHC               │
│   ✓ Widely audited               ✓ Configurable parallelism    │
│                                                                 │
│   ✗ CPU-only hardness            ✗ Less mature ecosystem       │
│   ✗ Fixed memory usage           ✗ More complex tuning         │
│   ✗ 72-byte password limit       ✗ Fewer battle scars          │
│                                                                 │
│   RECOMMENDATION:                                              │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ Use bcrypt for most Node.js applications.              │  │
│   │ Consider Argon2 for new high-security systems.         │  │
│   │ Both are vastly better than any alternative.           │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Examples

### Basic Password Hashing

**JavaScript:**

```javascript
// password-basic.js
import bcrypt from "bcrypt";

// Hash a password
async function hashPassword(plainPassword) {
  const saltRounds = 12; // Cost factor
  const hash = await bcrypt.hash(plainPassword, saltRounds);
  return hash;
}

// Verify a password
async function verifyPassword(plainPassword, hashedPassword) {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch;
}

// Usage
async function demo() {
  const password = "MySecurePassword123!";

  // Registration
  const hash = await hashPassword(password);
  console.log("Hashed:", hash);
  // → $2b$12$LQv3c1yqBWVHxkd0LHAOWeY.fLYrHvQLwHN3Y3Y7vD6O...

  // Login
  const isValid = await verifyPassword(password, hash);
  console.log("Is valid:", isValid); // → true

  const isInvalid = await verifyPassword("WrongPassword", hash);
  console.log("Wrong password:", isInvalid); // → false
}

demo();
```

**TypeScript:**

```typescript
// password-basic.ts
import bcrypt from "bcrypt";

async function hashPassword(plainPassword: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(plainPassword, saltRounds);
}

async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Usage with explicit types
async function demo(): Promise<void> {
  const password: string = "MySecurePassword123!";

  const hash: string = await hashPassword(password);
  console.log("Hashed:", hash);

  const isValid: boolean = await verifyPassword(password, hash);
  console.log("Is valid:", isValid);
}

demo();
```

### Configuring Cost Factor

**JavaScript:**

```javascript
// cost-factor.js
import bcrypt from "bcrypt";

// Measure hash time for different cost factors
async function measureHashTime(costFactor) {
  const password = "TestPassword123!";

  const start = Date.now();
  await bcrypt.hash(password, costFactor);
  const duration = Date.now() - start;

  console.log(`Cost ${costFactor}: ${duration}ms`);
  return duration;
}

// Find optimal cost factor for your server
async function findOptimalCost(targetMs = 250) {
  console.log(`Finding cost factor for ~${targetMs}ms hash time...\n`);

  for (let cost = 8; cost <= 16; cost++) {
    const duration = await measureHashTime(cost);

    if (duration >= targetMs) {
      console.log(`\nRecommended cost factor: ${cost}`);
      console.log(`Actual hash time: ${duration}ms`);
      return cost;
    }
  }

  return 12; // Safe default
}

// Run benchmark
findOptimalCost(250);

/*
Output on a typical server:
Cost 8: 15ms
Cost 9: 31ms
Cost 10: 62ms
Cost 11: 124ms
Cost 12: 248ms

Recommended cost factor: 12
Actual hash time: 248ms
*/
```

**TypeScript:**

```typescript
// cost-factor.ts
import bcrypt from "bcrypt";

async function measureHashTime(costFactor: number): Promise<number> {
  const password = "TestPassword123!";

  const start = Date.now();
  await bcrypt.hash(password, costFactor);
  const duration = Date.now() - start;

  console.log(`Cost ${costFactor}: ${duration}ms`);
  return duration;
}

async function findOptimalCost(targetMs: number = 250): Promise<number> {
  console.log(`Finding cost factor for ~${targetMs}ms hash time...\n`);

  for (let cost = 8; cost <= 16; cost++) {
    const duration = await measureHashTime(cost);

    if (duration >= targetMs) {
      console.log(`\nRecommended cost factor: ${cost}`);
      return cost;
    }
  }

  return 12;
}

findOptimalCost(250);
```

### Migrating Cost Factor Over Time

As hardware improves, you should increase your cost factor. Here's how to do it transparently:

**JavaScript:**

```javascript
// cost-migration.js
import bcrypt from "bcrypt";

const CURRENT_COST_FACTOR = 12;

// Extract cost factor from existing hash
function getCostFactor(hash) {
  // Hash format: $2b$12$...
  const parts = hash.split("$");
  return parseInt(parts[2], 10);
}

// Check if hash needs upgrade
function needsRehash(hash) {
  const currentCost = getCostFactor(hash);
  return currentCost < CURRENT_COST_FACTOR;
}

// Verify and optionally upgrade during login
async function verifyAndUpgrade(plainPassword, storedHash) {
  // First, verify the password
  const isValid = await bcrypt.compare(plainPassword, storedHash);

  if (!isValid) {
    return { isValid: false, newHash: null };
  }

  // If valid and needs upgrade, create new hash
  if (needsRehash(storedHash)) {
    const newHash = await bcrypt.hash(plainPassword, CURRENT_COST_FACTOR);
    console.log(
      `Upgraded hash from cost ${getCostFactor(storedHash)} to ${CURRENT_COST_FACTOR}`,
    );
    return { isValid: true, newHash };
  }

  return { isValid: true, newHash: null };
}

// Usage in login flow
async function login(email, password, userRepository) {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    // Timing attack prevention: still do a hash comparison
    await bcrypt.compare(password, "$2b$12$invalidhashtopreventtiming");
    return null;
  }

  const { isValid, newHash } = await verifyAndUpgrade(
    password,
    user.passwordHash,
  );

  if (!isValid) {
    return null;
  }

  // Update hash if it was upgraded
  if (newHash) {
    await userRepository.updatePasswordHash(user.id, newHash);
  }

  return user;
}
```

**TypeScript:**

```typescript
// cost-migration.ts
import bcrypt from "bcrypt";

const CURRENT_COST_FACTOR = 12;

interface VerifyResult {
  isValid: boolean;
  newHash: string | null;
}

function getCostFactor(hash: string): number {
  const parts = hash.split("$");
  return parseInt(parts[2], 10);
}

function needsRehash(hash: string): boolean {
  return getCostFactor(hash) < CURRENT_COST_FACTOR;
}

async function verifyAndUpgrade(
  plainPassword: string,
  storedHash: string,
): Promise<VerifyResult> {
  const isValid = await bcrypt.compare(plainPassword, storedHash);

  if (!isValid) {
    return { isValid: false, newHash: null };
  }

  if (needsRehash(storedHash)) {
    const newHash = await bcrypt.hash(plainPassword, CURRENT_COST_FACTOR);
    return { isValid: true, newHash };
  }

  return { isValid: true, newHash: null };
}

interface User {
  id: string;
  email: string;
  passwordHash: string;
}

interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  updatePasswordHash(userId: string, newHash: string): Promise<void>;
}

async function login(
  email: string,
  password: string,
  userRepository: UserRepository,
): Promise<User | null> {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    // Timing attack prevention
    await bcrypt.compare(password, "$2b$12$invalidhashtopreventtiming");
    return null;
  }

  const { isValid, newHash } = await verifyAndUpgrade(
    password,
    user.passwordHash,
  );

  if (!isValid) {
    return null;
  }

  if (newHash) {
    await userRepository.updatePasswordHash(user.id, newHash);
  }

  return user;
}
```

---

## 🔨 Mini-Tutorial: Password Utility Module

Let's create a production-ready password utility module for DevJobs Pro.

### Step 1: Set Up the Module

**TypeScript:**

```typescript
// src/utils/password.util.ts
import bcrypt from "bcrypt";

// Configuration from environment
const COST_FACTOR = parseInt(process.env.BCRYPT_COST_FACTOR || "12", 10);
const MIN_PASSWORD_LENGTH = 8;

export interface PasswordConfig {
  costFactor?: number;
  minLength?: number;
}

export interface HashResult {
  hash: string;
  costFactor: number;
}

export interface VerifyResult {
  isValid: boolean;
  needsRehash: boolean;
}
```

### Step 2: Implement Core Functions

```typescript
// src/utils/password.util.ts (continued)

/**
 * Validates password meets minimum requirements
 * Note: Add more rules as needed (uppercase, numbers, etc.)
 */
export function validatePasswordStrength(password: string): boolean {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return false;
  }

  // Add more validation rules as needed
  // Example: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)

  return true;
}

/**
 * Hash a password with bcrypt
 * Returns the hash and the cost factor used
 */
export async function hashPassword(
  plainPassword: string,
  config?: PasswordConfig,
): Promise<HashResult> {
  const costFactor = config?.costFactor ?? COST_FACTOR;

  // Never log the password, even in development
  // console.log('Hashing password:', plainPassword); // NEVER DO THIS

  const hash = await bcrypt.hash(plainPassword, costFactor);

  return {
    hash,
    costFactor,
  };
}

/**
 * Verify a password against a stored hash
 * Also indicates if the hash should be upgraded
 */
export async function verifyPassword(
  plainPassword: string,
  storedHash: string,
): Promise<VerifyResult> {
  const isValid = await bcrypt.compare(plainPassword, storedHash);

  // Check if hash uses outdated cost factor
  const currentCost = extractCostFactor(storedHash);
  const needsRehash = currentCost < COST_FACTOR;

  return {
    isValid,
    needsRehash,
  };
}

/**
 * Extract cost factor from bcrypt hash
 */
export function extractCostFactor(hash: string): number {
  // Format: $2b$12$...
  const match = hash.match(/^\$2[aby]?\$(\d{2})\$/);

  if (!match) {
    throw new Error("Invalid bcrypt hash format");
  }

  return parseInt(match[1], 10);
}

/**
 * Perform timing-safe comparison for authentication
 * Use this when user is not found to prevent timing attacks
 */
export async function dummyVerification(): Promise<void> {
  // This hash is never valid, but takes same time as real verification
  const dummyHash =
    "$2b$12$LQv3c1yqBWVHxkd0LHAkuOedF/OkDC0YUDUDzWRzB6xvVtFbYgL6C";
  await bcrypt.compare("dummy", dummyHash);
}
```

### Step 3: Add Utility Functions

```typescript
// src/utils/password.util.ts (continued)

/**
 * Check if a password has been previously compromised
 * Uses the HaveIBeenPwned API (k-anonymity model)
 */
export async function checkPwnedPassword(password: string): Promise<boolean> {
  const crypto = await import("crypto");

  // SHA-1 hash of password
  const sha1 = crypto
    .createHash("sha1")
    .update(password)
    .digest("hex")
    .toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: { "Add-Padding": "true" }, // Privacy enhancement
      },
    );

    const text = await response.text();
    const lines = text.split("\n");

    for (const line of lines) {
      const [hashSuffix, count] = line.split(":");
      if (hashSuffix === suffix && parseInt(count, 10) > 0) {
        return true; // Password is compromised
      }
    }

    return false;
  } catch (error) {
    // If API fails, don't block registration
    console.error("Pwned password check failed:", error);
    return false;
  }
}

/**
 * Generate a secure random password
 * Useful for password reset flows
 */
export function generateSecurePassword(length: number = 16): string {
  const crypto = require("crypto");
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

  let password = "";
  const randomBytes = crypto.randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }

  return password;
}
```

### Step 4: Create the JavaScript Version

```javascript
// src/utils/password.util.js
import bcrypt from "bcrypt";

const COST_FACTOR = parseInt(process.env.BCRYPT_COST_FACTOR || "12", 10);
const MIN_PASSWORD_LENGTH = 8;

export function validatePasswordStrength(password) {
  return password.length >= MIN_PASSWORD_LENGTH;
}

export async function hashPassword(plainPassword, config = {}) {
  const costFactor = config.costFactor ?? COST_FACTOR;
  const hash = await bcrypt.hash(plainPassword, costFactor);

  return {
    hash,
    costFactor,
  };
}

export async function verifyPassword(plainPassword, storedHash) {
  const isValid = await bcrypt.compare(plainPassword, storedHash);
  const currentCost = extractCostFactor(storedHash);
  const needsRehash = currentCost < COST_FACTOR;

  return {
    isValid,
    needsRehash,
  };
}

export function extractCostFactor(hash) {
  const match = hash.match(/^\$2[aby]?\$(\d{2})\$/);

  if (!match) {
    throw new Error("Invalid bcrypt hash format");
  }

  return parseInt(match[1], 10);
}

export async function dummyVerification() {
  const dummyHash =
    "$2b$12$LQv3c1yqBWVHxkd0LHAkuOedF/OkDC0YUDUDzWRzB6xvVtFbYgL6C";
  await bcrypt.compare("dummy", dummyHash);
}
```

---

## 🏋️ Practice: DevJobs Pro User Model with Hashed Passwords

Now let's implement this in DevJobs Pro using Drizzle ORM.

### Step 1: Define the User Schema

```typescript
// src/db/schema/users.ts
import { pgTable, text, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

export const userRoleEnum = pgEnum("user_role", [
  "seeker",
  "employer",
  "admin",
]);

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("seeker"),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### Step 2: Create User Service with Password Hashing

```typescript
// src/services/user.service.ts
import { eq } from "drizzle-orm";
import { db } from "../db";
import { users, NewUser, User } from "../db/schema/users";
import {
  hashPassword,
  verifyPassword,
  dummyVerification,
  validatePasswordStrength,
} from "../utils/password.util";
import { AppError } from "../errors/AppError";

export interface CreateUserDTO {
  email: string;
  password: string;
  role?: "seeker" | "employer" | "admin";
  firstName?: string;
  lastName?: string;
}

export interface AuthResult {
  user: Omit<User, "passwordHash">;
  needsRehash: boolean;
}

export class UserService {
  /**
   * Create a new user with hashed password
   */
  async createUser(data: CreateUserDTO): Promise<Omit<User, "passwordHash">> {
    // Validate password strength
    if (!validatePasswordStrength(data.password)) {
      throw new AppError("Password does not meet requirements", 400);
    }

    // Check if email already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, data.email.toLowerCase()),
    });

    if (existing) {
      throw new AppError("Email already registered", 409);
    }

    // Hash the password
    const { hash } = await hashPassword(data.password);

    // Insert user
    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email.toLowerCase(),
        passwordHash: hash,
        role: data.role || "seeker",
        firstName: data.firstName,
        lastName: data.lastName,
      })
      .returning();

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Authenticate user by email and password
   */
  async authenticateUser(
    email: string,
    password: string,
  ): Promise<AuthResult | null> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    // User not found - perform dummy verification to prevent timing attacks
    if (!user) {
      await dummyVerification();
      return null;
    }

    // Verify password
    const { isValid, needsRehash } = await verifyPassword(
      password,
      user.passwordHash,
    );

    if (!isValid) {
      return null;
    }

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      needsRehash,
    };
  }

  /**
   * Update password hash (for cost factor migration)
   */
  async updatePasswordHash(userId: string, newHash: string): Promise<void> {
    await db
      .update(users)
      .set({
        passwordHash: newHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  /**
   * Change user password (requires old password)
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return false;
    }

    // Verify old password
    const { isValid } = await verifyPassword(oldPassword, user.passwordHash);

    if (!isValid) {
      return false;
    }

    // Validate new password
    if (!validatePasswordStrength(newPassword)) {
      throw new AppError("New password does not meet requirements", 400);
    }

    // Hash and update
    const { hash } = await hashPassword(newPassword);
    await this.updatePasswordHash(userId, hash);

    return true;
  }
}

export const userService = new UserService();
```

### Step 3: Create Auth Controller

```typescript
// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";
import { hashPassword } from "../utils/password.util";
import { AppError } from "../errors/AppError";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, role, firstName, lastName } = req.body;

      const user = await userService.createUser({
        email,
        password,
        role,
        firstName,
        lastName,
      });

      res.status(201).json({
        status: "success",
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await userService.authenticateUser(email, password);

      if (!result) {
        throw new AppError("Invalid email or password", 401);
      }

      // Handle password hash migration if needed
      if (result.needsRehash) {
        const { hash } = await hashPassword(password);
        await userService.updatePasswordHash(result.user.id, hash);
      }

      // TODO: Generate JWT (next lesson)

      res.json({
        status: "success",
        data: { user: result.user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
```

---

## 💡 Pro Tips vs Junior Traps

| Pro Tip                                              | Junior Trap                                                |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| Use cost factor 12+ (tune for ~250ms hash time)      | Using low cost factor (8-10) "for performance"             |
| Verify password timing-safely even for missing users | Short-circuit when user not found (enables timing attacks) |
| Never log passwords, even partially or hashed        | `console.log('Password:', password)` in dev mode           |
| Store only the hash, never the salt separately       | Storing salt in separate column (bcrypt embeds it)         |
| Upgrade cost factor during successful logins         | Forcing all users to reset passwords for cost migration    |
| Type password fields as `string`, never store        | Using `any` type for password variables                    |
| Validate password strength server-side               | Only validating on frontend                                |
| Rate limit login attempts                            | Allowing unlimited authentication attempts                 |

---

## 🔧 5-Minute Debugger

### "Password comparison always fails"

```typescript
// ❌ WRONG: Comparing hash to hash
const hash1 = await bcrypt.hash(password, 12);
const hash2 = await bcrypt.hash(password, 12);
console.log(hash1 === hash2); // false! Different salts

// ✅ CORRECT: Compare plain password to hash
const isValid = await bcrypt.compare(password, storedHash);
```

### "Async vs Sync bcrypt"

```typescript
// ❌ WRONG: Using sync in async context (blocks event loop)
app.post("/login", (req, res) => {
  const hash = bcrypt.hashSync(password, 12); // BLOCKS for ~250ms!
});

// ✅ CORRECT: Use async version
app.post("/login", async (req, res) => {
  const hash = await bcrypt.hash(password, 12); // Non-blocking
});
```

### "Hash format is invalid"

```typescript
// ❌ WRONG: Truncated hash in database column
// VARCHAR(50) - bcrypt hashes are 60 characters!

// ✅ CORRECT: Use appropriate column size
passwordHash: text("password_hash"); // or VARCHAR(60) minimum
```

### "bcrypt is too slow in tests"

```typescript
// In test environment, use lower cost factor
// .env.test
BCRYPT_COST_FACTOR = 4;

// Or mock bcrypt in tests
jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("$2b$04$mockhash"),
  compare: jest.fn().mockResolvedValue(true),
}));
```

---

## ✅ Definition of Done Checklist

Before moving to the next lesson, verify:

- [ ] bcrypt is installed with TypeScript types
- [ ] Password utility module exports `hashPassword` and `verifyPassword`
- [ ] Cost factor is configurable via environment variable
- [ ] Password strength validation is implemented
- [ ] User service correctly hashes passwords on registration
- [ ] Login authentication uses timing-safe comparison
- [ ] User not found case performs dummy verification
- [ ] Cost factor migration is implemented for login flow
- [ ] Password hash column is at least 60 characters
- [ ] No password logging anywhere in codebase
- [ ] Unit tests pass for password utilities

```bash
# Quick verification commands
npm test -- --grep "password"
grep -r "console.log.*password" src/ # Should return nothing
```

---

## 🔗 Navigation

[← Module 11 Overview](./README.md) | [Lesson 2: JWT Fundamentals →](./02-jwt-fundamentals.md)

---

## 📚 Additional Resources

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [bcrypt npm package](https://www.npmjs.com/package/bcrypt)
- [Have I Been Pwned API](https://haveibeenpwned.com/API/v3)
- [Argon2 vs bcrypt comparison](https://www.password-hashing.net/)

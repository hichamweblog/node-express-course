# Lesson 2: JWT Fundamentals

## 🎯 Hook: Stateless Authentication—The Modern API Approach

Imagine every request to your API required a database lookup to verify who's making it. With thousands of requests per second, your session table becomes a bottleneck, your database groans, and your scaling options shrink.

Enter **JSON Web Tokens (JWT)**—self-contained, cryptographically signed tokens that let your servers verify identity without touching a database. The user _carries_ their proof of identity with them.

But JWTs are a double-edged sword. Used correctly, they're elegant and scalable. Used incorrectly, they're a security nightmare. In this lesson, you'll learn to wield them like a senior engineer.

---

## 📚 Theory: Understanding JWT Architecture

### What is a JWT?

A JWT (pronounced "jot") is a compact, URL-safe string that represents claims between two parties. It's like a digitally signed ID card that the server can verify without looking anything up.

```
┌─────────────────────────────────────────────────────────────────┐
│                    JWT STRUCTURE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.                        │
│   eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ.              │
│   SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c                  │
│                                                                 │
│   └──────────────┬────────────────┘.└─────┬──────┘.└────┬─────┘ │
│               HEADER              PAYLOAD          SIGNATURE    │
│                                                                 │
│   Three parts, separated by dots (.)                           │
│   Each part is Base64URL encoded                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### The Three Parts Explained

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. HEADER                                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Decoded:                                                      │
│   {                                                             │
│     "alg": "HS256",    // Signing algorithm                    │
│     "typ": "JWT"       // Token type                           │
│   }                                                             │
│                                                                 │
│   Purpose: Tells the verifier how the token was signed         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    2. PAYLOAD (Claims)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Decoded:                                                      │
│   {                                                             │
│     "sub": "user_123",           // Subject (user ID)          │
│     "email": "alice@email.com",  // Custom claim               │
│     "role": "employer",          // Custom claim               │
│     "iat": 1706601600,           // Issued at (Unix time)      │
│     "exp": 1706605200            // Expires at (Unix time)     │
│   }                                                             │
│                                                                 │
│   Standard Claims:                                              │
│   • iss (issuer): Who created the token                        │
│   • sub (subject): Who the token is about                      │
│   • aud (audience): Who the token is for                       │
│   • exp (expiration): When it expires                          │
│   • iat (issued at): When it was created                       │
│   • nbf (not before): When it becomes valid                    │
│                                                                 │
│   ⚠️  PAYLOAD IS NOT ENCRYPTED - Anyone can read it!           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    3. SIGNATURE                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Creation:                                                     │
│   HMACSHA256(                                                   │
│     base64UrlEncode(header) + "." + base64UrlEncode(payload),  │
│     secret                                                      │
│   )                                                             │
│                                                                 │
│   Purpose:                                                      │
│   • Proves the token wasn't tampered with                      │
│   • Proves the token was issued by someone with the secret     │
│   • If any bit of header/payload changes, signature invalid    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Signing Algorithms: HS256 vs RS256

```
┌─────────────────────────────────────────────────────────────────┐
│                 SIGNING ALGORITHMS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   HS256 (HMAC with SHA-256) - Symmetric                        │
│   ─────────────────────────────────────────                    │
│   ┌─────────────┐                    ┌─────────────┐           │
│   │   Server    │  Same secret key   │   Server    │           │
│   │   (Sign)    │ ◄────────────────► │   (Verify)  │           │
│   └─────────────┘                    └─────────────┘           │
│                                                                 │
│   Pros:                          Cons:                         │
│   • Simpler setup                • Secret must be shared       │
│   • Faster computation           • Can't have public verifiers │
│   • Single key to manage         • Harder in microservices     │
│                                                                 │
│   Best for: Monoliths, simple APIs, same-service tokens        │
│                                                                 │
│   ─────────────────────────────────────────────────────────    │
│                                                                 │
│   RS256 (RSA with SHA-256) - Asymmetric                        │
│   ─────────────────────────────────────────                    │
│   ┌─────────────┐                    ┌─────────────┐           │
│   │   Server    │  Private key       │   Anyone    │           │
│   │   (Sign)    │ ─────────────────► │   (Verify)  │           │
│   └─────────────┘                    └──────┬──────┘           │
│                                             │                   │
│                                      Public key                │
│                                                                 │
│   Pros:                          Cons:                         │
│   • Public key can be shared     • More complex setup          │
│   • Multiple verifiers           • Slower computation          │
│   • Better for microservices     • Key rotation harder         │
│                                                                 │
│   Best for: Microservices, third-party verification, OIDC     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Access Tokens vs Refresh Tokens

```
┌─────────────────────────────────────────────────────────────────┐
│              ACCESS vs REFRESH TOKENS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ACCESS TOKEN                    REFRESH TOKEN                │
│   ────────────────────           ────────────────────          │
│   • Short-lived (15-60 min)      • Long-lived (7-30 days)     │
│   • Used for API requests        • Used to get new access      │
│   • Stored in memory (JS)        • Stored in httpOnly cookie   │
│   • Sent in Authorization        • Sent to /refresh endpoint   │
│   • Contains user claims         • Contains minimal info       │
│   • Stateless verification       • May need DB lookup          │
│                                                                 │
│   ─────────────────────────────────────────────────────────    │
│                                                                 │
│   WHY TWO TOKENS?                                              │
│                                                                 │
│   Security vs UX Trade-off:                                    │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ If access token leaks:                                  │  │
│   │ • Attacker has 15 minutes (short window)               │  │
│   │ • Can't use it to get more tokens                      │  │
│   │                                                         │  │
│   │ If refresh token leaks:                                │  │
│   │ • Stored in httpOnly cookie (harder to steal via XSS)  │  │
│   │ • Can be revoked server-side                           │  │
│   │ • Rotation invalidates old token                       │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Token-Based Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                TOKEN-BASED AUTH FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   CLIENT                           SERVER                       │
│   ────────                         ──────                       │
│                                                                 │
│   1. LOGIN                                                      │
│   ┌─────────────┐                  ┌─────────────────────────┐ │
│   │ POST /login │                  │ Verify credentials      │ │
│   │ email, pass │ ───────────────► │ Generate tokens         │ │
│   └─────────────┘                  │ Return access + refresh │ │
│                                    └───────────┬─────────────┘ │
│   ┌─────────────┐                              │               │
│   │ Store tokens│ ◄────────────────────────────┘               │
│   │ Access: mem │                                              │
│   │ Refresh:    │                                              │
│   │   cookie    │                                              │
│   └─────────────┘                                              │
│                                                                 │
│   2. API REQUEST                                               │
│   ┌─────────────┐                  ┌─────────────────────────┐ │
│   │GET /api/jobs│                  │ Extract token from      │ │
│   │Authorization│ ───────────────► │   Authorization header  │ │
│   │Bearer <JWT> │                  │ Verify signature        │ │
│   └─────────────┘                  │ Check expiration        │ │
│                                    │ Extract user claims     │ │
│   ┌─────────────┐                  │ Process request         │ │
│   │   Response  │ ◄────────────────┴─────────────────────────┘ │
│   └─────────────┘                                              │
│                                                                 │
│   3. TOKEN REFRESH (when access token expires)                 │
│   ┌─────────────┐                  ┌─────────────────────────┐ │
│   │POST /refresh│                  │ Verify refresh token    │ │
│   │Cookie sent  │ ───────────────► │ Generate NEW access     │ │
│   │automatically│                  │ Rotate refresh token    │ │
│   └─────────────┘                  └───────────┬─────────────┘ │
│                                                │               │
│   ┌─────────────┐                              │               │
│   │Update tokens│ ◄────────────────────────────┘               │
│   └─────────────┘                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Token Storage Security

```
┌─────────────────────────────────────────────────────────────────┐
│                TOKEN STORAGE OPTIONS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   STORAGE METHOD          XSS RISK    CSRF RISK    RECOMMEND   │
│   ──────────────────────  ─────────   ─────────    ──────────  │
│   localStorage            HIGH ❌      None          No         │
│   sessionStorage          HIGH ❌      None          No         │
│   JS variable (memory)    Low ✓       None          Access ✓   │
│   httpOnly cookie         None ✓      HIGH ❌       Refresh ✓  │
│   httpOnly + SameSite     None ✓      Low ✓        Best ✓✓    │
│                                                                 │
│   RECOMMENDED PATTERN:                                         │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ Access Token:  In-memory JavaScript variable           │  │
│   │ Refresh Token: httpOnly cookie with SameSite=Strict    │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   Why not localStorage?                                        │
│   • Any JavaScript can read it                                 │
│   • XSS attack = token stolen = account compromised           │
│   • Scripts from CDNs, ads, or injected code have full access │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 Code Examples

### Basic JWT Operations

**JavaScript:**

```javascript
// jwt-basics.js
import jwt from "jsonwebtoken";

// Secret key (in production, use environment variable)
const SECRET = process.env.JWT_SECRET || "your-256-bit-secret";

// Sign (create) a JWT
function signToken(payload, expiresIn = "15m") {
  return jwt.sign(payload, SECRET, {
    expiresIn,
    algorithm: "HS256",
  });
}

// Verify a JWT
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET, {
      algorithms: ["HS256"], // Explicitly specify allowed algorithms
    });
    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Decode WITHOUT verification (useful for debugging)
function decodeToken(token) {
  // ⚠️ NEVER trust decoded data without verification!
  return jwt.decode(token, { complete: true });
}

// Usage
const payload = {
  sub: "user_123",
  email: "alice@email.com",
  role: "employer",
};

const token = signToken(payload);
console.log("Token:", token);

// Later...
const result = verifyToken(token);
if (result.valid) {
  console.log("User:", result.decoded.sub);
  console.log("Role:", result.decoded.role);
}
```

**TypeScript:**

```typescript
// jwt-basics.ts
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "your-256-bit-secret";

interface TokenPayload extends JwtPayload {
  sub: string;
  email: string;
  role: "seeker" | "employer" | "admin";
}

interface VerifyResult {
  valid: boolean;
  decoded?: TokenPayload;
  error?: string;
}

function signToken(
  payload: Omit<TokenPayload, "iat" | "exp">,
  expiresIn: string = "15m",
): string {
  const options: SignOptions = {
    expiresIn,
    algorithm: "HS256",
  };

  return jwt.sign(payload, SECRET, options);
}

function verifyToken(token: string): VerifyResult {
  try {
    const decoded = jwt.verify(token, SECRET, {
      algorithms: ["HS256"],
    }) as TokenPayload;

    return { valid: true, decoded };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Usage
const payload: Omit<TokenPayload, "iat" | "exp"> = {
  sub: "user_123",
  email: "alice@email.com",
  role: "employer",
};

const token = signToken(payload);
const result = verifyToken(token);

if (result.valid && result.decoded) {
  console.log("User ID:", result.decoded.sub);
}
```

### Handling Token Expiration

**JavaScript:**

```javascript
// token-expiration.js
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

function verifyTokenWithExpiration(token) {
  try {
    const decoded = jwt.verify(token, SECRET);
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      // Token was valid but is now expired
      // Decode it to get the payload (for potential refresh)
      const decoded = jwt.decode(token);
      return {
        valid: false,
        expired: true,
        expiredAt: error.expiredAt,
        decoded, // Still useful for refresh flow
      };
    }

    if (error.name === "JsonWebTokenError") {
      // Token is malformed or invalid signature
      return {
        valid: false,
        expired: false,
        error: error.message,
      };
    }

    // NotBeforeError or other
    return {
      valid: false,
      expired: false,
      error: error.message,
    };
  }
}

// Usage in middleware
function handleTokenResult(result, res, next) {
  if (result.valid) {
    return next(); // Continue
  }

  if (result.expired) {
    // Client should refresh
    return res.status(401).json({
      error: "TOKEN_EXPIRED",
      message: "Access token expired, please refresh",
      expiredAt: result.expiredAt,
    });
  }

  // Invalid token
  return res.status(401).json({
    error: "INVALID_TOKEN",
    message: result.error,
  });
}
```

**TypeScript:**

```typescript
// token-expiration.ts
import jwt, {
  JwtPayload,
  TokenExpiredError,
  JsonWebTokenError,
} from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

interface TokenVerifyResult {
  valid: boolean;
  expired: boolean;
  decoded?: JwtPayload;
  expiredAt?: Date;
  error?: string;
}

function verifyTokenWithExpiration(token: string): TokenVerifyResult {
  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      const decoded = jwt.decode(token) as JwtPayload | null;
      return {
        valid: false,
        expired: true,
        expiredAt: error.expiredAt,
        decoded: decoded ?? undefined,
      };
    }

    if (error instanceof JsonWebTokenError) {
      return {
        valid: false,
        expired: false,
        error: error.message,
      };
    }

    return {
      valid: false,
      expired: false,
      error: "Unknown token error",
    };
  }
}
```

### Refresh Token Rotation

**JavaScript:**

```javascript
// token-rotation.js
import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// In-memory store (use Redis in production)
const refreshTokenStore = new Map();

function generateTokenPair(user) {
  // Access token - short lived, contains claims
  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: "access",
    },
    ACCESS_SECRET,
    { expiresIn: "15m" },
  );

  // Refresh token - long lived, minimal claims
  const refreshTokenId = crypto.randomUUID();
  const refreshToken = jwt.sign(
    {
      sub: user.id,
      jti: refreshTokenId, // Unique ID for this refresh token
      type: "refresh",
    },
    REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  // Store refresh token ID for revocation checking
  refreshTokenStore.set(refreshTokenId, {
    userId: user.id,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
}

async function rotateTokens(oldRefreshToken) {
  // Verify the refresh token
  let decoded;
  try {
    decoded = jwt.verify(oldRefreshToken, REFRESH_SECRET);
  } catch (error) {
    throw new Error("Invalid refresh token");
  }

  // Check if token has been revoked
  if (!refreshTokenStore.has(decoded.jti)) {
    // Token was already used or revoked - possible theft!
    // Revoke ALL tokens for this user (security measure)
    revokeAllUserTokens(decoded.sub);
    throw new Error("Refresh token reuse detected");
  }

  // Revoke the old refresh token (one-time use)
  refreshTokenStore.delete(decoded.jti);

  // Get user data (from DB in production)
  const user = await getUserById(decoded.sub);

  // Generate new pair
  return generateTokenPair(user);
}

function revokeAllUserTokens(userId) {
  for (const [tokenId, data] of refreshTokenStore.entries()) {
    if (data.userId === userId) {
      refreshTokenStore.delete(tokenId);
    }
  }
}

// Mock function
async function getUserById(id) {
  return { id, email: "user@email.com", role: "seeker" };
}
```

**TypeScript:**

```typescript
// token-rotation.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

interface User {
  id: string;
  email: string;
  role: "seeker" | "employer" | "admin";
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenData {
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

interface RefreshPayload extends JwtPayload {
  sub: string;
  jti: string;
  type: "refresh";
}

// Use Redis in production
const refreshTokenStore = new Map<string, RefreshTokenData>();

function generateTokenPair(user: User): TokenPair {
  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: "access",
    },
    ACCESS_SECRET,
    { expiresIn: "15m" },
  );

  const refreshTokenId = crypto.randomUUID();
  const refreshToken = jwt.sign(
    {
      sub: user.id,
      jti: refreshTokenId,
      type: "refresh",
    },
    REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  refreshTokenStore.set(refreshTokenId, {
    userId: user.id,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return { accessToken, refreshToken };
}

async function rotateTokens(oldRefreshToken: string): Promise<TokenPair> {
  let decoded: RefreshPayload;

  try {
    decoded = jwt.verify(oldRefreshToken, REFRESH_SECRET) as RefreshPayload;
  } catch {
    throw new Error("Invalid refresh token");
  }

  if (!refreshTokenStore.has(decoded.jti)) {
    revokeAllUserTokens(decoded.sub);
    throw new Error("Refresh token reuse detected");
  }

  refreshTokenStore.delete(decoded.jti);

  const user = await getUserById(decoded.sub);
  return generateTokenPair(user);
}

function revokeAllUserTokens(userId: string): void {
  for (const [tokenId, data] of refreshTokenStore.entries()) {
    if (data.userId === userId) {
      refreshTokenStore.delete(tokenId);
    }
  }
}

async function getUserById(id: string): Promise<User> {
  // DB lookup in production
  return { id, email: "user@email.com", role: "seeker" };
}

export { generateTokenPair, rotateTokens, revokeAllUserTokens };
```

---

## 🔨 Mini-Tutorial: JWT Utility Module

Let's build a production-ready JWT utility for DevJobs Pro.

### Step 1: Configuration and Types

```typescript
// src/utils/jwt.util.ts
import jwt, { JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";
import crypto from "crypto";

// Configuration from environment
const config = {
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  refreshSecret: process.env.JWT_REFRESH_SECRET!,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  issuer: process.env.JWT_ISSUER || "devjobs-pro",
};

// Validate config on startup
if (!config.accessSecret || config.accessSecret.length < 32) {
  throw new Error("JWT_ACCESS_SECRET must be at least 32 characters");
}
if (!config.refreshSecret || config.refreshSecret.length < 32) {
  throw new Error("JWT_REFRESH_SECRET must be at least 32 characters");
}

// Type definitions
export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  role: "seeker" | "employer" | "admin";
  type: "access";
}

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  jti: string;
  type: "refresh";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
}

export interface VerifyResult<T> {
  valid: boolean;
  expired: boolean;
  payload?: T;
  error?: string;
}
```

### Step 2: Token Generation Functions

```typescript
// src/utils/jwt.util.ts (continued)

/**
 * Parse duration string to milliseconds
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid duration: ${duration}`);

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
}

/**
 * Sign an access token
 */
export function signAccessToken(payload: {
  userId: string;
  email: string;
  role: "seeker" | "employer" | "admin";
}): { token: string; expiresAt: Date } {
  const expiresAt = new Date(
    Date.now() + parseDuration(config.accessExpiresIn),
  );

  const options: SignOptions = {
    expiresIn: config.accessExpiresIn,
    algorithm: "HS256",
    issuer: config.issuer,
  };

  const token = jwt.sign(
    {
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
      type: "access",
    },
    config.accessSecret,
    options,
  );

  return { token, expiresAt };
}

/**
 * Sign a refresh token
 */
export function signRefreshToken(userId: string): {
  token: string;
  tokenId: string;
  expiresAt: Date;
} {
  const tokenId = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + parseDuration(config.refreshExpiresIn),
  );

  const options: SignOptions = {
    expiresIn: config.refreshExpiresIn,
    algorithm: "HS256",
    issuer: config.issuer,
  };

  const token = jwt.sign(
    {
      sub: userId,
      jti: tokenId,
      type: "refresh",
    },
    config.refreshSecret,
    options,
  );

  return { token, tokenId, expiresAt };
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokenPair(user: {
  id: string;
  email: string;
  role: "seeker" | "employer" | "admin";
}): TokenPair & { refreshTokenId: string } {
  const access = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refresh = signRefreshToken(user.id);

  return {
    accessToken: access.token,
    refreshToken: refresh.token,
    refreshTokenId: refresh.tokenId,
    accessExpiresAt: access.expiresAt,
    refreshExpiresAt: refresh.expiresAt,
  };
}
```

### Step 3: Token Verification Functions

```typescript
// src/utils/jwt.util.ts (continued)

/**
 * Verify an access token
 */
export function verifyAccessToken(
  token: string,
): VerifyResult<AccessTokenPayload> {
  const options: VerifyOptions = {
    algorithms: ["HS256"],
    issuer: config.issuer,
  };

  try {
    const payload = jwt.verify(
      token,
      config.accessSecret,
      options,
    ) as AccessTokenPayload;

    // Ensure it's an access token
    if (payload.type !== "access") {
      return { valid: false, expired: false, error: "Invalid token type" };
    }

    return { valid: true, expired: false, payload };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, expired: true, error: "Token expired" };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, expired: false, error: error.message };
    }
    return { valid: false, expired: false, error: "Token verification failed" };
  }
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(
  token: string,
): VerifyResult<RefreshTokenPayload> {
  const options: VerifyOptions = {
    algorithms: ["HS256"],
    issuer: config.issuer,
  };

  try {
    const payload = jwt.verify(
      token,
      config.refreshSecret,
      options,
    ) as RefreshTokenPayload;

    if (payload.type !== "refresh") {
      return { valid: false, expired: false, error: "Invalid token type" };
    }

    return { valid: true, expired: false, payload };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, expired: true, error: "Refresh token expired" };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, expired: false, error: error.message };
    }
    return { valid: false, expired: false, error: "Token verification failed" };
  }
}

/**
 * Decode token without verification (for debugging only!)
 */
export function decodeToken(token: string): JwtPayload | null {
  return jwt.decode(token) as JwtPayload | null;
}
```

### Step 4: JavaScript Version

```javascript
// src/utils/jwt.util.js
import jwt from "jsonwebtoken";
import crypto from "crypto";

const config = {
  accessSecret: process.env.JWT_ACCESS_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  issuer: process.env.JWT_ISSUER || "devjobs-pro",
};

function parseDuration(duration) {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid duration: ${duration}`);

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };

  return value * multipliers[unit];
}

export function signAccessToken(payload) {
  const expiresAt = new Date(
    Date.now() + parseDuration(config.accessExpiresIn),
  );

  const token = jwt.sign(
    {
      sub: payload.userId,
      email: payload.email,
      role: payload.role,
      type: "access",
    },
    config.accessSecret,
    {
      expiresIn: config.accessExpiresIn,
      algorithm: "HS256",
      issuer: config.issuer,
    },
  );

  return { token, expiresAt };
}

export function signRefreshToken(userId) {
  const tokenId = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + parseDuration(config.refreshExpiresIn),
  );

  const token = jwt.sign(
    { sub: userId, jti: tokenId, type: "refresh" },
    config.refreshSecret,
    {
      expiresIn: config.refreshExpiresIn,
      algorithm: "HS256",
      issuer: config.issuer,
    },
  );

  return { token, tokenId, expiresAt };
}

export function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, config.accessSecret, {
      algorithms: ["HS256"],
      issuer: config.issuer,
    });

    if (payload.type !== "access") {
      return { valid: false, expired: false, error: "Invalid token type" };
    }

    return { valid: true, expired: false, payload };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { valid: false, expired: true, error: "Token expired" };
    }
    return { valid: false, expired: false, error: error.message };
  }
}

export function verifyRefreshToken(token) {
  try {
    const payload = jwt.verify(token, config.refreshSecret, {
      algorithms: ["HS256"],
      issuer: config.issuer,
    });

    if (payload.type !== "refresh") {
      return { valid: false, expired: false, error: "Invalid token type" };
    }

    return { valid: true, expired: false, payload };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return { valid: false, expired: true, error: "Refresh token expired" };
    }
    return { valid: false, expired: false, error: error.message };
  }
}
```

---

## 🏋️ Practice: DevJobs Pro Auth Service

Implement the complete auth service with access and refresh token management.

### Step 1: Refresh Token Storage Schema

```typescript
// src/db/schema/refresh-tokens.ts
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const refreshTokens = pgTable("refresh_tokens", {
  id: text("id").primaryKey(), // The jti from the token
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  revoked: boolean("revoked").default(false).notNull(),
  revokedAt: timestamp("revoked_at"),
  revokedReason: text("revoked_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userAgent: text("user_agent"), // Track device
  ipAddress: text("ip_address"), // Track location
});

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type NewRefreshToken = typeof refreshTokens.$inferInsert;
```

### Step 2: Auth Service Implementation

```typescript
// src/services/auth.service.ts
import { eq, and, lt } from "drizzle-orm";
import { db } from "../db";
import { users, User } from "../db/schema/users";
import { refreshTokens } from "../db/schema/refresh-tokens";
import {
  hashPassword,
  verifyPassword,
  dummyVerification,
} from "../utils/password.util";
import { generateTokenPair, verifyRefreshToken } from "../utils/jwt.util";
import { AppError } from "../errors/AppError";

export interface LoginResult {
  user: Omit<User, "passwordHash">;
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date;
}

export interface RegisterDTO {
  email: string;
  password: string;
  role?: "seeker" | "employer";
  firstName?: string;
  lastName?: string;
}

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterDTO): Promise<LoginResult> {
    // Check existing user
    const existing = await db.query.users.findFirst({
      where: eq(users.email, data.email.toLowerCase()),
    });

    if (existing) {
      throw new AppError("Email already registered", 409);
    }

    // Hash password
    const { hash } = await hashPassword(data.password);

    // Create user
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

    // Generate tokens
    const tokens = generateTokenPair({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Store refresh token
    await db.insert(refreshTokens).values({
      id: tokens.refreshTokenId,
      userId: newUser.id,
      expiresAt: tokens.refreshExpiresAt,
    });

    const { passwordHash, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessExpiresAt: tokens.accessExpiresAt,
    };
  }

  /**
   * Authenticate user and return tokens
   */
  async login(
    email: string,
    password: string,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<LoginResult> {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    // Timing attack prevention
    if (!user) {
      await dummyVerification();
      throw new AppError("Invalid email or password", 401);
    }

    // Verify password
    const { isValid, needsRehash } = await verifyPassword(
      password,
      user.passwordHash,
    );

    if (!isValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Rehash if needed (cost factor upgrade)
    if (needsRehash) {
      const { hash } = await hashPassword(password);
      await db
        .update(users)
        .set({ passwordHash: hash, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }

    // Generate tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Store refresh token with metadata
    await db.insert(refreshTokens).values({
      id: tokens.refreshTokenId,
      userId: user.id,
      expiresAt: tokens.refreshExpiresAt,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
    });

    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessExpiresAt: tokens.accessExpiresAt,
    };
  }

  /**
   * Refresh tokens using refresh token
   */
  async refresh(
    refreshToken: string,
    metadata?: { userAgent?: string; ipAddress?: string },
  ): Promise<Omit<LoginResult, "user"> & { userId: string }> {
    // Verify refresh token
    const result = verifyRefreshToken(refreshToken);

    if (!result.valid || !result.payload) {
      throw new AppError("Invalid refresh token", 401);
    }

    const { sub: userId, jti: tokenId } = result.payload;

    // Check if token exists and is not revoked
    const storedToken = await db.query.refreshTokens.findFirst({
      where: and(
        eq(refreshTokens.id, tokenId),
        eq(refreshTokens.revoked, false),
      ),
    });

    if (!storedToken) {
      // Token reuse detected! Revoke all tokens for this user
      await this.revokeAllUserTokens(userId, "Token reuse detected");
      throw new AppError("Refresh token has been revoked", 401);
    }

    // Revoke old token
    await db
      .update(refreshTokens)
      .set({ revoked: true, revokedAt: new Date(), revokedReason: "Rotated" })
      .where(eq(refreshTokens.id, tokenId));

    // Get user for new token
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Generate new tokens
    const tokens = generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Store new refresh token
    await db.insert(refreshTokens).values({
      id: tokens.refreshTokenId,
      userId: user.id,
      expiresAt: tokens.refreshExpiresAt,
      userAgent: metadata?.userAgent,
      ipAddress: metadata?.ipAddress,
    });

    return {
      userId: user.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessExpiresAt: tokens.accessExpiresAt,
    };
  }

  /**
   * Logout - revoke refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    const result = verifyRefreshToken(refreshToken);

    if (result.valid && result.payload) {
      await db
        .update(refreshTokens)
        .set({ revoked: true, revokedAt: new Date(), revokedReason: "Logout" })
        .where(eq(refreshTokens.id, result.payload.jti));
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string, reason: string): Promise<void> {
    await db
      .update(refreshTokens)
      .set({ revoked: true, revokedAt: new Date(), revokedReason: reason })
      .where(
        and(eq(refreshTokens.userId, userId), eq(refreshTokens.revoked, false)),
      );
  }

  /**
   * Clean up expired tokens (run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, new Date()))
      .returning();

    return result.length;
  }
}

export const authService = new AuthService();
```

---

## 💡 Pro Tips vs Junior Traps

| Pro Tip                                                   | Junior Trap                                                    |
| --------------------------------------------------------- | -------------------------------------------------------------- |
| Keep access tokens small (~1KB) - sent with every request | Stuffing permissions array, user profile, preferences in token |
| Store refresh tokens in httpOnly cookies                  | Storing refresh tokens in localStorage                         |
| Use short access token expiry (15 min)                    | Long access tokens "for convenience" (1 day+)                  |
| Rotate refresh tokens on use                              | Reusing same refresh token for weeks                           |
| Use separate secrets for access/refresh                   | Same secret for all token types                                |
| Explicitly specify `algorithms: ['HS256']`                | Relying on default algorithm detection (enables attacks!)      |
| Validate token `type` claim                               | Only checking signature validity                               |
| Separate endpoints for access and refresh                 | Using same endpoint/flow for both                              |

---

## 🔧 5-Minute Debugger

### "jwt malformed" Error

```typescript
// ❌ WRONG: Token has extra characters
const token = "Bearer eyJhbG..."; // Don't include 'Bearer '
jwt.verify(token, secret); // → jwt malformed

// ✅ CORRECT: Extract just the token
const authHeader = req.headers.authorization;
const token = authHeader?.split(" ")[1]; // Get part after 'Bearer '
jwt.verify(token, secret);
```

### "invalid signature" Error

```typescript
// ❌ WRONG: Different secrets
const token = jwt.sign(payload, "secret-1");
jwt.verify(token, "secret-2"); // → invalid signature

// ❌ WRONG: Verifying access with refresh secret
jwt.verify(accessToken, REFRESH_SECRET); // → invalid signature

// ✅ CORRECT: Same secret, correct type
const token = jwt.sign(payload, ACCESS_SECRET);
jwt.verify(token, ACCESS_SECRET);
```

### "token expired" Not Caught

```typescript
// ❌ WRONG: Generic catch hides expiration
try {
  jwt.verify(token, secret);
} catch (e) {
  res.status(401).json({ error: "Invalid token" }); // User can't refresh!
}

// ✅ CORRECT: Distinguish expiration from invalid
try {
  jwt.verify(token, secret);
} catch (e) {
  if (e instanceof jwt.TokenExpiredError) {
    res.status(401).json({ error: "TOKEN_EXPIRED", message: "Please refresh" });
  } else {
    res.status(401).json({ error: "INVALID_TOKEN" });
  }
}
```

### Clock Skew Issues

```typescript
// Tokens failing immediately after creation on different servers

// ✅ Add clock tolerance
jwt.verify(token, secret, {
  clockTolerance: 30, // Allow 30 seconds of clock difference
});
```

---

## ✅ Definition of Done Checklist

Before moving to the next lesson, verify:

- [ ] jsonwebtoken package installed with TypeScript types
- [ ] Separate secrets for access and refresh tokens (32+ chars each)
- [ ] JWT utility module exports sign and verify functions
- [ ] Access tokens expire in 15 minutes
- [ ] Refresh tokens expire in 7 days
- [ ] Refresh tokens are stored in database with revocation support
- [ ] Token rotation invalidates old refresh tokens
- [ ] Token reuse detection revokes all user tokens
- [ ] Explicit algorithm specification in verify options
- [ ] Token type validation (access vs refresh)
- [ ] Auth service implements login, register, refresh, logout
- [ ] Unit tests pass for JWT utilities

```bash
# Quick verification
npm test -- --grep "jwt"

# Check secrets are configured
node -e "console.log('Access:', !!process.env.JWT_ACCESS_SECRET)"
node -e "console.log('Refresh:', !!process.env.JWT_REFRESH_SECRET)"
```

---

## 🔗 Navigation

[← Lesson 1: Password Hashing](./01-password-hashing-bcrypt.md) | [Lesson 3: Auth Middleware →](./03-auth-middleware-protected-routes.md)

---

## 📚 Additional Resources

- [JWT.io - Debugger and Introduction](https://jwt.io/)
- [RFC 7519 - JSON Web Token](https://tools.ietf.org/html/rfc7519)
- [OWASP JWT Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Auth0 Blog - Refresh Token Rotation](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation)

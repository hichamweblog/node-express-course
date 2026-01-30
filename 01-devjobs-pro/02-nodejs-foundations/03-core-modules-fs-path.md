# Lesson 3: Core Modules—fs & path

## 🎯 Hook: Reading Files, Mastering Paths

Every backend application deals with files—configuration files, uploaded images, log files, templates. In DevJobs Pro, we'll read job data, write logs, handle resume uploads, and manage configuration. The `fs` (file system) and `path` modules are your daily drivers for all of this.

But here's the catch: file operations can **destroy your application's performance** if done wrong. This lesson teaches you the right way—async operations that keep your event loop healthy.

---

## 📚 Theory: File System Operations

### The fs Module Evolution

Node.js offers three styles of file operations:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FS MODULE STYLES                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. SYNCHRONOUS (Blocking)                                          │
│     ┌──────────────────────────────────────────────────────────┐    │
│     │ const data = fs.readFileSync('file.txt');                │    │
│     │ // Blocks entire thread until complete!                  │    │
│     │ // ❌ Never use in production servers                    │    │
│     └──────────────────────────────────────────────────────────┘    │
│                                                                      │
│  2. CALLBACK-BASED (Non-blocking, old style)                        │
│     ┌──────────────────────────────────────────────────────────┐    │
│     │ fs.readFile('file.txt', (err, data) => {                 │    │
│     │   if (err) throw err;                                    │    │
│     │   console.log(data);                                     │    │
│     │ });                                                      │    │
│     │ // ⚠️ Callback hell potential                            │    │
│     └──────────────────────────────────────────────────────────┘    │
│                                                                      │
│  3. PROMISE-BASED (Non-blocking, modern) ✅ RECOMMENDED             │
│     ┌──────────────────────────────────────────────────────────┐    │
│     │ import fs from 'node:fs/promises';                       │    │
│     │ const data = await fs.readFile('file.txt');              │    │
│     │ // Clean, async/await friendly                           │    │
│     │ // ✅ Use this in DevJobs Pro                            │    │
│     └──────────────────────────────────────────────────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### fs Operation Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│               ASYNC FILE READ LIFECYCLE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│     JavaScript                  libuv                  OS Kernel    │
│    (Main Thread)            (Thread Pool)                           │
│                                                                      │
│  ┌─────────────┐                                                    │
│  │ fs.readFile │                                                    │
│  │   called    │                                                    │
│  └──────┬──────┘                                                    │
│         │                                                           │
│         │ 1. Request                                                │
│         ▼                                                           │
│  ┌──────────────┐         ┌──────────────┐                         │
│  │ Add to libuv │─────────│  Thread Pool │                         │
│  │    queue     │         │  Worker picks│                         │
│  └──────────────┘         │  up the task │                         │
│         │                 └───────┬──────┘                         │
│         │                         │                                │
│         │ (Event loop continues   │ 2. Actual I/O                  │
│         │  processing other       │                                │
│         │  events)                ▼                                │
│         │                 ┌───────────────┐    ┌──────────────┐    │
│         │                 │ System call   │────│   Disk I/O   │    │
│         │                 │ (read())      │    │   operation  │    │
│         │                 └───────────────┘    └──────┬───────┘    │
│         │                                            │             │
│         │                         │ 3. Data returned │             │
│         │                         ▼                                │
│         │                 ┌───────────────┐                        │
│         │                 │ Callback added│                        │
│         │                 │ to poll queue │                        │
│         │                 └───────┬───────┘                        │
│         │                         │                                │
│         ▼◄────────────────────────┘                                │
│  ┌──────────────┐                                                  │
│  │   Callback   │ 4. Your code resumes                             │
│  │   executes   │    with file data                                │
│  └──────────────┘                                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### The path Module

Paths are tricky—different OS, different separators. The `path` module handles this:

```
┌─────────────────────────────────────────────────────────────────────┐
│                  PATH MODULE ESSENTIALS                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  path.join()  - Joins segments with correct separator               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ path.join('/users', 'alice', 'docs')                         │   │
│  │ Linux/Mac: '/users/alice/docs'                               │   │
│  │ Windows:   '\\users\\alice\\docs'                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  path.resolve() - Resolves to absolute path                         │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ path.resolve('src', 'utils')                                 │   │
│  │ Result: '/home/user/project/src/utils' (absolute!)           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  path.basename() - Get filename from path                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ path.basename('/uploads/resume.pdf')     → 'resume.pdf'      │   │
│  │ path.basename('/uploads/resume.pdf', '.pdf') → 'resume'      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  path.dirname() - Get directory from path                           │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ path.dirname('/uploads/resume.pdf')      → '/uploads'        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  path.extname() - Get file extension                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ path.extname('resume.pdf')               → '.pdf'            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  path.parse() - Parse path into components                          │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ path.parse('/uploads/resumes/alice.pdf')                     │   │
│  │ {                                                            │   │
│  │   root: '/',                                                 │   │
│  │   dir: '/uploads/resumes',                                   │   │
│  │   base: 'alice.pdf',                                         │   │
│  │   ext: '.pdf',                                               │   │
│  │   name: 'alice'                                              │   │
│  │ }                                                            │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Key fs Operations Reference

| Operation        | Method                   | Use Case                                 |
| ---------------- | ------------------------ | ---------------------------------------- |
| Read file        | `fs.readFile()`          | Load config, templates, data files       |
| Write file       | `fs.writeFile()`         | Save data, logs, generated content       |
| Append           | `fs.appendFile()`        | Add to logs, incrementally write         |
| Check exists     | `fs.access()`            | Verify file/dir exists before operations |
| Create directory | `fs.mkdir()`             | Setup upload folders, logs directories   |
| Read directory   | `fs.readdir()`           | List files, scan directories             |
| Delete file      | `fs.unlink()`            | Remove temporary files, cleanup          |
| Delete directory | `fs.rmdir()` / `fs.rm()` | Clean up directories                     |
| File stats       | `fs.stat()`              | Get size, creation time, type            |
| Rename/move      | `fs.rename()`            | Move uploaded files to final location    |
| Copy             | `fs.copyFile()`          | Backup files, duplicate templates        |

---

## 💻 Code Examples

### Example 1: Reading Files (Three Ways)

**JavaScript:**

```javascript
// ============= Synchronous (DON'T use in servers!) =============
import { readFileSync } from "node:fs";

try {
  const data = readFileSync("./config.json", "utf8");
  const config = JSON.parse(data);
  console.log(config);
} catch (err) {
  console.error("Failed to read config:", err.message);
}

// ============= Callback-based (Legacy) =============
import { readFile } from "node:fs";

readFile("./config.json", "utf8", (err, data) => {
  if (err) {
    console.error("Failed to read config:", err.message);
    return;
  }
  const config = JSON.parse(data);
  console.log(config);
});

// ============= Promise-based (RECOMMENDED) =============
import { readFile } from "node:fs/promises";

async function loadConfig() {
  try {
    const data = await readFile("./config.json", "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log("Config not found, using defaults");
      return { port: 3000, env: "development" };
    }
    throw err;
  }
}

const config = await loadConfig();
```

**TypeScript:**

```typescript
import { readFile } from "node:fs/promises";

interface AppConfig {
  port: number;
  env: "development" | "production" | "test";
  database: {
    host: string;
    name: string;
  };
}

async function loadConfig(): Promise<AppConfig> {
  try {
    const data = await readFile("./config.json", "utf8");
    return JSON.parse(data) as AppConfig;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.log("Config not found, using defaults");
      return {
        port: 3000,
        env: "development",
        database: { host: "localhost", name: "devjobs" },
      };
    }
    throw err;
  }
}
```

### Example 2: Writing Files

**JavaScript:**

```javascript
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

// Write JSON data
async function saveJobPosting(job) {
  const filePath = `./data/jobs/${job.id}.json`;

  // Ensure directory exists
  await mkdir(dirname(filePath), { recursive: true });

  // Write with pretty formatting
  await writeFile(filePath, JSON.stringify(job, null, 2), "utf8");

  console.log(`Job saved to ${filePath}`);
}

// Usage
await saveJobPosting({
  id: "job-001",
  title: "Senior Backend Engineer",
  company: "TechCorp",
  salary: { min: 120000, max: 180000 },
});

// Append to log file
import { appendFile } from "node:fs/promises";

async function log(message) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  await appendFile("./logs/app.log", logLine, "utf8");
}
```

**TypeScript:**

```typescript
import { writeFile, mkdir, appendFile } from "node:fs/promises";
import { dirname } from "node:path";

interface JobPosting {
  id: string;
  title: string;
  company: string;
  salary: { min: number; max: number };
}

async function saveJobPosting(job: JobPosting): Promise<void> {
  const filePath = `./data/jobs/${job.id}.json`;

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(job, null, 2), "utf8");

  console.log(`Job saved to ${filePath}`);
}

async function log(
  level: "info" | "warn" | "error",
  message: string,
): Promise<void> {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  await appendFile("./logs/app.log", logLine, "utf8");
}
```

### Example 3: Path Operations

**JavaScript:**

```javascript
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Join paths safely (cross-platform)
const configPath = path.join(__dirname, "config", "default.json");
// Linux: /home/user/project/config/default.json
// Windows: C:\Users\user\project\config\default.json

// Resolve to absolute path
const uploadsDir = path.resolve("uploads", "resumes");
// Always returns absolute path from current working directory

// Parse a file path
const filePath = "/uploads/resumes/alice-smith-resume.pdf";
const parsed = path.parse(filePath);
console.log(parsed);
// {
//   root: '/',
//   dir: '/uploads/resumes',
//   base: 'alice-smith-resume.pdf',
//   ext: '.pdf',
//   name: 'alice-smith-resume'
// }

// Build a path from parts
const newPath = path.format({
  dir: "/uploads/processed",
  name: "alice-smith-resume",
  ext: ".txt",
});
// '/uploads/processed/alice-smith-resume.txt'

// Normalize messy paths
const messy = "/uploads/../uploads/./resumes//file.pdf";
const clean = path.normalize(messy);
// '/uploads/resumes/file.pdf'

// Get relative path between two locations
const from = "/var/www/project/src";
const to = "/var/www/project/public/images";
const relative = path.relative(from, to);
// '../public/images'
```

### Example 4: Directory Operations

**JavaScript:**

```javascript
import { readdir, stat, mkdir, rm } from "node:fs/promises";
import path from "node:path";

// List directory contents
async function listDirectory(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const type = entry.isDirectory() ? "📁" : "📄";
    console.log(`${type} ${entry.name}`);
  }
}

// Get detailed file information
async function fileInfo(filePath) {
  const stats = await stat(filePath);

  return {
    size: stats.size, // in bytes
    sizeFormatted: `${(stats.size / 1024).toFixed(2)} KB`,
    created: stats.birthtime,
    modified: stats.mtime,
    isDirectory: stats.isDirectory(),
    isFile: stats.isFile(),
  };
}

// Create nested directories
async function ensureDir(dirPath) {
  try {
    await mkdir(dirPath, { recursive: true });
    console.log(`Directory created: ${dirPath}`);
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
}

// Delete directory and contents
async function cleanDirectory(dirPath) {
  await rm(dirPath, { recursive: true, force: true });
  console.log(`Cleaned: ${dirPath}`);
}
```

**TypeScript:**

```typescript
import { readdir, stat, mkdir, rm } from "node:fs/promises";
import type { Stats, Dirent } from "node:fs";
import path from "node:path";

interface FileInfo {
  size: number;
  sizeFormatted: string;
  created: Date;
  modified: Date;
  isDirectory: boolean;
  isFile: boolean;
}

async function listDirectory(dirPath: string): Promise<Dirent[]> {
  return readdir(dirPath, { withFileTypes: true });
}

async function fileInfo(filePath: string): Promise<FileInfo> {
  const stats: Stats = await stat(filePath);

  return {
    size: stats.size,
    sizeFormatted: `${(stats.size / 1024).toFixed(2)} KB`,
    created: stats.birthtime,
    modified: stats.mtime,
    isDirectory: stats.isDirectory(),
    isFile: stats.isFile(),
  };
}
```

### Example 5: Recursive Directory Reader

**JavaScript:**

```javascript
import { readdir } from "node:fs/promises";
import path from "node:path";

async function* walkDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      yield* walkDirectory(fullPath); // Recurse into subdirectory
    } else {
      yield fullPath; // Yield file path
    }
  }
}

// Usage
async function findAllJsFiles(rootDir) {
  const jsFiles = [];

  for await (const filePath of walkDirectory(rootDir)) {
    if (filePath.endsWith(".js")) {
      jsFiles.push(filePath);
    }
  }

  return jsFiles;
}

const files = await findAllJsFiles("./src");
console.log("JavaScript files:", files);
```

**TypeScript:**

```typescript
import { readdir } from "node:fs/promises";
import path from "node:path";

async function* walkDirectory(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      yield* walkDirectory(fullPath);
    } else {
      yield fullPath;
    }
  }
}

async function findFilesByExtension(
  rootDir: string,
  extension: string,
): Promise<string[]> {
  const matchingFiles: string[] = [];

  for await (const filePath of walkDirectory(rootDir)) {
    if (filePath.endsWith(extension)) {
      matchingFiles.push(filePath);
    }
  }

  return matchingFiles;
}
```

---

## 🔨 Mini-Tutorial: Build a File Logger Middleware

Let's create a request logger that DevJobs Pro will use to track all incoming API requests.

### Step 1: Create the Logger Module

**JavaScript (src/utils/fileLogger.js):**

```javascript
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

class FileLogger {
  constructor(logDir = "./logs") {
    this.logDir = logDir;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    await mkdir(this.logDir, { recursive: true });
    this.initialized = true;
  }

  getLogFileName() {
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return path.join(this.logDir, `requests-${date}.log`);
  }

  formatLogEntry(data) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${JSON.stringify(data)}\n`;
  }

  async log(data) {
    await this.init();
    const logFile = this.getLogFileName();
    const entry = this.formatLogEntry(data);
    await appendFile(logFile, entry, "utf8");
  }

  // Express middleware style
  middleware() {
    return async (req, res, next) => {
      const startTime = Date.now();

      // Capture response finish
      res.on("finish", async () => {
        const duration = Date.now() - startTime;

        await this.log({
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        });
      });

      next();
    };
  }
}

export const logger = new FileLogger();
export default FileLogger;
```

**TypeScript (src/utils/fileLogger.ts):**

```typescript
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { Request, Response, NextFunction } from "express";

interface LogEntry {
  method: string;
  url: string;
  status: number;
  duration: string;
  ip?: string;
  userAgent?: string;
}

class FileLogger {
  private logDir: string;
  private initialized: boolean = false;

  constructor(logDir: string = "./logs") {
    this.logDir = logDir;
  }

  private async init(): Promise<void> {
    if (this.initialized) return;
    await mkdir(this.logDir, { recursive: true });
    this.initialized = true;
  }

  private getLogFileName(): string {
    const date = new Date().toISOString().split("T")[0];
    return path.join(this.logDir, `requests-${date}.log`);
  }

  private formatLogEntry(data: LogEntry): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${JSON.stringify(data)}\n`;
  }

  async log(data: LogEntry): Promise<void> {
    await this.init();
    const logFile = this.getLogFileName();
    const entry = this.formatLogEntry(data);
    await appendFile(logFile, entry, "utf8");
  }

  middleware(): (req: Request, res: Response, next: NextFunction) => void {
    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = Date.now();

      res.on("finish", async () => {
        const duration = Date.now() - startTime;

        await this.log({
          method: req.method,
          url: req.originalUrl,
          status: res.statusCode,
          duration: `${duration}ms`,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        });
      });

      next();
    };
  }
}

export const logger = new FileLogger();
export default FileLogger;
```

### Step 2: Use the Logger in Express (Preview)

```javascript
// src/index.js
import express from "express";
import { logger } from "./utils/fileLogger.js";

const app = express();

// Apply logging middleware
app.use(logger.middleware());

app.get("/api/jobs", (req, res) => {
  res.json({ jobs: [] });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
```

### Step 3: Test It

```bash
node src/index.js
# In another terminal:
curl http://localhost:3000/api/jobs
```

Check `./logs/requests-2026-01-29.log`:

```
[2026-01-29T10:30:45.123Z] {"method":"GET","url":"/api/jobs","status":200,"duration":"5ms","ip":"::1","userAgent":"curl/7.68.0"}
```

---

## 🏋️ Practice Exercises

### Exercise 1: Config Loader with Fallback

Create a function that loads configuration from multiple sources with fallback:

```javascript
// Returns merged config from:
// 1. ./config/default.json (base)
// 2. ./config/{NODE_ENV}.json (environment-specific)
// 3. Environment variables (highest priority)

async function loadConfig() {
  // Your implementation
}
```

<details>
<summary>Click to reveal solution</summary>

```javascript
import { readFile } from "node:fs/promises";
import path from "node:path";

async function loadJsonFile(filePath) {
  try {
    const data = await readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") return {};
    throw err;
  }
}

async function loadConfig() {
  const env = process.env.NODE_ENV || "development";
  const configDir = "./config";

  // Load base config
  const defaultConfig = await loadJsonFile(
    path.join(configDir, "default.json"),
  );

  // Load environment-specific config
  const envConfig = await loadJsonFile(path.join(configDir, `${env}.json`));

  // Merge with env vars having highest priority
  return {
    ...defaultConfig,
    ...envConfig,
    port: process.env.PORT || envConfig.port || defaultConfig.port || 3000,
    database: {
      ...defaultConfig.database,
      ...envConfig.database,
      host: process.env.DB_HOST || envConfig.database?.host,
    },
  };
}
```

</details>

### Exercise 2: Safe File Deletion

Create a function that safely deletes files (moves to trash first):

```javascript
async function safeDelete(filePath, trashDir = "./trash") {
  // 1. Ensure trash directory exists
  // 2. Move file to trash with timestamp
  // 3. Return the new location
}
```

<details>
<summary>Click to reveal solution</summary>

```javascript
import { rename, mkdir, stat } from "node:fs/promises";
import path from "node:path";

async function safeDelete(filePath, trashDir = "./trash") {
  // Ensure file exists
  await stat(filePath); // Throws if not found

  // Ensure trash directory exists
  await mkdir(trashDir, { recursive: true });

  // Create unique trash name
  const timestamp = Date.now();
  const originalName = path.basename(filePath);
  const trashPath = path.join(trashDir, `${timestamp}-${originalName}`);

  // Move to trash
  await rename(filePath, trashPath);

  console.log(`Moved ${filePath} to ${trashPath}`);
  return trashPath;
}
```

</details>

### Exercise 3: Directory Tree Generator

Create a function that generates an ASCII tree of a directory:

```
Expected output:
📁 project
├── 📄 package.json
├── 📁 src
│   ├── 📄 index.js
│   └── 📁 utils
│       └── 📄 helpers.js
└── 📄 README.md
```

<details>
<summary>Click to reveal solution</summary>

```javascript
import { readdir } from "node:fs/promises";
import path from "node:path";

async function generateTree(dirPath, prefix = "", isLast = true) {
  const name = path.basename(dirPath);
  const connector = isLast ? "└── " : "├── ";
  const entries = await readdir(dirPath, { withFileTypes: true }).catch(
    () => [],
  );

  let result =
    prefix === "" ? `📁 ${name}\n` : `${prefix}${connector}📁 ${name}\n`;

  const childPrefix = prefix + (isLast ? "    " : "│   ");

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const isLastEntry = i === entries.length - 1;
    const entryConnector = isLastEntry ? "└── " : "├── ";
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      result += await generateTree(fullPath, childPrefix, isLastEntry);
    } else {
      result += `${childPrefix}${entryConnector}📄 ${entry.name}\n`;
    }
  }

  return result;
}

const tree = await generateTree("./src");
console.log(tree);
```

</details>

---

## 💡 Pro Tips

### 1. Always Use Async File Operations

```javascript
// ❌ Blocks the entire server
const data = fs.readFileSync("large-file.txt");

// ✅ Non-blocking, event loop stays healthy
const data = await fs.readFile("large-file.txt");
```

### 2. Stream Large Files Instead of Reading Them Whole

```javascript
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

// For files > 100MB, stream them
async function copyLargeFile(src, dest) {
  await pipeline(createReadStream(src), createWriteStream(dest));
}
```

### 3. Validate Paths to Prevent Directory Traversal Attacks

```javascript
import path from "node:path";

function safePath(userInput, baseDir) {
  const resolved = path.resolve(baseDir, userInput);

  // Ensure resolved path is still within baseDir
  if (!resolved.startsWith(path.resolve(baseDir))) {
    throw new Error("Path traversal detected!");
  }

  return resolved;
}

// Usage
const uploadDir = "./uploads";
const filePath = safePath("../../../etc/passwd", uploadDir); // Throws!
```

### 4. Use access() to Check Permissions, Not exists()

```javascript
import { access, constants } from "node:fs/promises";

// Check if file exists and is readable
async function canRead(filePath) {
  try {
    await access(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}
```

### 5. Handle Concurrent File Access

```javascript
// For DevJobs Pro: concurrent-safe file appending
import { open } from "node:fs/promises";

async function appendWithLock(filePath, content) {
  const handle = await open(filePath, "a");
  try {
    await handle.appendFile(content);
  } finally {
    await handle.close();
  }
}
```

---

## 🔧 5-Minute Debugger

### Error: "ENOENT: no such file or directory"

```
Error: ENOENT: no such file or directory, open './config.json'
```

**Diagnosis:**

1. File doesn't exist
2. Wrong path (relative vs absolute)
3. Working directory is different than expected

**Fix:**

```javascript
import path from "node:path";
import { fileURLToPath } from "node:url";

// Problem: Relative paths depend on cwd, not file location
// If you run `node src/app.js` from project root: ✓
// If you run `node app.js` from src/: ✗

// Solution: Use absolute path from module location
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "../config.json");

// Debug: Log the path you're trying to read
console.log("Reading from:", configPath);
console.log(
  "File exists check:",
  await fs
    .access(configPath)
    .then(() => true)
    .catch(() => false),
);
```

### Error: Relative Path Confusion

```
// You're in: /home/user/project
// File is at: /home/user/project/src/config.json

// ❌ This looks for /home/user/project/config.json
readFile('./config.json');

// ❌ This also depends on where you run the command from
readFile('../config.json');

// ✅ Use __dirname-relative paths
const configPath = path.join(__dirname, 'config.json');
```

### Quick Checklist for File Errors

1. ✅ Log the full absolute path you're trying to access
2. ✅ Check if path exists: `ls -la /full/path/to/file`
3. ✅ Check working directory: `process.cwd()`
4. ✅ Check permissions: `ls -la` (owner, read/write bits)
5. ✅ Use `path.resolve()` to see actual path being used
6. ✅ Make sure parent directories exist when writing

---

## ✅ Definition of Done

You've mastered this lesson when you can:

- [ ] Read and write files using `fs/promises` (async)
- [ ] Explain why sync file operations are bad for servers
- [ ] Use `path.join()` and `path.resolve()` correctly
- [ ] Handle file errors properly (ENOENT, EACCES, etc.)
- [ ] Create directories recursively with `mkdir`
- [ ] Build a recursive directory walker
- [ ] Debug common "file not found" issues
- [ ] Prevent path traversal security vulnerabilities

---

## 🚀 Next Steps

Now that you can work with files, let's go back to the network. Before we jump into Express, it's essential to understand what Express is abstracting—the raw HTTP module.

**Next Lesson:** [The HTTP Module: Raw Server](./04-http-module-raw-server.md)

You'll learn:

- Creating servers without frameworks
- Understanding Request and Response objects
- What Express does under the hood
- Why this knowledge helps you debug Express issues

---

## 📚 Additional Resources

- [Node.js fs module documentation](https://nodejs.org/api/fs.html)
- [Node.js path module documentation](https://nodejs.org/api/path.html)
- [File system best practices](https://nodejs.org/en/docs/guides/working-with-different-filesystems)

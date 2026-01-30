# Module 02: Node.js Foundations

> Before building with Express, master the fundamentals that power it.

## 🎯 Module Overview

This module takes you deep into Node.js internals—the event loop, modules, file system, and raw HTTP. Understanding these foundations transforms you from someone who _uses_ Node.js to someone who _understands_ it.

In DevJobs Pro, these concepts appear everywhere:

- **Event Loop**: How we handle thousands of concurrent job seekers
- **Modules**: How we organize our codebase professionally
- **File System**: Configuration, logging, resume uploads
- **HTTP**: What Express abstracts (and how to debug it)

## 📚 Lessons

| #   | Lesson                                                    | What You'll Learn                                         | Time   |
| --- | --------------------------------------------------------- | --------------------------------------------------------- | ------ |
| 1   | [V8 Engine & Event Loop](./01-v8-engine-event-loop.md)    | How Node.js handles async operations with a single thread | 45 min |
| 2   | [Modules: CommonJS & ESM](./02-modules-commonjs-esm.md)   | Organizing code with require() vs import/export           | 40 min |
| 3   | [Core Modules: fs & path](./03-core-modules-fs-path.md)   | File operations, path manipulation, async best practices  | 45 min |
| 4   | [HTTP Module: Raw Server](./04-http-module-raw-server.md) | Building HTTP servers without frameworks                  | 50 min |

**Total Time:** ~3 hours

## 🔑 Key Concepts

### Lesson 1: Event Loop

```
┌─────────────────────────────────────────┐
│  timers → pending → poll → check → close │
│              ↑                          │
│     (microtasks between each phase)     │
└─────────────────────────────────────────┘
```

### Lesson 2: Module Systems

```javascript
// CommonJS (Legacy)
const express = require("express");
module.exports = router;

// ES Modules (Modern) ← DevJobs Pro uses this
import express from "express";
export default router;
```

### Lesson 3: Async File Operations

```javascript
// ✅ Always use async in servers
import { readFile } from "node:fs/promises";
const data = await readFile("./config.json", "utf8");
```

### Lesson 4: Raw HTTP

```javascript
// What Express simplifies:
import { createServer } from "node:http";
createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ jobs: [] }));
}).listen(3000);
```

## 📋 Prerequisites

Before starting this module, you should:

- [ ] Completed Module 01 (Introduction)
- [ ] Have Node.js 20+ installed
- [ ] Be comfortable with JavaScript basics
- [ ] Understand basic async concepts (callbacks, promises)

## ✅ Module Completion Checklist

By the end of this module, you should be able to:

- [ ] Explain the 6 phases of the event loop
- [ ] Predict execution order of mixed sync/async code
- [ ] Choose between CommonJS and ES Modules appropriately
- [ ] Create ES Module projects with proper `package.json` config
- [ ] Perform async file operations with proper error handling
- [ ] Build a basic HTTP server without Express
- [ ] Debug common Node.js errors (module not found, address in use, etc.)

## 🔧 Hands-On Projects

Each lesson includes practical exercises. The module culminates in:

1. **Event Loop Visualizer** - Script that demonstrates execution order
2. **File Logger Middleware** - Reusable request logging utility
3. **Raw REST API** - Complete CRUD API without Express

## 🚀 Next Module

After completing this module, you'll have the foundation to understand what Express does under the hood.

**Next:** [Module 03: Express.js Fundamentals](../03-express-fundamentals/README.md)

---

## 📖 Quick Reference

### Event Loop Priority

1. Synchronous code (call stack)
2. `process.nextTick()` callbacks
3. Promise microtasks (`.then()`, `await`)
4. Timer callbacks (`setTimeout`, `setInterval`)
5. I/O callbacks
6. `setImmediate()` callbacks
7. Close callbacks

### ES Modules Checklist

```json
// package.json
{
  "type": "module"
}
```

```javascript
// Always include .js extension
import { helper } from "./utils.js";

// Use node: protocol for core modules
import fs from "node:fs/promises";
import path from "node:path";
```

### HTTP Status Codes (Common)

| Code | Meaning      | Use Case           |
| ---- | ------------ | ------------------ |
| 200  | OK           | Successful GET/PUT |
| 201  | Created      | Successful POST    |
| 204  | No Content   | Successful DELETE  |
| 400  | Bad Request  | Invalid input      |
| 401  | Unauthorized | Missing auth       |
| 404  | Not Found    | Resource missing   |
| 500  | Server Error | Unexpected error   |

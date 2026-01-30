# Lesson 1: V8 Engine & The Event Loop

## 🎯 Hook: The Magic Behind Node.js

Ever wondered how Node.js handles thousands of concurrent connections with a single thread? While other languages spawn threads like confetti, Node.js sits there calmly processing requests with one thread. The secret? The **Event Loop**—and understanding it will transform you from someone who writes Node.js code to someone who _truly_ understands it.

In DevJobs Pro, we'll handle multiple job seekers browsing listings, employers posting jobs, and real-time notifications—all concurrently. Understanding the event loop is how you'll debug those "why is my callback not firing?" moments.

---

## 📚 Theory: Under the Hood

### The V8 Engine

V8 is Google's open-source JavaScript engine written in C++. It powers Chrome and Node.js. Here's what it does:

1. **Parses** your JavaScript code into an Abstract Syntax Tree (AST)
2. **Compiles** the AST to bytecode (Ignition interpreter)
3. **Optimizes** hot code paths to machine code (TurboFan compiler)
4. **Executes** the compiled code
5. **Garbage collects** unused memory

V8 handles synchronous JavaScript execution. But Node.js needs to do I/O (file reads, network requests)—that's where **libuv** comes in.

### The Event Loop: Node.js's Secret Weapon

The event loop is what allows Node.js to perform non-blocking I/O operations despite JavaScript being single-threaded. It offloads operations to the system kernel whenever possible.

```
┌───────────────────────────────────────────────────────────────┐
│                        EVENT LOOP                              │
│                                                                │
│  ┌─────────────┐                                               │
│  │   timers    │ ← setTimeout(), setInterval() callbacks       │
│  └──────┬──────┘                                               │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────┐                                               │
│  │   pending   │ ← I/O callbacks deferred from previous loop   │
│  │  callbacks  │                                               │
│  └──────┬──────┘                                               │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────┐                                               │
│  │    idle,    │ ← Internal use only (Node.js housekeeping)    │
│  │   prepare   │                                               │
│  └──────┬──────┘                                               │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────┐    ┌─────────────────────────────────┐        │
│  │    poll     │◄───│ Retrieve new I/O events         │        │
│  │             │    │ Execute I/O callbacks           │        │
│  └──────┬──────┘    │ (except close, timers, check)   │        │
│         │           └─────────────────────────────────┘        │
│         ▼                                                      │
│  ┌─────────────┐                                               │
│  │    check    │ ← setImmediate() callbacks                    │
│  └──────┬──────┘                                               │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────┐                                               │
│  │    close    │ ← socket.on('close'), cleanup callbacks       │
│  │  callbacks  │                                               │
│  └─────────────┘                                               │
│                                                                │
│  ════════════════════════════════════════════════════════════  │
│                                                                │
│  Between EVERY phase:                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ MICROTASK QUEUE (process.nextTick, Promise callbacks)   │  │
│  │ → process.nextTick() runs FIRST                         │  │
│  │ → Then Promise .then()/.catch()/.finally()              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
└───────────────────────────────────────────────────────────────┘
```

### The Call Stack vs Task Queues

```
┌─────────────────────────────────────────────────────────────────┐
│                     JAVASCRIPT RUNTIME                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐         ┌────────────────────────────────┐ │
│  │   CALL STACK    │         │        TASK QUEUES             │ │
│  │   (Sync code)   │         │                                │ │
│  │                 │         │  ┌──────────────────────────┐  │ │
│  │ ┌─────────────┐ │         │  │ MICROTASK QUEUE          │  │ │
│  │ │ processJob()│ │         │  │ (Highest Priority)       │  │ │
│  │ ├─────────────┤ │         │  │ • process.nextTick()     │  │ │
│  │ │ parseData() │ │ ◄───────┤  │ • Promise.then()         │  │ │
│  │ ├─────────────┤ │         │  │ • queueMicrotask()       │  │ │
│  │ │   main()    │ │         │  └──────────────────────────┘  │ │
│  │ └─────────────┘ │         │                                │ │
│  │                 │         │  ┌──────────────────────────┐  │ │
│  └─────────────────┘         │  │ MACROTASK QUEUE          │  │ │
│                              │  │ (Lower Priority)         │  │ │
│                              │  │ • setTimeout()           │  │ │
│                              │  │ • setInterval()          │  │ │
│                              │  │ • setImmediate()         │  │ │
│                              │  │ • I/O callbacks          │  │ │
│                              │  └──────────────────────────┘  │ │
│                              └────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

EXECUTION ORDER:
1. Call Stack empties completely
2. ALL microtasks execute (nextTick first, then Promises)
3. ONE macrotask executes
4. Repeat from step 2
```

### Phase Deep Dive

| Phase                 | What Happens                                                       | Callback Examples                        |
| --------------------- | ------------------------------------------------------------------ | ---------------------------------------- |
| **timers**            | Executes callbacks scheduled by `setTimeout()` and `setInterval()` | Timer callbacks that are ready           |
| **pending callbacks** | Executes I/O callbacks deferred to the next loop iteration         | TCP errors, some system operations       |
| **idle, prepare**     | Internal Node.js operations                                        | None (internal use)                      |
| **poll**              | Retrieve new I/O events; execute I/O callbacks                     | Most callbacks: file read, network, etc. |
| **check**             | `setImmediate()` callbacks execute here                            | setImmediate callbacks                   |
| **close callbacks**   | Close event callbacks                                              | `socket.on('close', ...)`                |

---

## 💻 Code Examples

### Example 1: Understanding Execution Order

**JavaScript:**

```javascript
// event-loop-order.js
console.log("1: Script start (sync)");

setTimeout(() => {
  console.log("2: setTimeout (macrotask - timers phase)");
}, 0);

setImmediate(() => {
  console.log("3: setImmediate (macrotask - check phase)");
});

Promise.resolve().then(() => {
  console.log("4: Promise.then (microtask)");
});

process.nextTick(() => {
  console.log("5: process.nextTick (microtask - highest priority)");
});

console.log("6: Script end (sync)");

// OUTPUT:
// 1: Script start (sync)
// 6: Script end (sync)
// 5: process.nextTick (microtask - highest priority)
// 4: Promise.then (microtask)
// 2: setTimeout (macrotask - timers phase)
// 3: setImmediate (macrotask - check phase)
```

**TypeScript:**

```typescript
// event-loop-order.ts
console.log("1: Script start (sync)");

setTimeout((): void => {
  console.log("2: setTimeout (macrotask - timers phase)");
}, 0);

setImmediate((): void => {
  console.log("3: setImmediate (macrotask - check phase)");
});

Promise.resolve().then((): void => {
  console.log("4: Promise.then (microtask)");
});

process.nextTick((): void => {
  console.log("5: process.nextTick (microtask - highest priority)");
});

console.log("6: Script end (sync)");
```

### Example 2: setTimeout vs setImmediate (The Tricky Case)

**JavaScript:**

```javascript
// timers-vs-immediate.js

// CASE 1: In the main module (non-deterministic!)
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
// Order is NOT guaranteed! Depends on process performance.

// CASE 2: Within an I/O callback (deterministic!)
const fs = require("fs");

fs.readFile(__filename, () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
});
// OUTPUT is ALWAYS:
// immediate
// timeout

// WHY? Inside I/O callback, we're in the poll phase.
// check phase (setImmediate) comes BEFORE timers phase in the next iteration.
```

**TypeScript:**

```typescript
// timers-vs-immediate.ts
import fs from "node:fs";

// Within an I/O callback - always predictable
fs.readFile(import.meta.filename ?? __filename, (): void => {
  setTimeout((): void => console.log("timeout"), 0);
  setImmediate((): void => console.log("immediate"));
});

// OUTPUT:
// immediate
// timeout
```

### Example 3: Microtask Starvation (A Real Bug!)

**JavaScript:**

```javascript
// microtask-starvation.js

// DON'T DO THIS - This starves the event loop!
function badRecursivePromise() {
  Promise.resolve().then(() => {
    console.log("Microtask running...");
    badRecursivePromise(); // Infinite microtasks!
  });
}

// This setTimeout will NEVER run:
setTimeout(() => {
  console.log("This never prints!");
}, 0);

// badRecursivePromise(); // Uncomment to see starvation

// CORRECT approach - use setImmediate for recursive async work
function goodRecursiveAsync() {
  setImmediate(() => {
    console.log("Macrotask running...");
    // goodRecursiveAsync(); // This allows other tasks to run
  });
}
```

### Example 4: Real-World DevJobs Pro Example

**JavaScript:**

```javascript
// job-processing-queue.js
// Simulating DevJobs Pro processing job applications

const applications = [
  { id: 1, name: "Alice", position: "Backend Engineer" },
  { id: 2, name: "Bob", position: "Frontend Developer" },
  { id: 3, name: "Charlie", position: "DevOps Engineer" },
];

console.log("🚀 Starting application processing...");

// Simulating database save (async I/O)
function saveToDatabase(app) {
  return new Promise((resolve) => {
    // Simulates I/O operation
    setTimeout(() => {
      console.log(`💾 Saved ${app.name}'s application to database`);
      resolve(app);
    }, 100);
  });
}

// Process each application
applications.forEach((app) => {
  // This runs synchronously - schedules all saves
  saveToDatabase(app).then((saved) => {
    // Microtask: runs after current sync code, before next macrotask
    console.log(`✅ Confirmed: ${saved.name} processed`);

    // Schedule notification (macrotask)
    setImmediate(() => {
      console.log(`📧 Email notification sent to ${saved.name}`);
    });
  });
});

// This runs before any async callbacks
console.log("📋 All applications queued for processing");

// Cleanup task
process.nextTick(() => {
  console.log("🧹 Cleanup: Clearing temporary data");
});

/* OUTPUT ORDER:
🚀 Starting application processing...
📋 All applications queued for processing
🧹 Cleanup: Clearing temporary data
💾 Saved Alice's application to database
✅ Confirmed: Alice processed
💾 Saved Bob's application to database
✅ Confirmed: Bob processed
💾 Saved Charlie's application to database
✅ Confirmed: Charlie processed
📧 Email notification sent to Alice
📧 Email notification sent to Bob
📧 Email notification sent to Charlie
*/
```

**TypeScript:**

```typescript
// job-processing-queue.ts
interface JobApplication {
  id: number;
  name: string;
  position: string;
}

const applications: JobApplication[] = [
  { id: 1, name: "Alice", position: "Backend Engineer" },
  { id: 2, name: "Bob", position: "Frontend Developer" },
  { id: 3, name: "Charlie", position: "DevOps Engineer" },
];

console.log("🚀 Starting application processing...");

async function saveToDatabase(app: JobApplication): Promise<JobApplication> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`💾 Saved ${app.name}'s application to database`);
      resolve(app);
    }, 100);
  });
}

applications.forEach((app) => {
  saveToDatabase(app).then((saved) => {
    console.log(`✅ Confirmed: ${saved.name} processed`);

    setImmediate(() => {
      console.log(`📧 Email notification sent to ${saved.name}`);
    });
  });
});

console.log("📋 All applications queued for processing");

process.nextTick(() => {
  console.log("🧹 Cleanup: Clearing temporary data");
});
```

---

## 🔨 Mini-Tutorial: Event Loop Exploration

Let's build a script that demonstrates event loop phases clearly.

### Step 1: Create the Project

```bash
mkdir event-loop-demo && cd event-loop-demo
npm init -y
```

### Step 2: Create the Demo Script

**JavaScript (event-loop-visualizer.js):**

```javascript
// event-loop-visualizer.js
const fs = require("fs");

function log(phase, message) {
  const timestamp = Date.now() % 10000; // Last 4 digits for readability
  console.log(`[${timestamp}] ${phase.padEnd(12)} | ${message}`);
}

log("MAIN", "=== Script Start ===");

// TIMERS PHASE
setTimeout(() => log("TIMERS", "setTimeout 0ms"), 0);
setTimeout(() => log("TIMERS", "setTimeout 100ms"), 100);

// CHECK PHASE
setImmediate(() => {
  log("CHECK", "setImmediate #1");

  // Nested: What happens when we schedule from check phase?
  process.nextTick(() => log("MICROTASK", "nextTick inside setImmediate"));
  Promise.resolve().then(() => log("MICROTASK", "Promise inside setImmediate"));
  setTimeout(() => log("TIMERS", "setTimeout inside setImmediate"), 0);
});

setImmediate(() => log("CHECK", "setImmediate #2"));

// POLL PHASE (I/O)
fs.readFile(__filename, () => {
  log("POLL", "File read complete");

  // What order inside poll?
  setTimeout(() => log("TIMERS", "setTimeout inside I/O"), 0);
  setImmediate(() => log("CHECK", "setImmediate inside I/O"));
  process.nextTick(() => log("MICROTASK", "nextTick inside I/O"));
});

// MICROTASKS
process.nextTick(() => log("MICROTASK", "nextTick #1 (main)"));
process.nextTick(() => log("MICROTASK", "nextTick #2 (main)"));

Promise.resolve().then(() => log("MICROTASK", "Promise #1 (main)"));
Promise.resolve()
  .then(() => log("MICROTASK", "Promise #2 (main)"))
  .then(() => log("MICROTASK", "Promise #3 (chained)"));

// Back to sync
log("MAIN", "=== Script End ===");

// EXPECTED OUTPUT (approximately):
// [xxxx] MAIN         | === Script Start ===
// [xxxx] MAIN         | === Script End ===
// [xxxx] MICROTASK    | nextTick #1 (main)
// [xxxx] MICROTASK    | nextTick #2 (main)
// [xxxx] MICROTASK    | Promise #1 (main)
// [xxxx] MICROTASK    | Promise #2 (main)
// [xxxx] MICROTASK    | Promise #3 (chained)
// [xxxx] TIMERS       | setTimeout 0ms
// [xxxx] CHECK        | setImmediate #1
// [xxxx] MICROTASK    | nextTick inside setImmediate
// [xxxx] MICROTASK    | Promise inside setImmediate
// [xxxx] CHECK        | setImmediate #2
// [xxxx] POLL         | File read complete
// [xxxx] MICROTASK    | nextTick inside I/O
// [xxxx] CHECK        | setImmediate inside I/O
// [xxxx] TIMERS       | setTimeout inside I/O
// [xxxx] TIMERS       | setTimeout inside setImmediate
// [xxxx] TIMERS       | setTimeout 100ms
```

### Step 3: Run and Observe

```bash
node event-loop-visualizer.js
```

Study the output. Notice:

- All sync code runs first
- `nextTick` always runs before Promises
- `setImmediate` inside I/O callback runs before `setTimeout`
- Microtasks run between each phase

---

## 🏋️ Practice Exercises

### Exercise 1: Predict the Output

Without running, predict the order:

```javascript
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
process.nextTick(() => console.log("D"));
setImmediate(() => console.log("E"));
console.log("F");
```

<details>
<summary>Click to reveal answer</summary>

```
A
F
D
C
B
E
```

**Explanation:**

1. `A` - sync
2. `F` - sync
3. `D` - nextTick (highest priority microtask)
4. `C` - Promise (microtask)
5. `B` - setTimeout (timers phase)
6. `E` - setImmediate (check phase)

</details>

### Exercise 2: Fix the Starvation Bug

This code has a bug—the HTTP server never responds. Fix it:

```javascript
const http = require("http");

const server = http.createServer((req, res) => {
  // Simulate heavy processing
  function processData(callback) {
    let count = 0;
    function loop() {
      count++;
      if (count < 1000000) {
        process.nextTick(loop); // BUG: Starves the event loop!
      } else {
        callback(count);
      }
    }
    loop();
  }

  processData((result) => {
    res.end(`Processed: ${result}`);
  });
});

server.listen(3000);
```

<details>
<summary>Click to reveal solution</summary>

```javascript
// Replace process.nextTick with setImmediate
function processData(callback) {
  let count = 0;
  function loop() {
    count++;
    if (count < 1000000) {
      setImmediate(loop); // FIXED: Allows I/O between iterations
    } else {
      callback(count);
    }
  }
  loop();
}
```

</details>

---

## 💡 Pro Tips

### 1. Use `process.nextTick` for Synchronous-Style Async

```javascript
// Good: Ensure callback is always async, even if data is cached
function getUser(id, callback) {
  if (cache[id]) {
    process.nextTick(() => callback(null, cache[id]));
    return;
  }
  // ... fetch from database
}
```

### 2. Prefer `setImmediate` for Recursive Operations

```javascript
// Recursive work that doesn't starve the event loop
function processQueue(queue) {
  if (queue.length === 0) return;
  const item = queue.shift();
  processItem(item);
  setImmediate(() => processQueue(queue)); // Let I/O breathe
}
```

### 3. Understand Why Promises Are Preferred

```javascript
// Modern code uses Promises - they're microtasks with cleaner syntax
async function fetchJobs() {
  const jobs = await db.jobs.findAll(); // Microtask when resolved
  return jobs;
}
```

### 4. Profile Event Loop Lag in Production

```javascript
// Monitor event loop delays
const start = process.hrtime.bigint();
setImmediate(() => {
  const delay = Number(process.hrtime.bigint() - start) / 1e6;
  if (delay > 100) {
    console.warn(`Event loop lag: ${delay}ms`);
  }
});
```

---

## 🔧 5-Minute Debugger: "setTimeout Not Firing When Expected"

### The Problem

```javascript
setTimeout(() => console.log("Done!"), 1000);
heavyComputation(); // Takes 3 seconds
// "Done!" prints after 3+ seconds, not 1 second!
```

### Why It Happens

`setTimeout(fn, 1000)` doesn't mean "run after exactly 1 second." It means "schedule to run **no sooner than** 1 second." If the call stack is busy, the callback waits.

```
Timeline:
0ms      1000ms                    3000ms      3001ms
|--------|-------------------------|-----------|
[heavyComputation running........]  [callback runs]
                                   ↑
                         Timer was ready here,
                         but call stack was busy!
```

### The Fix

For time-critical operations, don't block the event loop:

```javascript
// Break heavy work into chunks
async function processInChunks(data) {
  for (let i = 0; i < data.length; i++) {
    processItem(data[i]);
    if (i % 100 === 0) {
      await new Promise((resolve) => setImmediate(resolve));
      // Yields control back to event loop
    }
  }
}

// Or use Worker Threads for CPU-intensive work
const { Worker } = require("worker_threads");
```

### Quick Diagnosis Checklist

1. ✅ Is there sync code blocking after setTimeout?
2. ✅ Are there infinite loops or heavy computations?
3. ✅ Is a microtask queue being flooded (Promise recursion)?
4. ✅ Check with: `node --inspect` and Chrome DevTools profiler

---

## ✅ Definition of Done

You've mastered this lesson when you can:

- [ ] Explain what V8 does vs what libuv does
- [ ] Name all 6 event loop phases in order
- [ ] Predict execution order of mixed sync/async code
- [ ] Explain the difference between microtasks and macrotasks
- [ ] Describe when `process.nextTick` runs vs `Promise.then`
- [ ] Explain why `setImmediate` inside I/O always runs before `setTimeout`
- [ ] Identify and fix event loop starvation bugs

---

## 🚀 Next Steps

Now that you understand how Node.js executes code under the hood, it's time to learn how Node.js organizes code into reusable pieces.

**Next Lesson:** [Modules: CommonJS & ES Modules](./02-modules-commonjs-esm.md)

You'll learn:

- How `require()` and `import` work differently
- Why DevJobs Pro uses ES Modules exclusively
- How to structure a professional Node.js project

---

## 📚 Additional Resources

- [Node.js Event Loop Documentation](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick)
- [libuv Design Overview](https://docs.libuv.org/en/v1.x/design.html)
- [Jake Archibald: In The Loop (Video)](https://www.youtube.com/watch?v=cCOL7MC4Pl0)

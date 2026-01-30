# Lesson 01: What is Node.js?

> **Module 01: Introduction** | **Lesson 1 of 3** | ⏱️ 25 minutes

---

## 🎯 Hook: Why Node.js Matters for Backend Developers

Imagine building a job platform where thousands of recruiters and developers interact simultaneously—posting jobs, sending messages, real-time notifications lighting up dashboards. Traditional server technologies would struggle, spawning new threads for each connection until memory runs out.

**Node.js changed everything.**

In 2009, Ryan Dahl introduced a runtime that handles 100,000+ concurrent connections on a single server. Netflix, LinkedIn, PayPal, and Uber chose Node.js for their backends. PayPal reported a 35% decrease in average response time after migrating.

By the end of this lesson, you'll understand *why* Node.js became the backbone of modern web backends—and you'll write your first Node.js code.

---

## 📖 Theory: Understanding Node.js Core Concepts

### What is Node.js?

> **Definition:** Node.js is a JavaScript runtime built on Chrome's V8 engine that executes JavaScript code outside a web browser, enabling server-side development.

Node.js is **not** a programming language. It's **not** a framework. It's a **runtime environment**—the engine room where your JavaScript code runs on the server.

Think of it this way:
- **JavaScript** = The language (the instructions)
- **V8 Engine** = The translator (converts JS to machine code)
- **Node.js** = The environment (provides tools to interact with the system)

### The V8 Engine: Speed Demon Under the Hood

Google built V8 for Chrome, and it's *blazingly fast*. Here's why:

1. **Just-In-Time (JIT) Compilation**: V8 compiles JavaScript directly to native machine code—no interpreter middleman
2. **Hidden Classes**: V8 optimizes object property access with secret internal classes
3. **Inline Caching**: Remembers how to access properties, avoiding repeated lookups
4. **Garbage Collection**: Efficient memory management that rarely causes lag

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    V8 ENGINE                            │
│  ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │   Your   │ →  │  Parser  │ →  │   Ignition       │  │
│  │   Code   │    │   (AST)  │    │   (Bytecode)     │  │
│  └──────────┘    └──────────┘    └────────┬─────────┘  │
│                                           │            │
│                                           ▼            │
│                                  ┌──────────────────┐  │
│                                  │   TurboFan       │  │
│                                  │   (Optimized     │  │
│                                  │    Machine Code) │  │
│                                  └──────────────────┘  │
└─────────────────────────────────────────────────────────┘
\`\`\`

### Event-Driven Architecture

Traditional servers create a new thread for each request. Imagine a restaurant where each customer gets their own chef:

\`\`\`
Traditional Multi-Threaded Server:
┌──────────────────────────────────────────┐
│  Request 1 → Thread 1 → Waiting for DB   │
│  Request 2 → Thread 2 → Waiting for DB   │
│  Request 3 → Thread 3 → Waiting for DB   │  ← All threads blocked!
│  Request 4 → Thread 4 → Waiting for DB   │
│  Request 5 → ❌ No threads available!    │
└──────────────────────────────────────────┘
\`\`\`

Node.js is like having one incredibly efficient waiter who takes all orders and delivers food as it's ready:

\`\`\`
Node.js Event-Driven Model:
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Request 1 ─┐                                            │
│  Request 2 ─┼──→  EVENT LOOP  ──→  Process & Respond     │
│  Request 3 ─┤       (Chef)          (As ready)           │
│  Request 4 ─┤                                            │
│  Request 5 ─┘     No waiting!                            │
│                                                          │
└──────────────────────────────────────────────────────────┘
\`\`\`

### Non-Blocking I/O: The Secret Sauce

**Blocking I/O** makes your code wait:
\`\`\`
Read file → Wait... → Got data → Continue
\`\`\`

**Non-Blocking I/O** lets your code continue:
\`\`\`
Read file → Continue other work → Callback when ready!
\`\`\`

---

## 🔄 The Event Loop: Node.js's Heart

This is the most important concept in Node.js. Master this, and you'll understand why Node.js behaves the way it does.

\`\`\`
┌─────────────────────────────────────────────────────────────────┐
│                         EVENT LOOP                              │
│                                                                 │
│   ┌─────────────┐                                               │
│   │  Incoming   │                                               │
│   │  Requests   │                                               │
│   └──────┬──────┘                                               │
│          │                                                      │
│          ▼                                                      │
│   ┌─────────────┐     ┌───────────────────────────────────┐    │
│   │   Event     │     │        CALLBACK QUEUES            │    │
│   │   Queue     │     │  ┌────────────────────────────┐   │    │
│   │             │◄────│  │ Timer callbacks (setTimeout)│   │    │
│   └──────┬──────┘     │  ├────────────────────────────┤   │    │
│          │            │  │ I/O callbacks (fs, http)   │   │    │
│          ▼            │  ├────────────────────────────┤   │    │
│   ┌─────────────┐     │  │ setImmediate callbacks     │   │    │
│   │  Call Stack │     │  ├────────────────────────────┤   │    │
│   │  (Execute)  │     │  │ Close callbacks            │   │    │
│   └──────┬──────┘     │  └────────────────────────────┘   │    │
│          │            └───────────────────────────────────┘    │
│          ▼                                                      │
│   ┌─────────────┐                                               │
│   │  Response   │                                               │
│   │  to Client  │                                               │
│   └─────────────┘                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
\`\`\`

**The Loop Phases:**
1. **Timers**: Execute \`setTimeout()\` and \`setInterval()\` callbacks
2. **Pending Callbacks**: Execute I/O callbacks deferred from previous iteration
3. **Idle, Prepare**: Internal use only
4. **Poll**: Retrieve new I/O events; execute I/O callbacks
5. **Check**: Execute \`setImmediate()\` callbacks
6. **Close Callbacks**: Execute close handlers (e.g., \`socket.on('close', ...)\`)

---

## 💻 Code Examples

### Example 1: Simple HTTP Server Concept

Let's see how Node.js handles HTTP requests with its non-blocking approach.

<details>
<summary><strong>🟨 JavaScript Version</strong></summary>

\`\`\`javascript
// simple-server.js
// A basic HTTP server demonstrating Node.js event-driven architecture

const http = require('node:http');

// Configuration
const PORT = 3000;
const HOST = 'localhost';

// Create the server
// The callback runs for EVERY incoming request (event-driven!)
const server = http.createServer((request, response) => {
  // Log the request (this happens asynchronously)
  console.log(\`[\${new Date().toISOString()}] \${request.method} \${request.url}\`);

  // Set response headers
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'X-Powered-By': 'Node.js'
  });

  // Send response body
  response.end(JSON.stringify({
    message: 'Hello from Node.js!',
    timestamp: Date.now(),
    path: request.url
  }));
});

// Start listening (non-blocking!)
server.listen(PORT, HOST, () => {
  console.log(\`🚀 Server running at http://\${HOST}:\${PORT}\`);
  console.log('Press Ctrl+C to stop');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(\`❌ Port \${PORT} is already in use\`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});
\`\`\`

</details>

<details>
<summary><strong>🟦 TypeScript Version</strong></summary>

\`\`\`typescript
// simple-server.ts
// A basic HTTP server demonstrating Node.js event-driven architecture

import http, { IncomingMessage, ServerResponse } from 'node:http';

// Configuration with explicit types
const PORT: number = 3000;
const HOST: string = 'localhost';

// Response shape interface
interface ApiResponse {
  message: string;
  timestamp: number;
  path: string | undefined;
}

// Request handler function
const handleRequest = (request: IncomingMessage, response: ServerResponse): void => {
  // Log the request
  console.log(\`[\${new Date().toISOString()}] \${request.method} \${request.url}\`);

  // Prepare response data
  const responseData: ApiResponse = {
    message: 'Hello from Node.js!',
    timestamp: Date.now(),
    path: request.url
  };

  // Set response headers
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'X-Powered-By': 'Node.js'
  });

  // Send response body
  response.end(JSON.stringify(responseData));
};

// Create the server with typed handler
const server = http.createServer(handleRequest);

// Start listening
server.listen(PORT, HOST, (): void => {
  console.log(\`🚀 Server running at http://\${HOST}:\${PORT}\`);
  console.log('Press Ctrl+C to stop');
});

// Handle server errors with typed error
server.on('error', (error: NodeJS.ErrnoException): void => {
  if (error.code === 'EADDRINUSE') {
    console.error(\`❌ Port \${PORT} is already in use\`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});
\`\`\`

</details>

**Key Takeaways:**
- \`http.createServer()\` registers a callback that fires on every request
- \`server.listen()\` is non-blocking—code after it runs immediately
- Error handling uses the event emitter pattern (\`server.on('error', ...)\`)

---

### Example 2: Event Emitter Pattern

The EventEmitter is the foundation of Node.js's event-driven architecture. Almost everything in Node.js is an EventEmitter (HTTP servers, streams, etc.).

<details>
<summary><strong>🟨 JavaScript Version</strong></summary>

\`\`\`javascript
// event-emitter-demo.js
// Understanding the EventEmitter pattern - the foundation of Node.js

const EventEmitter = require('node:events');

// Create a custom event emitter for a job board system
class JobBoard extends EventEmitter {
  constructor() {
    super();
    this.jobs = [];
  }

  // Post a new job - emits an event
  postJob(job) {
    job.id = Date.now();
    job.postedAt = new Date().toISOString();
    this.jobs.push(job);
    
    // Emit event with job data
    this.emit('job:posted', job);
    return job;
  }

  // Apply to a job - emits an event
  applyToJob(jobId, applicant) {
    const job = this.jobs.find(j => j.id === jobId);
    
    if (!job) {
      this.emit('error', new Error(\`Job \${jobId} not found\`));
      return null;
    }

    const application = {
      id: Date.now(),
      jobId,
      applicant,
      appliedAt: new Date().toISOString()
    };

    this.emit('job:application', { job, application });
    return application;
  }
}

// Create instance
const board = new JobBoard();

// Subscribe to events (listeners)
board.on('job:posted', (job) => {
  console.log(\`📢 New job posted: "\${job.title}" at \${job.company}\`);
});

board.on('job:application', ({ job, application }) => {
  console.log(\`📨 \${application.applicant.name} applied to "\${job.title}"\`);
});

board.on('error', (error) => {
  console.error(\`❌ Error: \${error.message}\`);
});

// Use the job board
console.log('=== Job Board Demo ===\\n');

const newJob = board.postJob({
  title: 'Senior Node.js Developer',
  company: 'TechCorp',
  salary: '\$150,000'
});

board.applyToJob(newJob.id, {
  name: 'Alice Johnson',
  email: 'alice@example.com'
});

// Try applying to non-existent job
board.applyToJob(999999, { name: 'Bob' });
\`\`\`

</details>

<details>
<summary><strong>🟦 TypeScript Version</strong></summary>

\`\`\`typescript
// event-emitter-demo.ts
// Understanding the EventEmitter pattern - the foundation of Node.js

import EventEmitter from 'node:events';

// Type definitions
interface Job {
  id?: number;
  title: string;
  company: string;
  salary: string;
  postedAt?: string;
}

interface Applicant {
  name: string;
  email?: string;
}

interface Application {
  id: number;
  jobId: number;
  applicant: Applicant;
  appliedAt: string;
}

interface JobApplicationEvent {
  job: Job;
  application: Application;
}

// Define event types for type safety
interface JobBoardEvents {
  'job:posted': (job: Job) => void;
  'job:application': (event: JobApplicationEvent) => void;
  'error': (error: Error) => void;
}

// Create a typed event emitter
class JobBoard extends EventEmitter {
  private jobs: Job[] = [];

  // Override emit for type safety
  emit<K extends keyof JobBoardEvents>(
    event: K,
    ...args: Parameters<JobBoardEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }

  // Override on for type safety
  on<K extends keyof JobBoardEvents>(
    event: K,
    listener: JobBoardEvents[K]
  ): this {
    return super.on(event, listener);
  }

  postJob(job: Omit<Job, 'id' | 'postedAt'>): Job {
    const newJob: Job = {
      ...job,
      id: Date.now(),
      postedAt: new Date().toISOString()
    };
    this.jobs.push(newJob);
    
    this.emit('job:posted', newJob);
    return newJob;
  }

  applyToJob(jobId: number, applicant: Applicant): Application | null {
    const job = this.jobs.find((j): boolean => j.id === jobId);
    
    if (!job) {
      this.emit('error', new Error(\`Job \${jobId} not found\`));
      return null;
    }

    const application: Application = {
      id: Date.now(),
      jobId,
      applicant,
      appliedAt: new Date().toISOString()
    };

    this.emit('job:application', { job, application });
    return application;
  }
}

// Create instance and subscribe to events
const board = new JobBoard();

board.on('job:posted', (job: Job): void => {
  console.log(\`📢 New job posted: "\${job.title}" at \${job.company}\`);
});

board.on('job:application', ({ job, application }: JobApplicationEvent): void => {
  console.log(\`📨 \${application.applicant.name} applied to "\${job.title}"\`);
});

board.on('error', (error: Error): void => {
  console.error(\`❌ Error: \${error.message}\`);
});

// Demo
console.log('=== Job Board Demo ===\\n');

const newJob = board.postJob({
  title: 'Senior Node.js Developer',
  company: 'TechCorp',
  salary: '\$150,000'
});

board.applyToJob(newJob.id!, {
  name: 'Alice Johnson',
  email: 'alice@example.com'
});

board.applyToJob(999999, { name: 'Bob' });
\`\`\`

</details>

**Key Takeaways:**
- EventEmitter is the pub/sub pattern built into Node.js
- \`.emit()\` broadcasts an event, \`.on()\` subscribes to it
- TypeScript adds type safety to your events

---

## 🧪 Mini-Tutorial: Your First Node.js Script

Let's write a tiny script that demonstrates Node.js's non-blocking nature.

**Step 1: Create the file**

\`\`\`bash
mkdir -p ~/learn-nodejs
cd ~/learn-nodejs
touch async-demo.js
\`\`\`

**Step 2: Write the code**

\`\`\`javascript
// async-demo.js
// Demonstrating non-blocking behavior

console.log('1️⃣  Script started');

// This is ASYNCHRONOUS (non-blocking)
setTimeout(() => {
  console.log('3️⃣  Timeout callback (after 0ms!)');
}, 0);

// This simulates a file read (async)
setImmediate(() => {
  console.log('4️⃣  setImmediate callback');
});

// This is synchronous
console.log('2️⃣  Script ended');

// Promise (microtask - runs before setTimeout!)
Promise.resolve().then(() => {
  console.log('2.5️⃣ Promise resolved (microtask)');
});
\`\`\`

**Step 3: Run it**

\`\`\`bash
node async-demo.js
\`\`\`

**Expected Output:**
\`\`\`
1️⃣  Script started
2️⃣  Script ended
2.5️⃣ Promise resolved (microtask)
3️⃣  Timeout callback (after 0ms!)
4️⃣  setImmediate callback
\`\`\`

**Wait, what?** The timeout has 0ms delay but runs *after* the synchronous code! This is the event loop in action:

1. Synchronous code runs first (Call Stack)
2. Microtasks (Promises) run next
3. Timers run after that
4. setImmediate runs in the check phase

---

## 💡 Pro Tips vs Junior Traps

| Aspect | 🟢 Pro Tip | 🔴 Junior Trap |
|--------|-----------|----------------|
| **Async Understanding** | Always remember: callbacks/promises execute *later*, not immediately. Design your code flow accordingly. | Assuming \`setTimeout(..., 0)\` executes "immediately" or before other code. |
| **Blocking Operations** | Use async versions of Node.js APIs (\`fs.promises\`, \`async/await\`). Never block the event loop. | Using \`fs.readFileSync()\` in web servers—it blocks ALL requests! |
| **Error Handling** | Always attach \`.catch()\` to promises and error listeners to EventEmitters. Unhandled errors crash Node.js. | Forgetting to handle errors, leading to mysterious crashes: "Why did my server die at 3 AM?" |

---

## 🔧 5-Minute Debugger: Common Node.js Errors

### Error 1: \`SyntaxError: Cannot use import statement outside a module\`

\`\`\`
SyntaxError: Cannot use import statement outside a module
\`\`\`

**Cause:** Using ES6 \`import\` syntax without configuring your project for ES modules.

**Fix Options:**
1. Add \`"type": "module"\` to your \`package.json\`
2. Use \`.mjs\` file extension
3. Use CommonJS syntax: \`const x = require('x')\`

\`\`\`json
// package.json
{
  "type": "module"
}
\`\`\`

---

### Error 2: \`Error: listen EADDRINUSE :::3000\`

\`\`\`
Error: listen EADDRINUSE: address already in use :::3000
\`\`\`

**Cause:** Another process is using port 3000.

**Fix:**
\`\`\`bash
# Find what's using the port
lsof -i :3000

# Kill it (replace PID with actual number)
kill -9 <PID>

# Or use a different port
const PORT = process.env.PORT || 3001;
\`\`\`

---

### Error 3: \`TypeError: callback is not a function\`

\`\`\`
TypeError: callback is not a function
\`\`\`

**Cause:** Calling a callback that wasn't passed or is undefined.

**Fix:** Always check if callback exists:

\`\`\`javascript
function doSomething(callback) {
  // Guard clause
  if (typeof callback === 'function') {
    callback(null, result);
  }
}
\`\`\`

---

## ✅ Definition of Done

You've completed this lesson when you can:

- [ ] Explain what Node.js is (and what it isn't) in your own words
- [ ] Describe how the V8 engine executes JavaScript
- [ ] Draw the event loop and explain its phases
- [ ] Explain the difference between blocking and non-blocking I/O
- [ ] Successfully run the mini-tutorial script and predict its output
- [ ] Identify at least one scenario where Node.js excels

---

## 🚀 Next Steps

**→ Next: [Lesson 02 - Why Node.js for Backends?](./02-why-nodejs-for-backends.md)**

Now that you understand *what* Node.js is, let's explore *when* and *why* you should use it—and importantly, when you shouldn't.

---

<div align="center">

**Module 01: Introduction** | Lesson 1 of 3

[Course Overview](../README.md) • **Lesson 1** → [Lesson 2](./02-why-nodejs-for-backends.md) → [Lesson 3](./03-course-overview-setup.md)

</div>

# Lesson 03: Course Overview & Setup

> **Module 01: Introduction** | **Lesson 3 of 3** | ⏱️ 30 minutes

---

## 🎯 Hook: Your Learning Journey Starts Here

You're about to embark on a 59-lesson journey from "I know some JavaScript" to "I can architect and build production-grade Node.js applications."

This isn't a tutorial that holds your hand through copying code. This is professional training. By the end, you'll have built **DevJobs Pro**—a complete job platform with three dashboards, real-time features, authentication, and deployment—code you can proudly showcase to employers.

Let's get you set up and ready to code.

---

## 🏗️ What You'll Build: DevJobs Pro

**DevJobs Pro** is a full-featured job board platform connecting developers with opportunities. Think LinkedIn meets Indeed, built specifically for tech roles.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DEVJOBS PRO ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         REACT FRONTEND                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │  Developer  │  │  Recruiter  │  │     Admin Dashboard     │  │   │
│  │  │  Dashboard  │  │  Dashboard  │  │  (User/Content Mgmt)    │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    │ REST API + WebSocket               │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    NODE.JS + EXPRESS 5 BACKEND                  │   │
│  │                                                                 │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  Auth │ Jobs │ Applications │ Users │ Notifications     │  │   │
│  │  │  └─ JWT + Sessions  └─ CRUD API   └─ Real-time Events   │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  │                                                                 │   │
│  │  ┌──────────────────────────────────────────────────────────┐  │   │
│  │  │  Middleware Stack:                                       │  │   │
│  │  │  Auth │ Validation │ Rate Limit │ Error Handling │ CORS │  │   │
│  │  └──────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                         Drizzle ORM │                                   │
│                                    ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                        POSTGRESQL DATABASE                      │   │
│  │  Users │ Jobs │ Applications │ Companies │ Skills │ Sessions   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### The Three Dashboards

#### 👤 Developer Dashboard
| Feature | Description |
|---------|-------------|
| Job Search | Advanced filtering, saved searches, job alerts |
| Applications | Track status, manage documents |
| Profile | Skills, experience, portfolio links |
| Notifications | Real-time alerts for application updates |

#### 🏢 Recruiter Dashboard
| Feature | Description |
|---------|-------------|
| Job Posting | Create, edit, close listings |
| Applicant Review | View applications, schedule interviews |
| Analytics | Views, applications, conversion rates |
| Messaging | Contact candidates directly |

#### ⚙️ Admin Dashboard
| Feature | Description |
|---------|-------------|
| User Management | View, suspend, delete accounts |
| Content Moderation | Review flagged posts |
| Platform Settings | Configure features, limits |
| System Analytics | User growth, performance metrics |

---

## 📚 Course Structure: 59 Lessons, 15 Modules

Your learning path is carefully designed to build skills progressively:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         COURSE PROGRESSION                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  PHASE 1: FOUNDATIONS (Modules 01-04)                                   │
│  ├─ Module 01: Introduction ←── YOU ARE HERE                            │
│  ├─ Module 02: Node.js Core Concepts                                    │
│  ├─ Module 03: File System & Streams                                    │
│  └─ Module 04: Modules & Package Management                             │
│                                                                         │
│  PHASE 2: WEB FUNDAMENTALS (Modules 05-07)                              │
│  ├─ Module 05: HTTP Protocol Deep Dive                                  │
│  ├─ Module 06: Express 5 Fundamentals                                   │
│  └─ Module 07: Middleware & Request Pipeline                            │
│                                                                         │
│  PHASE 3: DATA & PERSISTENCE (Modules 08-09)                            │
│  ├─ Module 08: PostgreSQL & SQL Fundamentals                            │
│  └─ Module 09: Drizzle ORM & Migrations                                 │
│                                                                         │
│  PHASE 4: SECURITY & AUTH (Module 10)                                   │
│  └─ Module 10: Authentication & Authorization                           │
│                                                                         │
│  PHASE 5: BUILDING DEVJOBS PRO (Modules 11-13)                          │
│  ├─ Module 11: API Design & Implementation                              │
│  ├─ Module 12: Real-time Features                                       │
│  └─ Module 13: Testing & Quality                                        │
│                                                                         │
│  PHASE 6: PRODUCTION (Modules 14-15)                                    │
│  ├─ Module 14: Performance & Optimization                               │
│  └─ Module 15: Deployment & DevOps                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Lesson Structure (Every Lesson)

Each lesson follows a consistent, effective format:

| Section | Purpose |
|---------|---------|
| 🎯 Hook | Inspiring introduction connecting to real-world |
| 📖 Theory | Conceptual explanations with diagrams |
| 💻 Examples | Standalone code (JS + TS versions) |
| 🛠️ Practice | Hands-on exercises building DevJobs Pro |
| 💡 Pro Tips | Senior developer insights |
| 🔧 Debugger | Common errors and fixes |
| ✅ Definition of Done | Checklist to verify understanding |
| 🚀 Next Steps | Connection to next lesson |

---

## 🛠️ Tech Stack Detailed

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 24.x LTS | JavaScript runtime |
| **Express** | 5.x | Web framework |
| **TypeScript** | 5.x | Type safety |
| **PostgreSQL** | 16.x | Primary database |
| **Drizzle ORM** | Latest | Database toolkit |

### Supporting Libraries

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           TECH STACK OVERVIEW                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  RUNTIME & FRAMEWORK                    VALIDATION & SECURITY           │
│  ├── Node.js 24 LTS                     ├── Zod (schema validation)     │
│  ├── Express 5                          ├── bcrypt (password hashing)   │
│  └── TypeScript 5                       ├── helmet (security headers)   │
│                                         └── cors (cross-origin)         │
│  DATABASE                                                               │
│  ├── PostgreSQL 16                      AUTHENTICATION                  │
│  ├── Drizzle ORM                        ├── JWT (JSON Web Tokens)       │
│  └── Drizzle Kit (migrations)           └── express-session             │
│                                                                         │
│  DEVELOPMENT                            REAL-TIME                       │
│  ├── tsx (TypeScript runner)            └── Socket.io                   │
│  ├── ESLint + Prettier                                                  │
│  ├── Vitest (testing)                   DEPLOYMENT                      │
│  └── nodemon (hot reload)               ├── Docker                      │
│                                         ├── GitHub Actions (CI/CD)      │
│  API DOCUMENTATION                      └── Your choice of host         │
│  └── Swagger/OpenAPI                                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Setup Requirements

### Required Software

#### 1. **Node.js 24 LTS**

```bash
# Check if installed
node --version  # Should show v24.x.x

# Install via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc  # or ~/.zshrc
nvm install 24
nvm use 24
nvm alias default 24
```

#### 2. **VS Code with Extensions**

Required extensions:
- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript + JavaScript** - Language support
- **Thunder Client** or **REST Client** - API testing
- **PostgreSQL** - Database explorer
- **GitLens** - Git visualization

```bash
# Install VS Code extensions via CLI
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension rangav.vscode-thunder-client
code --install-extension cweijan.vscode-postgresql-client2
code --install-extension eamodio.gitlens
```

#### 3. **Package Manager (choose one)**

```bash
# npm (comes with Node.js)
npm --version

# OR pnpm (faster, more efficient)
npm install -g pnpm
pnpm --version
```

#### 4. **PostgreSQL 16**

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS with Homebrew
brew install postgresql@16
brew services start postgresql@16

# Windows: Download installer from postgresql.org

# Verify installation
psql --version
```

#### 5. **Git**

```bash
# Check installation
git --version

# Configure (if not done)
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

---

## 📁 Project Structure Overview

This is how we'll organize the DevJobs Pro backend:

```
devjobs-pro/
├── 📁 src/
│   ├── 📁 config/              # Configuration & environment
│   │   ├── database.ts         # DB connection setup
│   │   ├── env.ts              # Environment variables
│   │   └── index.ts            # Config exports
│   │
│   ├── 📁 db/                  # Database layer
│   │   ├── 📁 migrations/      # SQL migrations
│   │   ├── 📁 schema/          # Drizzle schema definitions
│   │   │   ├── users.ts
│   │   │   ├── jobs.ts
│   │   │   └── applications.ts
│   │   ├── index.ts            # DB client export
│   │   └── seed.ts             # Seed data
│   │
│   ├── 📁 modules/             # Feature modules
│   │   ├── 📁 auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validation.ts
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── 📁 jobs/
│   │   │   ├── jobs.controller.ts
│   │   │   ├── jobs.service.ts
│   │   │   ├── jobs.routes.ts
│   │   │   └── jobs.types.ts
│   │   │
│   │   ├── 📁 users/
│   │   └── 📁 applications/
│   │
│   ├── 📁 middleware/          # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── rateLimiter.middleware.ts
│   │
│   ├── 📁 utils/               # Shared utilities
│   │   ├── logger.ts
│   │   ├── asyncHandler.ts
│   │   └── responses.ts
│   │
│   ├── 📁 types/               # TypeScript types
│   │   └── index.ts
│   │
│   ├── app.ts                  # Express app setup
│   └── server.ts               # Server entry point
│
├── 📁 tests/                   # Test files
│   ├── 📁 unit/
│   ├── 📁 integration/
│   └── 📁 e2e/
│
├── 📁 docs/                    # API documentation
│
├── .env                        # Environment variables (git ignored)
├── .env.example                # Environment template
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── drizzle.config.ts           # Drizzle configuration
├── package.json
├── tsconfig.json
└── README.md
```

### Architecture Pattern: Module-Based

We use a **feature-based module structure** instead of the traditional MVC:

```
Traditional MVC (harder to scale):      Feature Modules (our approach):
├── controllers/                        ├── modules/
│   ├── authController.ts               │   ├── auth/
│   ├── jobsController.ts               │   │   ├── auth.controller.ts
│   └── usersController.ts              │   │   ├── auth.service.ts
├── models/                             │   │   ├── auth.routes.ts
│   ├── User.ts                         │   │   └── auth.types.ts
│   └── Job.ts                          │   ├── jobs/
├── routes/                             │   │   └── ... (all job-related)
│   ├── authRoutes.ts                   │   └── users/
│   └── jobsRoutes.ts                   │       └── ... (all user-related)
```

**Why modules?**
- All related code is together
- Easy to understand what a feature does
- Simple to add/remove features
- Better for team collaboration

---

## ✅ Prerequisites Checklist

Before starting Module 02, ensure you have:

### Technical Knowledge
- [ ] **JavaScript Fundamentals**: Variables, functions, arrays, objects
- [ ] **ES6+ Features**: Arrow functions, destructuring, spread operator, async/await
- [ ] **Basic Terminal/CLI**: Navigate directories, run commands
- [ ] **Git Basics**: clone, commit, push, pull, branches

### Environment Setup
- [ ] Node.js 24 LTS installed (`node --version`)
- [ ] npm or pnpm working (`npm --version`)
- [ ] VS Code installed with recommended extensions
- [ ] Git configured with your identity
- [ ] PostgreSQL installed (we'll set up DB in Module 08)

### Mindset
- [ ] Ready to type code, not just copy-paste
- [ ] Prepared to struggle (that's how learning works!)
- [ ] Committed to completing exercises, not skipping them
- [ ] Curious about "why" not just "how"

---

## 📖 How to Use This Course

### The Three-Step Process

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      OPTIMAL LEARNING FLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   STEP 1: THEORY (📖 Read)                                              │
│   ├── Read the entire theory section                                    │
│   ├── Study the ASCII diagrams                                          │
│   ├── Understand the "why" before the "how"                             │
│   └── Don't skip! Understanding prevents bugs later                     │
│                                                                         │
│   STEP 2: EXAMPLES (💻 Study)                                           │
│   ├── Read through both JS and TS versions                              │
│   ├── Type the code yourself (muscle memory!)                           │
│   ├── Run the code and observe behavior                                 │
│   └── Experiment: change values, break things                           │
│                                                                         │
│   STEP 3: PRACTICE (🛠️ Build)                                           │
│   ├── Complete the hands-on exercises                                   │
│   ├── Apply concepts to DevJobs Pro                                     │
│   ├── Commit your code after each lesson                                │
│   └── Don't peek at solutions until you've tried                        │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Tips for Maximum Learning

| Do | Don't |
|----|-------|
| Type every code example | Copy-paste without understanding |
| Read error messages carefully | Just Google the fix without understanding |
| Take breaks when stuck (walk!) | Frustrate yourself for hours |
| Commit after each lesson | Forget to version control |
| Revisit confusing topics | Rush to "finish" the course |
| Ask questions (use resources) | Suffer in silence |

---

## 💡 Pro Tips vs Junior Traps

| Aspect | 🟢 Pro Tip | 🔴 Junior Trap |
|--------|-----------|----------------|
| **Learning** | Type every example manually. Your brain learns through your fingers. | Copy-pasting code teaches you nothing—you'll forget it tomorrow. |
| **Debugging** | When stuck, explain the problem out loud (rubber duck). Often, you'll find the answer while explaining. | Randomly changing code hoping something works. |
| **Time Management** | Consistent daily learning (1-2 hours) beats weekend cramming. Spaced repetition works. | Binge-learning for 8 hours, then nothing for weeks. |

---

## 🔧 5-Minute Debugger: Setup Issues

### Issue 1: "nvm: command not found"

```bash
# Make sure nvm is in your shell profile
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
source ~/.bashrc

# For Zsh users, use ~/.zshrc instead
```

### Issue 2: "permission denied" when installing global packages

```bash
# DO NOT use sudo with npm!
# Instead, fix npm permissions:

mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Issue 3: PostgreSQL won't start

```bash
# Check status
sudo systemctl status postgresql

# Check logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log

# Common fix: ensure data directory has correct permissions
sudo chown -R postgres:postgres /var/lib/postgresql/16/main
```

### Issue 4: VS Code doesn't recognize Node.js

```bash
# Ensure Node is in your PATH
which node

# Restart VS Code after installing Node.js
# Or reload the window: Ctrl+Shift+P → "Reload Window"
```

---

## ✅ Definition of Done

You're ready to start Module 02 when:

- [ ] Node.js 24 LTS is installed and verified
- [ ] npm/pnpm works correctly
- [ ] VS Code has recommended extensions installed
- [ ] Git is configured with your name and email
- [ ] You understand the course structure (15 modules, 59 lessons)
- [ ] You know what DevJobs Pro is and what we're building
- [ ] You've committed to the theory → practice → code workflow
- [ ] You're excited to start coding! 🚀

---

## 🚀 Next Steps

**Congratulations.* You've completed Module 01: Introduction.

You now understand:
- What Node.js is and how it works
- When to use Node.js (and when not to)
- What we're building and how the course is structured
- How to set up your development environment

**→ Next: [Module 02 - Node.js Core Concepts](../02-nodejs-core/README.md)**

In Module 02, we dive deep into Node.js internals:
- The global object and process
- Modules and require/import
- Event emitters in depth
- Buffers and binary data
- Understanding the event loop phases

Get ready to truly understand Node.js from the inside out.

---

<div align="center">

**🎉 Module 01 Complete!**

[Lesson 1](./01-what-is-nodejs.md) ← [Lesson 2](./02-why-nodejs-for-backends.md) ← **Lesson 3** | [→ Start Module 02](../02-nodejs-core/README.md)

---

*"The journey of a thousand miles begins with a single step."* — Lao Tzu

Your first step is complete. Now the real adventure begins.

</div>

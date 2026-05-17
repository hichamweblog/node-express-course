# Lesson 02: MongoDB vs SQL — When to Choose

> **Module 01: Introduction & Architecture** | **Lesson 2 of 4** | ⏱️ 50 minutes

---

## 🎯 Hook: SQL Isn't Always the Answer

You learned PostgreSQL in Courses 1 & 2. It's excellent for structured, relational data. But project management data is **deeply nested and flexible** — tasks have checklists, labels, attachments, subtasks, and comments. MongoDB handles this naturally.

---

## 📖 Theory: The Great Database Decision

```
┌─────────────────────────────────────────────────────────────────┐
│              SQL vs NoSQL DECISION FRAMEWORK                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   CHOOSE SQL (PostgreSQL) WHEN:                                 │
│   ✅ Data has strong, predictable relationships                 │
│   ✅ Transactions are critical (money, inventory)               │
│   ✅ Schema rarely changes                                      │
│   ✅ Complex JOINs are needed                                   │
│   ✅ ACID compliance is non-negotiable                          │
│   → Examples: Banking, E-commerce, ERP                          │
│                                                                  │
│   CHOOSE NoSQL (MongoDB) WHEN:                                  │
│   ✅ Data is hierarchical or deeply nested                      │
│   ✅ Schema evolves frequently                                  │
│   ✅ Read patterns favor denormalization                        │
│   ✅ Documents are self-contained units                         │
│   ✅ Horizontal scaling is important                            │
│   → Examples: CMS, Real-time apps, IoT, Project mgmt           │
│                                                                  │
│   ⚠️ WRONG REASONS TO CHOOSE NoSQL:                            │
│   ❌ "SQL is old" (it's proven and powerful)                    │
│   ❌ "NoSQL is faster" (depends on the query)                   │
│   ❌ "I don't want to learn SQL" (learn both!)                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Why MongoDB for TaskForge

```
SQL Approach (Normalized):              MongoDB Approach (Document):
─────────────────────────               ──────────────────────────
tasks table                             tasks collection
├── id, title, boardId                  {
├── task_labels table (JOIN)              _id: "...",
├── task_assignees table (JOIN)           title: "Fix login",
├── task_checklist table (JOIN)           labels: ["bug", "urgent"],
├── task_attachments table (JOIN)         assignees: [userId1, userId2],
└── task_subtasks table (JOIN)            checklist: [
                                            { text: "Reproduce", done: true },
5 JOINs to load ONE task!                  { text: "Write fix", done: false }
                                          ],
                                          attachments: [...],
                                          subtasks: [...]
                                        }

                                        1 query to load the ENTIRE task!
```

### Embedding vs Referencing

```
┌──────────────────────────────────────────────────────────┐
│         EMBEDDING vs REFERENCING DECISION                 │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   EMBED when:                   REFERENCE when:          │
│   ├── Data belongs to parent    ├── Data is shared       │
│   ├── Always read together      ├── Grows unbounded      │
│   ├── Bounded growth            ├── Queried independently│
│   └── < 16MB total              └── Many-to-many         │
│                                                           │
│   TaskForge decisions:                                   │
│   ✅ EMBED: checklist in task (always loaded together)   │
│   ✅ EMBED: columns in board (bounded, always together)  │
│   ✅ EMBED: members in workspace (bounded, ~50 max)      │
│   📎 REFERENCE: comments → task (can grow unbounded)     │
│   📎 REFERENCE: tasks → board (queried independently)    │
│   📎 REFERENCE: activities (queried by time range)       │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ Definition of Done

- [ ] Explain when to choose SQL vs NoSQL with specific examples
- [ ] Identify embedding vs referencing for TaskForge entities
- [ ] Explain the 16MB document size limit and its implications

---

<div align="center">

**Module 01** | [Lesson 1](./01-course-overview-architecture.md) → **Lesson 2** → [Lesson 3](./03-socketio-realtime-intro.md)

</div>

# Lesson 01: Schemas, Validation & Virtuals

> **Module 03** | **Lesson 1 of 4** | ⏱️ 50 minutes

---

## 🎯 Hook: MongoDB Is Schemaless. Mongoose Adds Structure.

MongoDB doesn't enforce schemas — you CAN insert anything. But in production, you NEED validation. Mongoose adds TypeScript-style safety to MongoDB documents.

---

## 📖 Theory: Mongoose Schema System

```
┌──────────────────────────────────────────────────────────────┐
│              MONGOOSE SCHEMA vs PRISMA SCHEMA                 │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   PRISMA (StoreFlow):              MONGOOSE (TaskForge):     │
│   ─────────────────                 ─────────────────────    │
│   model User {                     const userSchema = new    │
│     id    String @id               Schema({                  │
│     email String @unique             email: {                │
│     name  String                       type: String,         │
│   }                                    required: true,       │
│                                        unique: true,         │
│   → Prisma generates SQL               validate: {          │
│   → Schema lives in .prisma             validator: isEmail   │
│   → Compile-time types                }                      │
│                                      },                      │
│                                      name: { type: String }  │
│                                    });                        │
│                                                               │
│                                    → Mongoose validates at    │
│                                      runtime                 │
│                                    → Schema lives in .ts code│
│                                    → Runtime + TS types       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Virtuals — Computed Properties

```typescript
// Virtual: full name from first + last
userSchema.virtual('displayName').get(function () {
  return `${this.name} <${this.email}>`;
});

// Virtual: checklist progress
taskSchema.virtual('checklistProgress').get(function () {
  if (this.checklist.length === 0) return 0;
  const done = this.checklist.filter(item => item.isCompleted).length;
  return Math.round((done / this.checklist.length) * 100);
});

// Enable virtuals in JSON output
{ toJSON: { virtuals: true }, toObject: { virtuals: true } }
```

## Custom Validation

```typescript
const taskSchema = new Schema({
  priority: {
    type: String,
    enum: {
      values: ['urgent', 'high', 'medium', 'low', 'none'],
      message: '{VALUE} is not a valid priority',
    },
  },
  dueDate: {
    type: Date,
    validate: {
      validator: (v: Date) => v > new Date(),
      message: 'Due date must be in the future',
    },
  },
});
```

---

## ✅ Definition of Done

- [ ] Compare Prisma schemas to Mongoose schemas
- [ ] Write custom validators for TaskForge fields
- [ ] Create computed virtuals for checklist progress

---

<div align="center">

**Module 03** | **Lesson 1** → [Lesson 2](./02-middleware-hooks.md)

</div>

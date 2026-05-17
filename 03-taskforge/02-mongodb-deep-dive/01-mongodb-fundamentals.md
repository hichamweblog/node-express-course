# Lesson 01: MongoDB Fundamentals & CRUD

> **Module 02** | **Lesson 1 of 4** | ⏱️ 50 minutes

---

## 🎯 Hook: Documents, Not Rows

In PostgreSQL, you think in **tables and rows**. In MongoDB, you think in **collections and documents**. A document is a JSON object — and it can contain nested objects, arrays, and other documents.

---

## 📖 Theory: MongoDB Core Concepts

```
┌──────────────────────────────────────────────────────────┐
│        SQL → MongoDB TERMINOLOGY MAPPING                  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   SQL                 MongoDB                            │
│   ───                 ───────                            │
│   Database            Database                           │
│   Table               Collection                         │
│   Row                 Document                           │
│   Column              Field                              │
│   Primary Key         _id (auto-generated ObjectId)      │
│   JOIN                $lookup (aggregation) or populate   │
│   Schema              Flexible (enforced by Mongoose)    │
│   Transaction         Transaction (multi-doc since 4.0)  │
│                                                           │
│   KEY DIFFERENCE:                                        │
│   SQL row:    { id: 1, name: "Alice", role: "admin" }   │
│   Mongo doc:  {                                          │
│     _id: ObjectId("..."),                                │
│     name: "Alice",                                       │
│     preferences: { theme: "dark", lang: "en" },         │
│     teams: ["engineering", "devops"]                     │
│   }                                                      │
│   → Documents can contain nested objects and arrays!     │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## CRUD Operations

```javascript
// CREATE
db.users.insertOne({ email: "alice@example.com", name: "Alice" });
db.users.insertMany([{ name: "Bob" }, { name: "Charlie" }]);

// READ
db.users.findOne({ email: "alice@example.com" });
db.users.find({ name: { $regex: /^A/i } });

// UPDATE
db.users.updateOne({ _id: id }, { $set: { name: "Alice Smith" } });
db.users.updateMany({ isActive: false }, { $set: { isActive: true } });

// DELETE
db.users.deleteOne({ _id: id });
db.users.deleteMany({ lastLoginAt: { $lt: oneYearAgo } });
```

---

## ✅ Definition of Done

- [ ] Map SQL concepts to MongoDB equivalents
- [ ] Write CRUD operations using MongoDB shell syntax
- [ ] Explain ObjectId structure and generation
- [ ] Insert, query, update, and delete documents

---

<div align="center">

**Module 02** | **Lesson 1** → [Lesson 2](./02-query-operators.md)

</div>

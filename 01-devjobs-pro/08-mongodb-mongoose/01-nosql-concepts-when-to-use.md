# Lesson 1: NoSQL Concepts & When to Use

## 🎯 Learning Objectives

By the end of this lesson, you'll:

- Understand the fundamental differences between SQL and NoSQL databases
- Know what document databases are and how they store data
- Apply a decision framework for choosing between MongoDB and PostgreSQL
- Understand CAP theorem and its practical implications
- Analyze data modeling tradeoffs (normalization vs denormalization)

---

## 🪝 Hook: SQL Isn't the Only Way

You've probably heard "use a database" and assumed that meant PostgreSQL or MySQL—tables, rows, SQL queries, and joins. That's the relational world, and it's powerful.

But what if your data doesn't fit neatly into tables? What if you need:

- Rapidly changing schemas during prototyping
- Storing complex nested objects without 10 joins
- Horizontal scaling across multiple servers
- Flexible data that varies between records

**Enter NoSQL databases.** They're not "better" than SQL—they're _different_. Today, we'll understand when each shines.

> **📌 Module Note:** DevJobs Pro uses PostgreSQL (Module 09). This module teaches MongoDB concepts so you can make informed database decisions in your career.

---

## 📚 Core Concepts

### SQL vs NoSQL: The Fundamental Difference

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SQL (Relational) Databases                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Tables with fixed schemas     Data in rows and columns            │
│   ┌──────────────────────────────────────────────────┐              │
│   │  id  │  name    │  email           │  role      │              │
│   ├──────┼──────────┼──────────────────┼────────────┤              │
│   │  1   │  Alice   │  alice@mail.com  │  admin     │              │
│   │  2   │  Bob     │  bob@mail.com    │  user      │              │
│   └──────┴──────────┴──────────────────┴────────────┘              │
│                                                                     │
│   Relationships via JOINs       ACID transactions                   │
│   Structured Query Language     Vertical scaling                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   NoSQL (Document) Databases                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Collections of flexible documents    Data as JSON-like objects    │
│   ┌────────────────────────────────────┐                            │
│   │ {                                  │                            │
│   │   "_id": ObjectId("..."),          │                            │
│   │   "name": "Alice",                 │                            │
│   │   "email": "alice@mail.com",       │                            │
│   │   "role": "admin",                 │                            │
│   │   "preferences": {                 │  ← Nested objects OK!      │
│   │     "theme": "dark",               │                            │
│   │     "notifications": true          │                            │
│   │   },                               │                            │
│   │   "skills": ["node", "python"]     │  ← Arrays OK!              │
│   │ }                                  │                            │
│   └────────────────────────────────────┘                            │
│                                                                     │
│   Flexible schema                Horizontal scaling                 │
│   Embedded data                  Eventual consistency (often)       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Document Database Terminology

| SQL Term    | MongoDB Term         | Description                              |
| ----------- | -------------------- | ---------------------------------------- |
| Database    | Database             | Container for collections                |
| Table       | Collection           | Group of documents                       |
| Row         | Document             | Single data record (JSON-like)           |
| Column      | Field                | Key-value in document                    |
| Primary Key | `_id`                | Unique identifier (ObjectId)             |
| Foreign Key | Reference            | ObjectId pointing to another document    |
| JOIN        | `$lookup` / populate | Combining data from multiple collections |

### What is BSON?

MongoDB stores documents in **BSON** (Binary JSON)—a binary representation of JSON with additional data types:

```typescript
// JSON (what you write)
{
  "name": "Alice",
  "createdAt": "2024-01-15T10:30:00Z",
  "salary": 75000
}

// BSON (how MongoDB stores it) - adds types:
{
  "name": "Alice",                    // String
  "createdAt": ISODate("..."),        // Native Date type
  "salary": NumberLong(75000),        // 64-bit integer
  "_id": ObjectId("507f1f77bcf...")   // Unique 12-byte ID
}
```

**BSON advantages:**

- Native date, binary, and decimal types
- Efficient for storage and scanning
- Supports types JSON lacks (ObjectId, Date, Binary, Decimal128)

---

## 🎯 When to Choose: SQL vs NoSQL Decision Framework

### The Decision Tree

```
                    ┌─────────────────────────┐
                    │  What's your data like? │
                    └───────────┬─────────────┘
                                │
              ┌─────────────────┴─────────────────┐
              ▼                                   ▼
    ┌─────────────────┐                 ┌─────────────────┐
    │ Highly relational│                │ Self-contained  │
    │ Many-to-many     │                │ Nested/varied   │
    │ Complex joins    │                │ Objects         │
    └────────┬────────┘                 └────────┬────────┘
             │                                   │
             ▼                                   ▼
    ┌─────────────────┐                 ┌─────────────────┐
    │ Need ACID for   │                 │ Need horizontal │
    │ transactions?   │                 │ scaling?        │
    └────────┬────────┘                 └────────┬────────┘
             │                                   │
       Yes ──┼── No                         Yes ─┼─ No
             │    │                              │   │
             ▼    │                              ▼   │
    ┌────────────┐│                    ┌────────────┐│
    │ PostgreSQL ││                    │  MongoDB   ││
    │ MySQL      │◄────────────────────│            │◄─┘
    │ SQL Server │                     │            │
    └────────────┘                     └────────────┘
```

### Choose PostgreSQL (SQL) When:

✅ **Strong relationships** between entities (users → orders → products → reviews)
✅ **ACID transactions** are critical (financial data, inventory)
✅ **Data integrity** via foreign keys and constraints
✅ **Complex queries** with multiple joins
✅ **Structured data** that rarely changes shape
✅ **Reporting and analytics** with SQL aggregations

**Real-world examples:**

- Banking systems
- E-commerce with inventory management
- ERP/CRM systems
- Job boards with complex relationships (DevJobs Pro!)

### Choose MongoDB (NoSQL) When:

✅ **Flexible schemas** during rapid development
✅ **Nested objects** that belong together (user profiles with preferences)
✅ **High write throughput** for logs, events, IoT data
✅ **Horizontal scaling** across multiple servers
✅ **Document-centric** data (content management, catalogs)
✅ **Varying structure** between records

**Real-world examples:**

- Content management systems
- Real-time analytics dashboards
- IoT sensor data collection
- Product catalogs with varying attributes
- User activity logs

---

## 🧠 CAP Theorem (Simplified)

The CAP theorem states that a distributed database can only guarantee **two of three** properties:

```
                        ┌───────────────────┐
                        │   Consistency     │
                        │  (Same data on    │
                        │   all nodes)      │
                        └─────────┬─────────┘
                                  │
                    Pick 2 ───────┼─────── Pick 2
                                  │
        ┌─────────────────────────┴─────────────────────────┐
        │                                                   │
        ▼                                                   ▼
┌───────────────────┐                           ┌───────────────────┐
│   Availability    │                           │    Partition      │
│  (Always respond, │                           │    Tolerance      │
│   even if stale)  │                           │  (Works despite   │
│                   │◄──────── Pick 2 ─────────►│   network splits) │
└───────────────────┘                           └───────────────────┘
```

**In practice:**

| Database   | CAP Priority                            | Trade-off                                 |
| ---------- | --------------------------------------- | ----------------------------------------- |
| PostgreSQL | CP (Consistency + Partition Tolerance)  | May be unavailable during network issues  |
| MongoDB    | CP by default, configurable             | Strong consistency, or eventual for speed |
| Cassandra  | AP (Availability + Partition Tolerance) | Eventual consistency (reads may be stale) |

**What this means for you:**

- **Financial data?** Choose consistency (PostgreSQL, MongoDB with strong reads)
- **Social media feed?** Availability is fine (a few seconds of stale data is OK)
- **Real-time analytics?** Availability + speed, eventual consistency acceptable

---

## 📊 Normalization vs Denormalization

### Normalized Data (SQL Style)

```sql
-- Separate tables, no duplication, use JOINs
-- users table
| id | name  | email           |
|----|-------|-----------------|
| 1  | Alice | alice@mail.com  |

-- addresses table (separate)
| id | user_id | street    | city       |
|----|---------|-----------|------------|
| 1  | 1       | 123 Main  | New York   |
| 2  | 1       | 456 Oak   | Boston     |

-- Query requires JOIN
SELECT u.name, a.city
FROM users u
JOIN addresses a ON u.id = a.user_id;
```

**Pros:** No duplication, easy updates, data integrity
**Cons:** JOINs can be slow, complex queries

### Denormalized Data (MongoDB Style)

```typescript
// Single document with embedded data
{
  "_id": ObjectId("..."),
  "name": "Alice",
  "email": "alice@mail.com",
  "addresses": [                          // Embedded array
    { "street": "123 Main", "city": "New York" },
    { "street": "456 Oak", "city": "Boston" }
  ]
}

// Query is simple - no joins needed
db.users.findOne({ name: "Alice" })
```

**Pros:** Fast reads (all data in one query), simple queries
**Cons:** Data duplication, updates can be complex

### When to Embed vs Reference in MongoDB

```
┌─────────────────────────────────────────────────────────────────────┐
│                      EMBED (Denormalize) when:                      │
├─────────────────────────────────────────────────────────────────────┤
│  • Data is read together frequently                                 │
│  • Child data belongs to exactly one parent (1:1, 1:few)            │
│  • Child data doesn't change often                                  │
│  • Document size stays under 16MB limit                             │
│                                                                     │
│  Example: User → Addresses, Order → Line Items                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     REFERENCE (Normalize) when:                     │
├─────────────────────────────────────────────────────────────────────┤
│  • Data is accessed independently                                   │
│  • Many-to-many relationships                                       │
│  • Data is shared across many documents                             │
│  • Need to avoid duplication of frequently updated data             │
│                                                                     │
│  Example: Job → Company (company shared by many jobs)               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 💡 Example: Same Data, Two Paradigms

Let's model a job posting in both SQL and MongoDB:

### SQL Approach (3 Tables + JOINs)

```sql
-- companies table
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  logo_url VARCHAR(255)
);

-- jobs table
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  company_id INTEGER REFERENCES companies(id),
  salary_min INTEGER,
  salary_max INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- job_technologies table (many-to-many)
CREATE TABLE job_technologies (
  job_id INTEGER REFERENCES jobs(id),
  technology VARCHAR(50),
  PRIMARY KEY (job_id, technology)
);

-- Query to get a job with company and technologies
SELECT
  j.*,
  c.name as company_name,
  c.logo_url,
  array_agg(jt.technology) as technologies
FROM jobs j
JOIN companies c ON j.company_id = c.id
LEFT JOIN job_technologies jt ON j.id = jt.job_id
WHERE j.id = 1
GROUP BY j.id, c.id;
```

### MongoDB Approach (Single Document)

```typescript
// jobs collection - single document has everything
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "title": "Senior Node.js Developer",
  "company": {                              // Embedded company info
    "name": "TechCorp",
    "logoUrl": "https://..."
  },
  "salary": {                               // Nested object
    "min": 80000,
    "max": 120000,
    "currency": "USD"
  },
  "technologies": ["Node.js", "TypeScript", "MongoDB"],  // Array
  "createdAt": ISODate("2024-01-15T10:30:00Z")
}

// Query - simple, no joins
db.jobs.findOne({ _id: ObjectId("507f1f77bcf86cd799439011") })
```

**Analysis:**

| Aspect              | SQL            | MongoDB              |
| ------------------- | -------------- | -------------------- |
| Read performance    | Slower (JOIN)  | Faster (single read) |
| Update company name | One place      | Every job document!  |
| Schema enforcement  | Database level | Application level    |
| Query complexity    | Higher         | Lower                |

---

## 🎯 Practice Exercise: Analyze DevJobs Pro Schema

> **Note:** This is a thought exercise. DevJobs Pro uses PostgreSQL—we're analyzing how it _could_ be modeled in MongoDB.

### DevJobs Pro Entities

1. **Users** (job seekers and employers)
2. **Companies** (post jobs)
3. **Jobs** (job listings)
4. **Applications** (users apply to jobs)
5. **Skills** (associated with jobs and users)

### Your Task

Think through these questions:

**Question 1:** Should we embed or reference?

```
User → Applications: ____________

Jobs → Company: ____________

Jobs → Skills: ____________
```

<details>
<summary>💡 Suggested Answer</summary>

```
User → Applications: REFERENCE
  - Applications are accessed independently
  - Many applications per user (could grow large)
  - Need to query applications by job too

Jobs → Company: REFERENCE (or partial embed)
  - Company data is shared across many jobs
  - If company updates name, don't want to update 1000 jobs
  - Could embed { companyId, name, logo } for read speed

Jobs → Skills: EMBED
  - Skills per job are limited (5-15 typically)
  - Always read with job
  - Skills list is relatively static per job
```

</details>

**Question 2:** What would the MongoDB document look like?

```typescript
// Design a Job document for MongoDB
{
  // Your design here...
}
```

<details>
<summary>💡 Suggested Answer</summary>

```typescript
{
  "_id": ObjectId("..."),
  "title": "Senior Backend Developer",
  "description": "Join our team...",
  "type": "full-time",
  "location": {
    "city": "San Francisco",
    "country": "USA",
    "remote": true
  },
  "salary": {
    "min": 120000,
    "max": 180000,
    "currency": "USD"
  },
  // Partial embed for read speed (denormalized)
  "company": {
    "id": ObjectId("..."),        // Reference for updates
    "name": "TechCorp",           // Cached for reads
    "logo": "https://..."         // Cached for reads
  },
  "skills": ["Node.js", "TypeScript", "PostgreSQL"],  // Embedded
  "postedBy": ObjectId("..."),    // Reference to user
  "applicantCount": 45,           // Denormalized counter
  "status": "active",
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

</details>

**Question 3:** Why does DevJobs Pro use PostgreSQL instead?

<details>
<summary>💡 Answer</summary>

DevJobs Pro is a good fit for PostgreSQL because:

1. **Strong relationships:** Users ↔ Applications ↔ Jobs ↔ Companies
2. **ACID transactions:** When a user applies, we update multiple things atomically
3. **Data integrity:** Foreign keys ensure no orphaned applications
4. **Complex queries:** "Find jobs where I applied" involves multiple joins
5. **Reporting:** SQL excels at aggregations (jobs per company, application stats)
6. **Structured data:** Job listings have a consistent shape

MongoDB _could_ work, but SQL's strengths align better with this use case.

</details>

---

## 💡 Pro Tips

### 1. NoSQL Isn't "Better"—It's Different

> "If all you have is a hammer, everything looks like a nail."

Don't pick MongoDB because it's new or "webscale." Don't pick PostgreSQL because it's what you know. **Analyze your data patterns first.**

### 2. Hybrid Approaches Exist

Many production systems use **both**:

- PostgreSQL for transactional data (users, orders)
- MongoDB for logs, activity feeds, product catalogs
- Redis for caching and sessions

### 3. Consider Your Team

If your team knows SQL well and your data is relational, that's often the right choice. **The best database is one your team can operate effectively.**

### 4. Start with the Queries

What questions will you ask your data?

```typescript
// If your queries look like this → MongoDB might fit
db.products.find({ category: "electronics", price: { $lt: 500 } })

// If your queries look like this → SQL is probably better
SELECT o.*, u.name, p.title
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.status = 'pending'
```

---

## ✅ Definition of Done

You've completed this lesson when you can:

- [ ] Explain the key differences between SQL and NoSQL databases
- [ ] Describe what a document database is and how it stores data (collections, documents, BSON)
- [ ] Apply the decision framework to choose between MongoDB and PostgreSQL
- [ ] Explain CAP theorem in simple terms
- [ ] Discuss trade-offs between normalization and denormalization
- [ ] Analyze a schema and determine appropriate data modeling strategy

---

## 🔗 Additional Resources

- [MongoDB vs PostgreSQL: A Comparison](https://www.mongodb.com/compare/mongodb-postgresql)
- [CAP Theorem Explained](https://www.ibm.com/topics/cap-theorem)
- [Data Modeling in MongoDB](https://www.mongodb.com/docs/manual/data-modeling/)

---

## ➡️ Next Lesson

Now that you understand **when** to use MongoDB, let's learn **how** to use it with Mongoose schemas and models.

**[→ Lesson 2: Mongoose Schemas & Models](./02-mongoose-schemas-models.md)**

---

<blockquote>
💡 <strong>Remember:</strong> DevJobs Pro uses PostgreSQL because its data is highly relational. You now understand why—and when you'd choose MongoDB for future projects!
</blockquote>

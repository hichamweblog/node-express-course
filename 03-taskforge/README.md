# 🔧 Course 3: TaskForge — Project Management Platform

> **🚧 Coming Soon** | The Capstone Experience

[![Status](https://img.shields.io/badge/Status-Coming%20Soon-yellow?style=for-the-badge)](.)
[![Course](https://img.shields.io/badge/Course-3%20of%203-purple?style=for-the-badge)](.)
[![Database](https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Real--Time](https://img.shields.io/badge/Real--Time-Socket.io-black?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Cache](https://img.shields.io/badge/Cache-Redis-red?style=for-the-badge&logo=redis)](https://redis.io/)

---

## 🏆 The Capstone Experience

**Congratulations!** If you've completed Courses 1 & 2, you're ready for the ultimate challenge.

TaskForge isn't just another project—it's the **culmination of everything you've learned**. You'll combine your Express mastery, authentication expertise, and database knowledge with **brand-new skills**: real-time communication, NoSQL data modeling, and collaborative features that power modern SaaS applications.

This is where junior developers become **senior-ready engineers**.

> _"The difference between a developer who can build apps and one who can build **platforms** is understanding real-time systems and NoSQL databases. TaskForge teaches both."_

---

## 📋 Course Status

| Status | Description                                         |
| :----: | --------------------------------------------------- |
|   🚧   | **Coming Soon** — Currently under development       |
|   📅   | Check the main course page for availability updates |

---

## 📋 Prerequisites

> ⚠️ **Important:** This is an advanced course. Complete the prerequisites first.

| Course                                          |   Status    | What You Learned                                                                                   |
| ----------------------------------------------- | :---------: | -------------------------------------------------------------------------------------------------- |
| **[Course 1: DevJobs Pro](../01-devjobs-pro/)** | ✅ Required | Express 5 fundamentals, TypeScript, REST APIs, PostgreSQL with Drizzle, authentication, deployment |
| **[Course 2: StoreFlow](../02-storeflow/)**     | ✅ Required | E-commerce patterns, advanced Prisma, payments, testing strategies, production patterns            |

### Expected Knowledge Before Starting

- ✅ Express.js middleware and routing architecture
- ✅ TypeScript interfaces, types, and generics
- ✅ RESTful API design principles
- ✅ Relational database modeling (PostgreSQL)
- ✅ Authentication & authorization (JWT, RBAC)
- ✅ Testing with Vitest
- ✅ Deployment to production environments

---

## ✨ What You'll Build

**TaskForge** is a full-featured collaborative project management platform—think Trello meets Asana meets Jira, but **you'll understand every line of code** because you built it yourself.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            TASKFORGE                                     │
│              Collaborative Project Management Platform                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   👥 TEAMS & WORKSPACES          📋 KANBAN BOARDS                       │
│   ├── Multi-tenant workspaces    ├── Drag-and-drop interface            │
│   ├── Team invitations           ├── Customizable columns               │
│   ├── Role-based permissions     ├── Board templates                    │
│   └── Organization settings      └── Swimlanes & filtering              │
│                                                                          │
│   ✅ TASKS & SUBTASKS            🔔 REAL-TIME COLLABORATION             │
│   ├── Rich task creation         ├── Live board sync (see changes!)     │
│   ├── Subtasks & checklists      ├── @mentions with notifications       │
│   ├── Due dates & priorities     ├── Presence indicators (who's here)   │
│   ├── Labels & categories        └── Activity feed updates              │
│   └── Assignees & watchers                                              │
│                                                                          │
│   💬 COMMENTS & MENTIONS         📎 FILE ATTACHMENTS                    │
│   ├── Threaded discussions       ├── Drag & drop uploads                │
│   ├── @user mentions             ├── Image previews                     │
│   ├── Emoji reactions            ├── GridFS storage                     │
│   └── Edit history               └── Cloud integration                  │
│                                                                          │
│   📊 ANALYTICS & SEARCH          🔍 ACTIVITY LOGGING                    │
│   ├── Productivity dashboards    ├── Full audit trails                  │
│   ├── Aggregation pipelines      ├── Change history                     │
│   └── Advanced filtering         └── Activity streams                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer            | Technology              | Purpose                            |
| ---------------- | ----------------------- | ---------------------------------- |
| **Runtime**      | Node.js                 | JavaScript runtime                 |
| **Framework**    | Express 5               | Web framework                      |
| **Language**     | TypeScript              | Type safety                        |
| **Database**     | MongoDB + Mongoose      | NoSQL document storage             |
| **Real-Time**    | Socket.io               | WebSocket communication            |
| **Pub/Sub**      | Redis                   | Real-time message broker & caching |
| **File Storage** | GridFS + Cloudinary     | Attachment handling                |
| **Frontend**     | React                   | Kanban-style interactive UI        |
| **Deployment**   | MongoDB Atlas + Railway | Cloud hosting                      |

### Why This Stack?

```
┌────────────────────────────────────────────────────────────────────┐
│                    NEW TECHNOLOGIES IN THIS COURSE                  │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🍃 MongoDB + Mongoose         🔴 Redis                            │
│  ├── NoSQL paradigm shift      ├── Real-time pub/sub               │
│  ├── Flexible schemas          ├── Session storage                 │
│  ├── Embedded documents        ├── Rate limiting                   │
│  └── Aggregation pipelines     └── Caching layer                   │
│                                                                     │
│  🔌 Socket.io                  ⚛️  React Kanban UI                  │
│  ├── Bidirectional comms       ├── Drag-and-drop (dnd-kit)         │
│  ├── Rooms & namespaces        ├── Real-time state sync            │
│  ├── Auto-reconnection         ├── Optimistic updates              │
│  └── Scaling with Redis        └── Responsive design               │
│                                                                     │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Learning Objectives

By completing TaskForge, you will:

### 🍃 Master MongoDB and Mongoose

- Design document-based schemas for complex applications
- Choose between embedding vs referencing relationships
- Write advanced queries with operators and projections
- Implement schema validation, virtuals, and middleware
- Create custom Mongoose plugins for reusable logic

### 📄 Document Database Design Patterns

- Model hierarchical data (workspaces → projects → boards → tasks)
- Handle polymorphic relationships
- Implement soft deletes and archiving
- Design for read-heavy vs write-heavy workloads
- Optimize with proper indexing strategies

### 🔌 Real-Time Communication with WebSockets

- Set up Socket.io with Express integration
- Organize code with rooms and namespaces
- Implement presence detection (online/offline status)
- Scale horizontally with Redis adapter
- Handle reconnection and offline scenarios

### 📊 Aggregation Pipelines

- Build powerful analytics dashboards
- Create team productivity reports
- Implement faceted search and filtering
- Generate real-time statistics
- Master $lookup, $unwind, $group, and more

### 📎 File Attachments with GridFS

- Store large files directly in MongoDB
- Stream uploads and downloads efficiently
- Generate thumbnails and previews
- Implement file versioning
- Integrate with Cloudinary for optimization

### 🔔 Activity Streams and Notifications

- Build comprehensive audit logging
- Implement @mentions with notifications
- Create activity feeds (like GitHub/Jira)
- Design notification preferences
- Handle notification delivery (in-app, email)

---

## 📚 Module Overview

### Phase 1: Foundations

| Module | Title                           | Topics                                                                                    |
| :----: | ------------------------------- | ----------------------------------------------------------------------------------------- |
| 📁 01  | **Introduction & Architecture** | Course overview, MongoDB vs SQL decision-making, project architecture, development setup  |
| 📁 02  | **MongoDB Deep Dive**           | MongoDB fundamentals, Atlas cloud setup, CRUD operations, MongoDB Compass, Shell commands |
| 📁 03  | **Mongoose Advanced Patterns**  | Schemas, validation, virtuals, middleware, plugins, indexes, population strategies        |

### Phase 2: Core Structure

| Module | Title                   | Topics                                                                                 |
| :----: | ----------------------- | -------------------------------------------------------------------------------------- |
| 📁 04  | **Teams & Workspaces**  | Multi-tenant data modeling, team CRUD, membership management, workspace settings       |
| 📁 05  | **Projects & Boards**   | Project management, board creation, column configuration, templates, project settings  |
| 📁 06  | **Tasks & Assignments** | Task CRUD, drag-and-drop ordering, subtasks, checklists, due dates, priorities, labels |

### Phase 3: Real-Time Features

| Module | Title                        | Topics                                                                                       |
| :----: | ---------------------------- | -------------------------------------------------------------------------------------------- |
| 📁 07  | **Real-Time with Socket.io** | Socket.io setup, rooms, namespaces, live board sync, presence indicators, Redis adapter      |
| 📁 08  | **Notifications System**     | In-app notifications, @mentions, email digests, notification preferences, real-time delivery |

### Phase 4: Advanced Features

| Module | Title                     | Topics                                                                            |
| :----: | ------------------------- | --------------------------------------------------------------------------------- |
| 📁 09  | **Aggregation Pipelines** | MongoDB aggregations, analytics dashboards, productivity reports, custom queries  |
| 📁 10  | **File Attachments**      | GridFS setup, file uploads, Cloudinary integration, image optimization, previews  |
| 📁 11  | **Activity Logging**      | Audit trails, activity feeds, change tracking, history views, undo patterns       |
| 📁 12  | **Search & Filtering**    | MongoDB text search, faceted search, complex queries, saved filters, autocomplete |

### Phase 5: Production Ready

| Module | Title                    | Topics                                                                                |
| :----: | ------------------------ | ------------------------------------------------------------------------------------- |
| 📁 13  | **Testing WebSockets**   | Testing real-time features, Socket.io mocking, integration tests, E2E with Playwright |
| 📁 14  | **Deployment & Scaling** | MongoDB Atlas production, connection pooling, Redis clusters, monitoring, security    |

---

## ✨ Project Features

### 👥 Team Workspaces

- Create isolated workspaces for different teams/organizations
- Invite members via email with role assignment
- Workspace-level settings and customization
- Multi-tenant data isolation

### 📋 Kanban Boards with Drag-and-Drop

- Intuitive drag-and-drop interface (react-beautiful-dnd / dnd-kit)
- Customizable columns and swimlanes
- Board templates for quick setup
- Keyboard accessibility

### ✅ Tasks with Subtasks and Checklists

- Rich task editor with markdown support
- Nested subtasks for complex work breakdown
- Checklists with progress tracking
- Multiple assignees and watchers

### 🔄 Real-Time Collaboration (See Live Updates!)

- Instant board updates across all connected clients
- See other users' cursors and selections
- Live typing indicators in comments
- Conflict resolution for simultaneous edits

### 💬 @Mentions and Notifications

- @mention teammates in comments and descriptions
- In-app notification center
- Email digests (daily/weekly summaries)
- Customizable notification preferences

### 📊 Activity Feed

- Complete audit trail of all changes
- "Who did what and when" visibility
- Filter by user, date, or action type
- Activity timeline per task/board/project

### 📎 File Attachments

- Drag-and-drop file uploads
- Image previews and thumbnails
- GridFS storage with streaming
- File versioning support

### 🔍 Search and Filtering

- Full-text search across all content
- Faceted filtering (by status, assignee, labels, etc.)
- Saved search queries
- Quick filters and keyboard shortcuts

---

## 🗄️ Database Schema Preview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TASKFORGE MONGODB COLLECTIONS                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐         ┌──────────────┐         ┌──────────────┐        │
│   │    USERS     │         │  WORKSPACES  │         │   PROJECTS   │        │
│   ├──────────────┤         ├──────────────┤         ├──────────────┤        │
│   │ _id          │────────▶│ _id          │────────▶│ _id          │        │
│   │ email        │         │ name         │         │ name         │        │
│   │ name         │         │ slug         │         │ description  │        │
│   │ avatar       │         │ members: [{  │         │ workspaceId  │        │
│   │ password     │         │   userId     │         │ settings     │        │
│   │ preferences  │         │   role       │         │ createdBy    │        │
│   │ createdAt    │         │   joinedAt   │         │ createdAt    │        │
│   └──────────────┘         │ }]           │         └──────────────┘        │
│          │                 │ settings     │                │                │
│          │                 │ createdAt    │                │                │
│          │                 └──────────────┘                ▼                │
│          │                                          ┌──────────────┐        │
│          │                                          │    BOARDS    │        │
│          │                                          ├──────────────┤        │
│          │                                          │ _id          │        │
│          │                                          │ name         │        │
│          │                                          │ projectId    │        │
│          │                                          │ columns: [{  │        │
│          │                                          │   id, name,  │        │
│          │                                          │   order      │        │
│          │                                          │ }]           │        │
│          │                 ┌──────────────┐         │ settings     │        │
│          │                 │    TASKS     │◀────────│ createdAt    │        │
│          │                 ├──────────────┤         └──────────────┘        │
│          │                 │ _id          │                                 │
│          └────────────────▶│ title        │                                 │
│                            │ description  │                                 │
│                            │ boardId      │         ┌──────────────┐        │
│                            │ columnId     │         │  ACTIVITIES  │        │
│                            │ position     │────────▶├──────────────┤        │
│                            │ assignees[]  │         │ _id          │        │
│                            │ labels[]     │         │ action       │        │
│                            │ priority     │         │ entityType   │        │
│                            │ dueDate      │         │ entityId     │        │
│                            │ checklist[]  │         │ userId       │        │
│                            │ attachments[]│         │ changes      │        │
│                            │ subtasks[]   │         │ timestamp    │        │
│                            │ watchers[]   │         └──────────────┘        │
│                            │ createdAt    │                                 │
│                            └──────────────┘                                 │
│                                   │                                         │
│                                   ▼                                         │
│                            ┌──────────────┐         ┌──────────────┐        │
│                            │   COMMENTS   │         │NOTIFICATIONS │        │
│                            ├──────────────┤         ├──────────────┤        │
│                            │ _id          │         │ _id          │        │
│                            │ taskId       │         │ userId       │        │
│                            │ userId       │         │ type         │        │
│                            │ content      │         │ title        │        │
│                            │ mentions[]   │────────▶│ message      │        │
│                            │ reactions[]  │         │ link         │        │
│                            │ editHistory[]│         │ read         │        │
│                            │ createdAt    │         │ createdAt    │        │
│                            └──────────────┘         └──────────────┘        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                         RELATIONSHIP LEGEND
    ─────────────────────────────────────────────────────────
    ────────▶  Reference (ObjectId)
    ────────   Embedded Document

    Collections: users, workspaces, projects, boards,
                 tasks, comments, activities, notifications
```

---

## 🚀 What Makes This Course Different

| Course          | Database               | Focus                                  | Complexity |
| --------------- | ---------------------- | -------------------------------------- | :--------: |
| **DevJobs Pro** | PostgreSQL + Drizzle   | Fundamentals, REST APIs, job board     |    ⭐⭐    |
| **StoreFlow**   | PostgreSQL + Prisma    | E-commerce, payments, advanced queries |   ⭐⭐⭐   |
| **TaskForge**   | **MongoDB + Mongoose** | **Real-time, collaboration, NoSQL**    |  ⭐⭐⭐⭐  |

### 🆕 New Concepts Introduced

| Concept                     | Why It Matters                                                      |
| --------------------------- | ------------------------------------------------------------------- |
| **NoSQL Paradigm**          | Different data modeling mindset—essential for modern architectures  |
| **Real-Time Features**      | Live updates power modern collaborative apps (Notion, Figma, Slack) |
| **WebSocket Communication** | Bidirectional communication beyond request-response                 |
| **Pub/Sub with Redis**      | Scale WebSockets across multiple server instances                   |
| **Change Streams**          | Database-level event subscriptions for reactive systems             |
| **Aggregation Framework**   | Powerful analytics without complex JOINs                            |
| **GridFS**                  | Store and stream large files directly in MongoDB                    |

---

## 🎓 Career Impact

After completing the full 3-course series, you'll be ready for:

| Role                     | Why You're Prepared                         |
| ------------------------ | ------------------------------------------- |
| **Full-Stack Developer** | Complete frontend-to-database understanding |
| **Backend Engineer**     | Deep Express, databases, and API expertise  |
| **Junior → Mid-Level**   | Production patterns, testing, deployment    |
| **Startup Engineer**     | Can build entire applications independently |

### 📜 Skills Portfolio

```
┌─────────────────────────────────────────────────────────────────────┐
│                    COMPLETE SKILLS PORTFOLIO                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  From Course 1 (DevJobs Pro):                                       │
│  ✅ Express 5 & TypeScript    ✅ REST API Design                    │
│  ✅ PostgreSQL + Drizzle      ✅ Authentication (JWT)               │
│  ✅ Middleware Patterns       ✅ Error Handling                     │
│                                                                      │
│  From Course 2 (StoreFlow):                                         │
│  ✅ Advanced Prisma           ✅ E-commerce Patterns                │
│  ✅ Payment Integration       ✅ Testing Strategies                 │
│  ✅ Complex Queries           ✅ Production Deployment              │
│                                                                      │
│  From Course 3 (TaskForge):                                         │
│  ✅ MongoDB + Mongoose        ✅ Real-Time (Socket.io)              │
│  ✅ Redis Pub/Sub             ✅ Aggregation Pipelines              │
│  ✅ WebSocket Scaling         ✅ File Storage (GridFS)              │
│  ✅ Activity Logging          ✅ Collaborative Features             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📅 Development Status

| Milestone              |     Status     |
| ---------------------- | :------------: |
| Course outline         |  ✅ Complete   |
| Module structure       |  ✅ Complete   |
| Database schema design |  ✅ Complete   |
| Content development    | 🔄 In Progress |
| Code examples          |   ⏳ Pending   |
| Exercises & challenges |   ⏳ Pending   |
| React frontend         |   ⏳ Pending   |

---

## 🔗 Course Navigation

|                 Previous                  |         Current         |              Next               |
| :---------------------------------------: | :---------------------: | :-----------------------------: |
| [← Course 2: StoreFlow](../02-storeflow/) | **Course 3: TaskForge** | 🎉 You've completed the series! |

---

<div align="center">

## 🌟 This is Where It All Comes Together

After completing DevJobs Pro and StoreFlow, you understand how to build solid backend applications.

**TaskForge takes you further**—into the world of real-time collaboration, NoSQL databases, and features that power the apps millions of people use daily.

This isn't just learning. This is becoming a **professional engineer**.

---

**[← Back to Course Overview](../README.md)**

---

_Part of the [Node.js & Express Professional Course Series](../README.md)_

🚧 **Coming Soon** — The culmination of your Node.js journey awaits 🚧

</div>

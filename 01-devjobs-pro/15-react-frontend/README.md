# Module 15: React Frontend

## 🎯 Module Overview

You've built a rock-solid backend with authentication, authorization, file uploads, email notifications, and comprehensive testing. Now it's time to bring it all together with a **production-ready React frontend**.

This module teaches you to build **three complete dashboards**:

- **Job Seeker Dashboard**: Search jobs, apply, track applications
- **Employer Dashboard**: Post jobs, review applicants, manage listings
- **Admin Panel**: User management, moderation, analytics

By the end, you'll have a **full-stack application** that represents real-world production quality.

---

## 🧠 What You'll Learn

### Technical Skills

- React + TypeScript + Vite project architecture
- Type-safe API client with axios interceptors
- TanStack Query (React Query) for server state management
- React Router v6 for protected routes and role-based access
- Form handling with validation
- Dashboard UI patterns and component architecture
- Data tables with search, sort, filter, pagination
- Modal workflows and bulk operations
- Analytics dashboard with charts

### Architecture Patterns

- Shared types between frontend and backend
- Protected route components
- Role-based UI rendering
- Optimistic updates for better UX
- Loading states and error boundaries
- Token refresh flow

---

## 📚 Lessons

| #   | Lesson                                                                     | Description                                               | Duration |
| --- | -------------------------------------------------------------------------- | --------------------------------------------------------- | -------- |
| 1   | [React Project Setup & API Client](./01-react-project-setup-api-client.md) | Vite setup, TypeScript config, axios client, shared types | 60 min   |
| 2   | [Job Seeker Dashboard](./02-job-seeker-dashboard.md)                       | Browse jobs, apply, track applications, profile           | 90 min   |
| 3   | [Employer Dashboard](./03-employer-dashboard.md)                           | Post jobs, review applicants, manage listings             | 90 min   |
| 4   | [Admin Panel](./04-admin-panel.md)                                         | User management, moderation, analytics                    | 90 min   |

---

## 🏗️ What We're Building

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DevJobs Pro Frontend                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Public Routes                             │   │
│  │  • Landing Page    • Job Listings    • Login/Register       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  Job Seeker Dashboard                        │   │
│  │  • Browse Jobs     • My Applications    • Saved Jobs        │   │
│  │  • Job Details     • Profile Settings   • Resume Upload     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Employer Dashboard                         │   │
│  │  • Post New Job    • My Listings       • Review Applicants  │   │
│  │  • Company Profile • Analytics         • Edit/Delete Jobs   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      Admin Panel                             │   │
│  │  • User Management  • Job Moderation   • Analytics          │   │
│  │  • Audit Logs       • System Settings  • Feature Flags      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Category         | Technology      | Why                                    |
| ---------------- | --------------- | -------------------------------------- |
| **Build Tool**   | Vite            | Lightning-fast HMR, modern ESM support |
| **Framework**    | React 18+       | Component-based, huge ecosystem        |
| **Language**     | TypeScript      | Type safety, better DX                 |
| **Routing**      | React Router v6 | Declarative, nested routes             |
| **Server State** | TanStack Query  | Caching, background refetch, mutations |
| **HTTP Client**  | Axios           | Interceptors, request cancellation     |
| **Styling**      | Tailwind CSS    | Utility-first, rapid development       |
| **Forms**        | React Hook Form | Performant, minimal re-renders         |
| **Validation**   | Zod             | Same validation on frontend & backend  |
| **Charts**       | Recharts        | React-friendly charting library        |

---

## 📦 Prerequisites

Before starting this module, ensure you have:

- ✅ Completed Modules 1-14 (Backend complete)
- ✅ Node.js 18+ installed
- ✅ Backend API running locally
- ✅ Basic React knowledge (hooks, components, props)
- ✅ Understanding of REST APIs

---

## 🎓 Learning Objectives

By completing this module, you will be able to:

1. **Set up a production-ready React project** with Vite and TypeScript
2. **Build a type-safe API client** with axios interceptors and token refresh
3. **Implement protected routes** with role-based access control
4. **Manage server state** with TanStack Query (caching, mutations, optimistic updates)
5. **Build multi-dashboard applications** with different user experiences
6. **Create data-rich interfaces** with tables, filters, pagination, and charts
7. **Handle forms professionally** with validation and error states
8. **Connect frontend to backend** with shared types and environment config

---

## 🚀 Getting Started

```bash
# From the project root, create the frontend
npm create vite@latest devjobs-frontend -- --template react-ts

# Navigate and install dependencies
cd devjobs-frontend
npm install

# Install required packages
npm install axios @tanstack/react-query react-router-dom
npm install @hookform/resolvers zod react-hook-form
npm install recharts date-fns clsx
npm install -D @types/react-router-dom tailwindcss postcss autoprefixer

# Start development server
npm run dev
```

---

## 📁 Final Project Structure

```
devjobs-frontend/
├── src/
│   ├── api/                    # API client and endpoints
│   │   ├── client.ts           # Axios instance with interceptors
│   │   ├── auth.ts             # Auth endpoints
│   │   ├── jobs.ts             # Jobs endpoints
│   │   ├── applications.ts     # Applications endpoints
│   │   └── admin.ts            # Admin endpoints
│   │
│   ├── components/             # Reusable components
│   │   ├── common/             # Buttons, inputs, modals
│   │   ├── job/                # Job-related components
│   │   ├── application/        # Application components
│   │   └── layout/             # Layout components
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.ts          # Auth hook
│   │   ├── useJobs.ts          # Jobs queries/mutations
│   │   └── useApplications.ts  # Applications queries
│   │
│   ├── pages/                  # Page components
│   │   ├── public/             # Public pages
│   │   ├── seeker/             # Job seeker dashboard
│   │   ├── employer/           # Employer dashboard
│   │   └── admin/              # Admin panel
│   │
│   ├── routes/                 # Route configuration
│   │   ├── index.tsx           # Main router
│   │   ├── ProtectedRoute.tsx  # Auth guard
│   │   └── RoleRoute.tsx       # Role-based guard
│   │
│   ├── types/                  # Shared TypeScript types
│   │   ├── user.ts
│   │   ├── job.ts
│   │   └── application.ts
│   │
│   ├── utils/                  # Utility functions
│   ├── context/                # React contexts
│   ├── App.tsx
│   └── main.tsx
│
├── .env                        # Environment variables
├── .env.example
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## ✅ Module Completion Checklist

After completing all lessons, you should have:

- [ ] Vite + React + TypeScript project configured
- [ ] Type-safe API client with auth interceptors
- [ ] Shared types between frontend and backend
- [ ] React Router with protected routes
- [ ] TanStack Query setup with proper caching

**Job Seeker Dashboard:**

- [ ] Job browsing with search and filters
- [ ] Job details page with apply functionality
- [ ] My Applications page with status tracking
- [ ] Saved Jobs functionality
- [ ] Profile page with resume upload

**Employer Dashboard:**

- [ ] Multi-step job posting form
- [ ] My Listings table with actions
- [ ] Applicant review per job
- [ ] Company profile management
- [ ] Basic analytics view

**Admin Panel:**

- [ ] User management table
- [ ] Job moderation queue
- [ ] Analytics dashboard with charts
- [ ] Audit log viewer
- [ ] System settings page

---

## 🔗 Navigation

| Previous                                              | Next                                                  |
| ----------------------------------------------------- | ----------------------------------------------------- |
| [← Module 14: Deployment](../14-deployment/README.md) | [Course 2: StoreFlow →](../../02-storeflow/README.md) |

---

## 💡 Tips for Success

1. **Build incrementally**: Start with the API client, then add features one by one
2. **Test with your backend**: Keep your backend running while developing
3. **Use TypeScript strictly**: Don't skip types, they prevent bugs
4. **Handle all states**: Loading, error, empty, success
5. **Think about UX**: Loading indicators, error messages, confirmations

---

_You've built the backend. Now let's give it a face! 🎨_

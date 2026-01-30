# Module 12: File Uploads and External Services

## 🎯 Module Overview

Welcome to Module 12! This is where your DevJobs Pro application starts handling **real-world file operations**—resume uploads, profile pictures, company logos, and automated email notifications.

File uploads seem simple until they're not. Security vulnerabilities, storage decisions, access control, and integration with cloud services all come into play. By the end of this module, you'll have a production-ready file handling system that's secure, scalable, and maintainable.

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODULE 12 ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│   │  Multer  │───▶│Cloudinary│───▶│ Database │───▶│  Email   │ │
│   │ (Upload) │    │ (Storage)│    │(Metadata)│    │(Notify)  │ │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│        │               │               │               │        │
│        ▼               ▼               ▼               ▼        │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │              DevJobs Pro Features                        │  │
│   │  • Resume uploads (PDF/DOC, 5MB max)                    │  │
│   │  • Profile pictures (optimized, CDN-delivered)          │  │
│   │  • Company logos (branded, multiple sizes)              │  │
│   │  • Email notifications (templated, queued)              │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Learning Objectives

By the end of this module, you will be able to:

### File Upload Fundamentals

- [ ] Understand `multipart/form-data` encoding and why it's needed for files
- [ ] Configure Multer middleware for various upload scenarios
- [ ] Implement file type validation beyond extension checking
- [ ] Handle multiple file uploads with different field names
- [ ] Set up proper file size limits and error handling

### Cloud Storage Integration

- [ ] Design a file storage strategy (local vs cloud)
- [ ] Integrate Cloudinary for image and document storage
- [ ] Implement on-the-fly image transformations
- [ ] Manage file lifecycles (upload, update, delete)
- [ ] Secure file URLs and access patterns

### Email Notifications

- [ ] Set up Nodemailer with various transport options
- [ ] Create reusable email templates with Handlebars
- [ ] Implement email queuing for reliability
- [ ] Handle email failures gracefully
- [ ] Configure development vs production email settings

### Production Integration

- [ ] Build a complete file handling system
- [ ] Implement access control for sensitive files
- [ ] Store and manage file metadata in the database
- [ ] Connect file operations with notification triggers
- [ ] Handle edge cases and cleanup orphaned files

---

## 📖 Lessons

| #   | Lesson                                                                        | Description                              | Time   |
| --- | ----------------------------------------------------------------------------- | ---------------------------------------- | ------ |
| 1   | [Multer File Uploads](./01-multer-file-uploads.md)                            | Handle file uploads securely with Multer | 45 min |
| 2   | [Cloudinary Integration](./02-cloudinary-integration.md)                      | Cloud storage with CDN delivery          | 40 min |
| 3   | [Email Notifications with Nodemailer](./03-email-notifications-nodemailer.md) | Transactional emails and templates       | 45 min |
| 4   | [DevJobs Resume Upload System](./04-devjobs-resume-upload-system.md)          | Complete file handling implementation    | 60 min |

**Total Module Time:** ~3 hours

---

## 🛠️ Prerequisites

Before starting this module, ensure you have:

- [ ] Completed Module 11 (Authentication & Authorization)
- [ ] DevJobs Pro project with user authentication working
- [ ] Understanding of middleware patterns (Module 5)
- [ ] PostgreSQL/MongoDB database set up (Modules 8-9)
- [ ] Node.js 18+ installed

### Required Accounts (Free Tiers Available)

- [ ] [Cloudinary account](https://cloudinary.com/) - For cloud file storage
- [ ] [Mailtrap account](https://mailtrap.io/) - For development email testing
- [ ] Optional: SendGrid/Mailgun for production emails

---

## 📦 New Dependencies

This module introduces several new packages:

```bash
# File uploads
npm install multer
npm install -D @types/multer

# Cloud storage
npm install cloudinary

# Email
npm install nodemailer
npm install -D @types/nodemailer
npm install handlebars

# File validation
npm install file-type
```

---

## 🗂️ Project Structure After This Module

```
src/
├── config/
│   ├── cloudinary.ts      # Cloudinary configuration
│   └── email.ts           # Email transport configuration
├── middleware/
│   └── upload.ts          # Multer configuration
├── services/
│   ├── upload.service.ts  # File upload business logic
│   ├── cloudinary.service.ts  # Cloudinary operations
│   └── email.service.ts   # Email sending logic
├── templates/
│   └── emails/
│       ├── welcome.hbs
│       ├── application-received.hbs
│       ├── status-update.hbs
│       └── password-reset.hbs
├── controllers/
│   └── upload.controller.ts
└── routes/
    └── upload.routes.ts
```

---

## ⚠️ Security Considerations

File uploads are a **major attack vector**. This module emphasizes:

1. **Never trust file extensions** - Validate actual file content
2. **Limit file sizes** - Prevent DoS attacks
3. **Sanitize filenames** - Prevent path traversal
4. **Restrict file types** - Only allow what you need
5. **Use cloud storage** - Keep uploaded files off your server
6. **Control access** - Not all files should be public

---

## 🔗 Navigation

| Previous                                                      | Up                                | Next                                            |
| ------------------------------------------------------------- | --------------------------------- | ----------------------------------------------- |
| [← Module 11: Authentication](../11-authentication/README.md) | [↑ Course Overview](../README.md) | [Module 13: Testing →](../13-testing/README.md) |

---

## 💡 Module Tips

> **Senior Insight:** File handling is where many applications introduce security vulnerabilities or scalability issues. Take time to understand the "why" behind each security measure—they exist because real attacks exploited these patterns.

> **DevJobs Context:** Think about the file flows in a job board:
>
> - Seekers upload resumes (sensitive, access-controlled)
> - Everyone uploads profile pictures (public, optimized)
> - Employers upload company logos (public, multiple sizes)
> - System sends emails at key moments (reliable, tracked)

Let's build this properly! Start with [Lesson 1: Multer File Uploads](./01-multer-file-uploads.md).

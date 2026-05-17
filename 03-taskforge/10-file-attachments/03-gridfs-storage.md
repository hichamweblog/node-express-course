# Lesson 03: GridFS Storage & Streaming

> **Module 10** | **Lesson 3 of 4** | ⏱️ 45 minutes

---

## 📖 Theory: GridFS

```
┌──────────────────────────────────────────────────────────┐
│              GRIDFS — MONGODB FILE STORAGE                │
├──────────────────────────────────────────────────────────┤
│                                                           │
│   MongoDB documents have a 16MB limit.                   │
│   GridFS splits large files into 255KB chunks            │
│   and stores them across two collections:                │
│                                                           │
│   fs.files   → File metadata (name, size, type)          │
│   fs.chunks  → Binary data in 255KB pieces               │
│                                                           │
│   Upload: File → chunks → stored in MongoDB             │
│   Download: chunks → reassembled → streamed to client   │
│                                                           │
│   WHEN TO USE:                                           │
│   ✅ Files stored alongside MongoDB data                  │
│   ✅ No separate file storage service needed              │
│   ❌ Not for high-traffic file serving (use CDN instead) │
│                                                           │
│   OUR APPROACH:                                          │
│   Images → Cloudinary (optimized delivery + CDN)         │
│   Documents → GridFS (stored with the database)          │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ Definition of Done

- [ ] Explain GridFS chunk storage model
- [ ] Upload and download files via GridFS
- [ ] Choose between Cloudinary vs GridFS based on file type

---

<div align="center">

**Module 10** | [Lesson 2](./02-cloudinary-integration.md) → **Lesson 3** → [Lesson 4](./04-taskforge-attachments.md)

</div>

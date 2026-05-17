# Lesson 01: File Uploads with Multer

> **Module 10** | **Lesson 1 of 4** | ⏱️ 45 minutes

---

## 💻 Code: Multer Configuration

```typescript
import multer from 'multer';
import path from 'path';
import { BadRequestError } from '../middleware/errorHandler.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const upload = multer({
  storage: multer.memoryStorage(), // Store in memory for Cloudinary upload
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError(`File type ${file.mimetype} not allowed`));
    }
  },
});

// Route usage:
// router.post('/tasks/:id/attachments', authenticate, upload.single('file'), controller.upload);
```

---

## ✅ Definition of Done

- [ ] Configure Multer with file type/size limits
- [ ] Handle single and multiple file uploads
- [ ] Validate file types and return clear errors

---

<div align="center">

**Module 10** | **Lesson 1** → [Lesson 2](./02-cloudinary-integration.md)

</div>

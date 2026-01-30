# Lesson 1: Multer File Uploads

## 🎣 Hook: Handle File Uploads Securely—It's Trickier Than You Think

"Just accept a file and save it." Sounds simple, right?

That's what a junior developer thought before their server got compromised by someone uploading a "profile_picture.jpg" that was actually an executable script. Or before their disk filled up because someone uploaded a 2GB "resume." Or before the frontend started breaking because filenames contained special characters.

File uploads are one of the most **security-sensitive** features you'll implement. They're also incredibly common—profile pictures, documents, attachments. Every real application needs them.

In this lesson, you'll learn to handle file uploads **properly**: validating content (not just extensions), limiting sizes, customizing storage, and handling multiple files. We'll use Multer, the de facto standard middleware for handling `multipart/form-data` in Express.

By the end, you'll have a rock-solid understanding of how files flow from a client form to your server, and how to accept only what you want.

---

## 📚 Theory: How File Uploads Actually Work

### Why Regular Body Parsers Don't Work

When you send JSON to an Express server, it's just text:

```json
{ "name": "John", "email": "john@example.com" }
```

But files are **binary data**. They can be megabytes in size. You can't just send them as JSON (well, you could base64 encode them, but that increases size by 33% and is inefficient).

Enter `multipart/form-data`—a special encoding that allows mixing text fields and binary files in one request.

### Understanding multipart/form-data

```
┌────────────────────────────────────────────────────────────────┐
│                    HTTP Request Structure                       │
├────────────────────────────────────────────────────────────────┤
│  POST /upload HTTP/1.1                                         │
│  Content-Type: multipart/form-data; boundary=----WebKitForm... │
│                                                                │
│  ------WebKitFormBoundary7MA4YWxkTrZu0gW                       │
│  Content-Disposition: form-data; name="title"                  │
│                                                                │
│  My Document                                                   │
│  ------WebKitFormBoundary7MA4YWxkTrZu0gW                       │
│  Content-Disposition: form-data; name="file"; filename="doc.pdf│
│  Content-Type: application/pdf                                 │
│                                                                │
│  %PDF-1.4 ... (binary content) ...                            │
│  ------WebKitFormBoundary7MA4YWxkTrZu0gW--                     │
└────────────────────────────────────────────────────────────────┘
```

Each "part" is separated by a boundary string. Files include additional headers like filename and content type. This is why `express.json()` middleware can't handle it—it expects a completely different format.

### File Upload Request Flow

```
┌──────────┐    ┌───────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client  │    │  Express  │    │  Multer  │    │ Storage  │    │ Handler  │
│  (Form)  │    │  Server   │    │Middleware│    │ (Memory/ │    │(Route)   │
│          │    │           │    │          │    │  Disk)   │    │          │
└────┬─────┘    └─────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │                │               │               │               │
     │ POST multipart │               │               │               │
     │───────────────▶│               │               │               │
     │                │               │               │               │
     │                │ Parse request │               │               │
     │                │──────────────▶│               │               │
     │                │               │               │               │
     │                │               │ Validate file │               │
     │                │               │ (type, size)  │               │
     │                │               │───────┐       │               │
     │                │               │       │       │               │
     │                │               │◀──────┘       │               │
     │                │               │               │               │
     │                │               │ Store file    │               │
     │                │               │──────────────▶│               │
     │                │               │               │               │
     │                │               │  req.file     │               │
     │                │               │◀──────────────│               │
     │                │               │               │               │
     │                │ Attach file   │               │               │
     │                │ to req object │               │               │
     │                │◀──────────────│               │               │
     │                │               │               │               │
     │                │               │               │ Call next()   │
     │                │               │               │──────────────▶│
     │                │               │               │               │
     │                │               │               │  Process &    │
     │                │               │               │  Respond      │
     │◀──────────────────────────────────────────────────────────────│
     │                                                               │
```

### Multer Storage Options

**Memory Storage** (default)

- Files stored in RAM as `Buffer`
- Fast, good for small files
- Perfect for immediate cloud upload
- Dangerous for large files (memory exhaustion)

**Disk Storage**

- Files saved to filesystem
- Configurable destination and filename
- Good for large files or local processing
- Need to manage cleanup

---

## 💻 Code Examples

### Installation

```bash
npm install multer
npm install -D @types/multer
```

### Basic Single File Upload

**JavaScript:**

```javascript
// middleware/upload.js
const multer = require("multer");

// Memory storage - files available as buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
```

```javascript
// routes/upload.routes.js
const express = require("express");
const upload = require("../middleware/upload");

const router = express.Router();

// Single file upload - field name must match form field
router.post("/avatar", upload.single("avatar"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  console.log("File info:", {
    fieldname: req.file.fieldname, // 'avatar'
    originalname: req.file.originalname, // 'photo.jpg'
    mimetype: req.file.mimetype, // 'image/jpeg'
    size: req.file.size, // 102400 (bytes)
    buffer: req.file.buffer, // <Buffer ...> (memory storage)
  });

  res.json({
    message: "File uploaded successfully",
    filename: req.file.originalname,
    size: req.file.size,
  });
});

module.exports = router;
```

**TypeScript:**

```typescript
// middleware/upload.ts
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// Memory storage - files available as buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;
```

```typescript
// routes/upload.routes.ts
import { Router, Request, Response } from "express";
import upload from "../middleware/upload";

const router = Router();

// Extend Express Request type to include file
interface FileRequest extends Request {
  file?: Express.Multer.File;
}

router.post(
  "/avatar",
  upload.single("avatar"),
  (req: FileRequest, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("File info:", {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer,
    });

    res.json({
      message: "File uploaded successfully",
      filename: req.file.originalname,
      size: req.file.size,
    });
  },
);

export default router;
```

### Disk Storage with Custom Naming

**JavaScript:**

```javascript
// middleware/diskUpload.js
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Different folders for different file types
    const uploadPath = file.mimetype.startsWith("image/")
      ? "uploads/images"
      : "uploads/documents";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomhex.extension
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const diskUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

module.exports = diskUpload;
```

**TypeScript:**

```typescript
// middleware/diskUpload.ts
import multer from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.mimetype.startsWith("image/")
      ? "uploads/images"
      : "uploads/documents";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const diskUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default diskUpload;
```

### File Type Validation (The Right Way)

**Never trust file extensions!** A file named `evil.jpg` could contain PHP code. Always validate the actual content.

**JavaScript:**

```javascript
// middleware/secureUpload.js
const multer = require("multer");

// MIME types we actually accept
const ALLOWED_MIME_TYPES = {
  // Images
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  // Documents
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

const fileFilter = (req, file, cb) => {
  // Check if MIME type is allowed
  if (!ALLOWED_MIME_TYPES[file.mimetype]) {
    const error = new Error(
      `File type ${file.mimetype} is not allowed. Allowed types: ${Object.keys(ALLOWED_MIME_TYPES).join(", ")}`,
    );
    error.code = "INVALID_FILE_TYPE";
    return cb(error, false);
  }

  // Verify extension matches MIME type
  const ext = file.originalname
    .toLowerCase()
    .slice(file.originalname.lastIndexOf("."));
  const allowedExtensions = ALLOWED_MIME_TYPES[file.mimetype];

  if (!allowedExtensions.includes(ext)) {
    const error = new Error(
      `Extension ${ext} doesn't match declared type ${file.mimetype}`,
    );
    error.code = "MIME_EXTENSION_MISMATCH";
    return cb(error, false);
  }

  cb(null, true);
};

const secureUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5, // Max 5 files per request
  },
  fileFilter,
});

module.exports = { secureUpload, ALLOWED_MIME_TYPES };
```

**TypeScript:**

```typescript
// middleware/secureUpload.ts
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// MIME types we actually accept
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

interface MulterError extends Error {
  code?: string;
}

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (!ALLOWED_MIME_TYPES[file.mimetype]) {
    const error: MulterError = new Error(
      `File type ${file.mimetype} is not allowed.`,
    );
    error.code = "INVALID_FILE_TYPE";
    return cb(error as any, false);
  }

  const ext = file.originalname
    .toLowerCase()
    .slice(file.originalname.lastIndexOf("."));
  const allowedExtensions = ALLOWED_MIME_TYPES[file.mimetype];

  if (!allowedExtensions.includes(ext)) {
    const error: MulterError = new Error(
      `Extension ${ext} doesn't match declared type ${file.mimetype}`,
    );
    error.code = "MIME_EXTENSION_MISMATCH";
    return cb(error as any, false);
  }

  cb(null, true);
};

const secureUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },
  fileFilter,
});

export { secureUpload, ALLOWED_MIME_TYPES };
```

### Multiple File Uploads

**JavaScript:**

```javascript
// routes/upload.routes.js
const express = require("express");
const { secureUpload } = require("../middleware/secureUpload");

const router = express.Router();

// Multiple files with same field name
router.post("/gallery", secureUpload.array("photos", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded" });
  }

  const fileInfos = req.files.map((file) => ({
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
  }));

  res.json({
    message: `${req.files.length} files uploaded`,
    files: fileInfos,
  });
});

// Multiple files with different field names
router.post(
  "/application",
  secureUpload.fields([
    { name: "resume", maxCount: 1 },
    { name: "coverLetter", maxCount: 1 },
    { name: "portfolio", maxCount: 5 },
  ]),
  (req, res) => {
    const files = req.files;

    res.json({
      message: "Application files uploaded",
      resume: files.resume?.[0]?.originalname,
      coverLetter: files.coverLetter?.[0]?.originalname,
      portfolioCount: files.portfolio?.length || 0,
    });
  },
);

module.exports = router;
```

**TypeScript:**

```typescript
// routes/upload.routes.ts
import { Router, Request, Response } from "express";
import { secureUpload } from "../middleware/secureUpload";

const router = Router();

interface MulterFiles {
  [fieldname: string]: Express.Multer.File[];
}

router.post(
  "/gallery",
  secureUpload.array("photos", 10),
  (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const fileInfos = files.map((file) => ({
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    }));

    res.json({
      message: `${files.length} files uploaded`,
      files: fileInfos,
    });
  },
);

router.post(
  "/application",
  secureUpload.fields([
    { name: "resume", maxCount: 1 },
    { name: "coverLetter", maxCount: 1 },
    { name: "portfolio", maxCount: 5 },
  ]),
  (req: Request, res: Response) => {
    const files = req.files as MulterFiles;

    res.json({
      message: "Application files uploaded",
      resume: files.resume?.[0]?.originalname,
      coverLetter: files.coverLetter?.[0]?.originalname,
      portfolioCount: files.portfolio?.length || 0,
    });
  },
);

export default router;
```

### Error Handling for Uploads

**JavaScript:**

```javascript
// middleware/uploadErrorHandler.js
const multer = require("multer");

const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    const errorMessages = {
      LIMIT_FILE_SIZE: "File is too large",
      LIMIT_FILE_COUNT: "Too many files",
      LIMIT_UNEXPECTED_FILE: "Unexpected field name",
      LIMIT_PART_COUNT: "Too many parts",
      LIMIT_FIELD_KEY: "Field name too long",
      LIMIT_FIELD_VALUE: "Field value too long",
      LIMIT_FIELD_COUNT: "Too many fields",
    };

    return res.status(400).json({
      error: "Upload error",
      message: errorMessages[err.code] || err.message,
      code: err.code,
      field: err.field,
    });
  }

  // Custom file filter errors
  if (
    err.code === "INVALID_FILE_TYPE" ||
    err.code === "MIME_EXTENSION_MISMATCH"
  ) {
    return res.status(400).json({
      error: "Invalid file",
      message: err.message,
      code: err.code,
    });
  }

  // Pass other errors to global error handler
  next(err);
};

module.exports = uploadErrorHandler;
```

**TypeScript:**

```typescript
// middleware/uploadErrorHandler.ts
import { Request, Response, NextFunction } from "express";
import multer from "multer";

interface UploadError extends Error {
  code?: string;
  field?: string;
}

const errorMessages: Record<string, string> = {
  LIMIT_FILE_SIZE: "File is too large",
  LIMIT_FILE_COUNT: "Too many files",
  LIMIT_UNEXPECTED_FILE: "Unexpected field name",
  LIMIT_PART_COUNT: "Too many parts",
  LIMIT_FIELD_KEY: "Field name too long",
  LIMIT_FIELD_VALUE: "Field value too long",
  LIMIT_FIELD_COUNT: "Too many fields",
};

const uploadErrorHandler = (
  err: UploadError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({
      error: "Upload error",
      message: errorMessages[err.code] || err.message,
      code: err.code,
      field: err.field,
    });
    return;
  }

  if (
    err.code === "INVALID_FILE_TYPE" ||
    err.code === "MIME_EXTENSION_MISMATCH"
  ) {
    res.status(400).json({
      error: "Invalid file",
      message: err.message,
      code: err.code,
    });
    return;
  }

  next(err);
};

export default uploadErrorHandler;
```

---

## 🛠️ Mini-Tutorial: Create Upload Endpoint with Restrictions

Let's build a complete file upload endpoint with proper validation and error handling.

### Step 1: Set Up the Upload Middleware

```typescript
// src/middleware/resumeUpload.ts
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// Only allow specific document types for resumes
const RESUME_MIME_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const resumeFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  // Check MIME type
  if (!RESUME_MIME_TYPES[file.mimetype]) {
    return cb(
      new Error(
        `Invalid file type. Only PDF and Word documents are allowed.`,
      ) as any,
      false,
    );
  }

  // Verify extension
  const ext = file.originalname
    .toLowerCase()
    .slice(file.originalname.lastIndexOf("."));
  if (!RESUME_MIME_TYPES[file.mimetype].includes(ext)) {
    return cb(
      new Error(`File extension doesn't match content type.`) as any,
      false,
    );
  }

  cb(null, true);
};

export const resumeUpload = multer({
  storage: multer.memoryStorage(), // We'll upload to cloud storage
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: resumeFilter,
});

export { MAX_FILE_SIZE, RESUME_MIME_TYPES };
```

### Step 2: Create the Controller

```typescript
// src/controllers/upload.controller.ts
import { Request, Response, NextFunction } from "express";

interface UploadRequest extends Request {
  file?: Express.Multer.File;
}

export const uploadResume = async (
  req: UploadRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: "No file uploaded",
        message: "Please select a resume file (PDF or Word document)",
      });
      return;
    }

    // At this point, the file has passed Multer validation
    const { originalname, mimetype, size, buffer } = req.file;

    // TODO: In Lesson 2, we'll upload this to Cloudinary
    // For now, just return the file info

    console.log(`Resume uploaded: ${originalname} (${size} bytes)`);

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: {
        filename: originalname,
        mimetype,
        size,
        sizeFormatted: `${(size / 1024).toFixed(2)} KB`,
      },
    });
  } catch (error) {
    next(error);
  }
};
```

### Step 3: Set Up Routes with Error Handling

```typescript
// src/routes/upload.routes.ts
import { Router } from "express";
import { resumeUpload } from "../middleware/resumeUpload";
import { uploadResume } from "../controllers/upload.controller";
import uploadErrorHandler from "../middleware/uploadErrorHandler";

const router = Router();

// Resume upload endpoint
router.post(
  "/resume",
  resumeUpload.single("resume"),
  uploadErrorHandler,
  uploadResume,
);

export default router;
```

### Step 4: Test with curl or Postman

```bash
# Test successful upload
curl -X POST http://localhost:3000/api/upload/resume \
  -F "resume=@./my-resume.pdf"

# Test file too large (should fail)
curl -X POST http://localhost:3000/api/upload/resume \
  -F "resume=@./huge-file.pdf"

# Test wrong file type (should fail)
curl -X POST http://localhost:3000/api/upload/resume \
  -F "resume=@./photo.jpg"
```

---

## 🏋️ Practice: DevJobs Pro Resume Upload

Now it's your turn! Implement the resume upload functionality for DevJobs Pro.

### Requirements

1. **Create upload middleware** for resumes:
   - Accept only PDF and DOC/DOCX files
   - Maximum file size: 5MB
   - Single file upload only

2. **Create upload middleware** for profile pictures:
   - Accept only JPEG, PNG, and WebP
   - Maximum file size: 2MB
   - Single file upload only

3. **Implement routes**:
   - `POST /api/users/resume` - Upload resume (job seekers only)
   - `POST /api/users/avatar` - Upload profile picture (all users)

4. **Add proper error handling**:
   - Clear error messages for each failure case
   - Proper HTTP status codes

### Starter Code

```typescript
// src/middleware/devjobsUpload.ts
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";

// TODO: Define RESUME_TYPES and IMAGE_TYPES

// TODO: Create resumeFilter function

// TODO: Create imageFilter function

// TODO: Export resumeUpload and avatarUpload middleware
```

### Expected API Responses

**Success:**

```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "filename": "john-doe-resume.pdf",
    "mimetype": "application/pdf",
    "size": 245678,
    "sizeFormatted": "239.92 KB"
  }
}
```

**Error - Wrong file type:**

```json
{
  "success": false,
  "error": "Invalid file",
  "message": "Invalid file type. Only PDF and Word documents are allowed.",
  "code": "INVALID_FILE_TYPE"
}
```

**Error - File too large:**

```json
{
  "success": false,
  "error": "Upload error",
  "message": "File is too large",
  "code": "LIMIT_FILE_SIZE"
}
```

---

## 🎯 Pro Tips vs Junior Traps

| Pro Tips 🏆                                                                                         | Junior Traps 🪤                                            |
| --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Validate MIME types from the buffer**, not just the `file.mimetype` header (which can be spoofed) | Trusting `file.mimetype` or file extension alone           |
| **Use memory storage** when uploading to cloud services—no need for disk round-trip                 | Using disk storage then reading file back for cloud upload |
| **Generate unique filenames** server-side; never trust client filenames                             | Using `originalname` directly for storage                  |
| **Set reasonable file limits** based on your use case                                               | Using default unlimited sizes                              |
| **Handle errors at the middleware level** with clear messages                                       | Letting Multer errors bubble up as 500 errors              |
| **Clean up disk files** after processing (if using disk storage)                                    | Leaving orphaned files filling up disk                     |
| **Use `upload.none()`** when expecting form data without files                                      | Using `express.urlencoded()` for multipart forms           |
| **Log upload attempts** for security auditing                                                       | No logging of upload attempts                              |

---

## 🔧 5-Minute Debugger

### Problem: "Unexpected field" Error

```
MulterError: Unexpected field
```

**Cause:** The field name in your frontend doesn't match the field name in Multer.

**Solution:**

```javascript
// Your Multer expects:
upload.single("resume"); // expects field named "resume"

// But frontend sends:
// <input type="file" name="file">  ❌ Wrong name

// Fix frontend:
// <input type="file" name="resume">  ✅ Correct name

// Or fix backend:
upload.single("file"); // Match what frontend sends
```

### Problem: File Size Exceeded (Silent Failure)

**Symptom:** Large files are rejected but no error message appears.

**Cause:** Multer throws an error but you're not catching it.

**Solution:**

```javascript
// Add error handling middleware AFTER the upload middleware
router.post(
  "/upload",
  upload.single("file"),
  uploadErrorHandler, // ← Add this
  controller,
);
```

### Problem: Encoding Issues (Garbled Filenames)

**Symptom:** Non-ASCII characters in filenames appear corrupted.

**Cause:** Encoding mismatch between client and server.

**Solution:**

```javascript
// Decode the filename properly
const filename = Buffer.from(file.originalname, "latin1").toString("utf8");

// Or use a library
const sanitize = require("sanitize-filename");
const safeFilename = sanitize(file.originalname);
```

### Problem: File Not Available in Controller

**Symptom:** `req.file` is undefined even though file was sent.

**Causes & Solutions:**

1. **Wrong Content-Type:** Ensure form uses `enctype="multipart/form-data"`
2. **Field name mismatch:** Check field names match exactly
3. **File rejected by filter:** Check if fileFilter is rejecting silently
4. **Request body parsed before Multer:** Don't use `express.urlencoded()` for multipart routes

```javascript
// Debug checklist
router.post(
  "/upload",
  (req, res, next) => {
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Body:", req.body);
    next();
  },
  upload.single("file"),
  (req, res) => {
    console.log("File:", req.file);
    // ...
  },
);
```

---

## ✅ Definition of Done Checklist

Before moving to the next lesson, ensure you can check all these boxes:

- [ ] I understand why `multipart/form-data` is needed for file uploads
- [ ] I can configure Multer with both memory and disk storage
- [ ] I know the difference between `upload.single()`, `upload.array()`, and `upload.fields()`
- [ ] I can validate file types using MIME types (not just extensions)
- [ ] I've implemented proper file size limits
- [ ] I can handle Multer errors with meaningful messages
- [ ] I understand why memory storage is better for cloud uploads
- [ ] My DevJobs Pro has working resume upload (local/memory for now)
- [ ] My DevJobs Pro has working avatar upload (local/memory for now)
- [ ] I've tested error cases: wrong type, too large, missing file

---

## 🔗 Navigation

| Previous                                                      | Up                                  | Next                                                                 |
| ------------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------- |
| [← Module 11: Authentication](../11-authentication/README.md) | [↑ Module 12 Overview](./README.md) | [Lesson 2: Cloudinary Integration →](./02-cloudinary-integration.md) |

---

## 📚 Additional Resources

- [Multer Documentation](https://github.com/expressjs/multer)
- [MIME Type Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
- [file-type Package](https://www.npmjs.com/package/file-type) - For magic byte validation
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

---

> **Senior Insight:** "I've seen production systems compromised because someone validated file extensions instead of content. I've seen servers crash because someone didn't set file size limits. File uploads are a trust boundary—treat every uploaded file as potentially malicious until proven otherwise. Validate everything, limit everything, and never store files where they can be executed."

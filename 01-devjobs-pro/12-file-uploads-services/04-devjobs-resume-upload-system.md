# Lesson 4: DevJobs Pro Resume Upload System

## 🎣 Hook: Putting It All Together—Complete File Handling for DevJobs Pro

You've learned the pieces. Multer for accepting files. Cloudinary for storing them. Nodemailer for notifying users. Now it's time to build something **real**.

A resume isn't just a file—it's a job seeker's career story. How you handle it matters. Who can upload it? Who can view it? When do they get notified? How do you track it? What happens when they update it?

In this lesson, we're not building a toy example. We're building **production-ready file handling** for DevJobs Pro. Resume uploads with access control. Profile pictures with optimization. Company logos with multiple sizes. Notifications when employers view resumes. Proper database storage for file metadata.

This is the kind of system you'll build in a real job. No shortcuts. No "good enough." Just solid, maintainable code that handles the edge cases before they become bugs in production.

Let's put it all together.

---

## 📚 Theory: Complete File Handling Architecture

### DevJobs Pro File System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DEVJOBS PRO FILE ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                        FILE TYPES                                │  │
│   ├─────────────────┬─────────────────┬─────────────────────────────┤  │
│   │    RESUMES      │    AVATARS       │     COMPANY LOGOS          │  │
│   │  ───────────    │   ──────────     │    ─────────────           │  │
│   │  • PDF, DOC     │   • JPG, PNG     │    • JPG, PNG, SVG        │  │
│   │  • 5MB max      │   • 2MB max      │    • 1MB max              │  │
│   │  • Private      │   • Public       │    • Public               │  │
│   │  • Versioned    │   • Single       │    • Single               │  │
│   │                 │                  │                           │  │
│   │  Access:        │   Access:        │    Access:                │  │
│   │  Owner + Apps   │   Everyone       │    Everyone               │  │
│   └─────────────────┴─────────────────┴─────────────────────────────┘  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                        DATA FLOW                                 │  │
│   │                                                                  │  │
│   │   User Upload                                                    │  │
│   │       │                                                          │  │
│   │       ▼                                                          │  │
│   │   ┌───────────┐     ┌───────────┐     ┌───────────┐            │  │
│   │   │  Multer   │────▶│ Cloudinary│────▶│ PostgreSQL│            │  │
│   │   │ Validate  │     │  Upload   │     │  Metadata │            │  │
│   │   └───────────┘     └───────────┘     └───────────┘            │  │
│   │                           │                  │                   │  │
│   │                           ▼                  ▼                   │  │
│   │                     CDN URL             File Record             │  │
│   │                                                                  │  │
│   │   File Request                                                   │  │
│   │       │                                                          │  │
│   │       ▼                                                          │  │
│   │   ┌───────────┐     ┌───────────┐     ┌───────────┐            │  │
│   │   │   Auth    │────▶│  Access   │────▶│   Serve   │            │  │
│   │   │  Check    │     │  Control  │     │  or 403   │            │  │
│   │   └───────────┘     └───────────┘     └───────────┘            │  │
│   │                                              │                   │  │
│   │                                              ▼                   │  │
│   │                                        Notify Owner             │  │
│   │                                        (if resume)              │  │
│   │                                                                  │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Database Schema for Files

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FILE METADATA SCHEMA                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  TABLE: files                                                    │  │
│   ├─────────────────────────────────────────────────────────────────┤  │
│   │  id              UUID PRIMARY KEY                                │  │
│   │  user_id         UUID REFERENCES users(id)                       │  │
│   │  type            ENUM('resume', 'avatar', 'logo')                │  │
│   │  public_id       VARCHAR(255) -- Cloudinary ID                   │  │
│   │  url             VARCHAR(500) -- CDN URL                         │  │
│   │  original_name   VARCHAR(255)                                    │  │
│   │  mime_type       VARCHAR(100)                                    │  │
│   │  size_bytes      INTEGER                                         │  │
│   │  is_active       BOOLEAN DEFAULT true                            │  │
│   │  version         INTEGER DEFAULT 1                               │  │
│   │  created_at      TIMESTAMP                                       │  │
│   │  updated_at      TIMESTAMP                                       │  │
│   │  deleted_at      TIMESTAMP -- Soft delete                        │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │  TABLE: file_access_logs                                         │  │
│   ├─────────────────────────────────────────────────────────────────┤  │
│   │  id              UUID PRIMARY KEY                                │  │
│   │  file_id         UUID REFERENCES files(id)                       │  │
│   │  accessed_by     UUID REFERENCES users(id)                       │  │
│   │  access_type     ENUM('view', 'download')                        │  │
│   │  ip_address      VARCHAR(45)                                     │  │
│   │  user_agent      TEXT                                            │  │
│   │  accessed_at     TIMESTAMP                                       │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Resume Access Control Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    RESUME ACCESS CONTROL DECISION TREE                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Request: GET /api/resumes/:resumeId                                   │
│                                                                         │
│                    Is user authenticated?                               │
│                           │                                             │
│              ┌────────────┴────────────┐                               │
│              │ NO                       │ YES                           │
│              ▼                          ▼                               │
│         ┌─────────┐           Is user the owner?                       │
│         │  401    │                  │                                  │
│         │ Unauth  │     ┌────────────┴────────────┐                    │
│         └─────────┘     │ YES                     │ NO                  │
│                         ▼                         ▼                     │
│                   ┌─────────┐           Is user an employer?           │
│                   │  200    │                  │                        │
│                   │ Return  │     ┌────────────┴────────────┐          │
│                   │ Resume  │     │ NO                      │ YES      │
│                   └─────────┘     ▼                         ▼          │
│                             ┌─────────┐      Has owner applied        │
│                             │  403    │      to employer's job?       │
│                             │ Forbid  │              │                 │
│                             └─────────┘ ┌────────────┴────────────┐   │
│                                         │ NO                      │ YES│
│                                         ▼                         ▼   │
│                                   ┌─────────┐              ┌─────────┐│
│                                   │  403    │              │  200    ││
│                                   │ Forbid  │              │ Return  ││
│                                   └─────────┘              │ Resume  ││
│                                                            └────┬────┘│
│                                                                 │     │
│                                                                 ▼     │
│                                                          Log Access   │
│                                                          Send Email   │
│                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Complete Implementation

### File Type Definitions

```typescript
// src/types/file.types.ts
export type FileType = "resume" | "avatar" | "logo";
export type AccessType = "view" | "download";

export interface FileMetadata {
  id: string;
  userId: string;
  type: FileType;
  publicId: string;
  url: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface FileAccessLog {
  id: string;
  fileId: string;
  accessedBy: string;
  accessType: AccessType;
  ipAddress: string;
  userAgent: string;
  accessedAt: Date;
}

export interface UploadConfig {
  maxSize: number;
  allowedMimeTypes: string[];
  folder: string;
  isPublic: boolean;
}

export const UPLOAD_CONFIGS: Record<FileType, UploadConfig> = {
  resume: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    folder: "devjobs/resumes",
    isPublic: false,
  },
  avatar: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    folder: "devjobs/avatars",
    isPublic: true,
  },
  logo: {
    maxSize: 1 * 1024 * 1024, // 1MB
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ],
    folder: "devjobs/logos",
    isPublic: true,
  },
};
```

### Multer Configuration Factory

```typescript
// src/middleware/upload.middleware.ts
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { FileType, UPLOAD_CONFIGS } from "../types/file.types";

interface MulterError extends Error {
  code?: string;
}

const createFileFilter = (fileType: FileType) => {
  const config = UPLOAD_CONFIGS[fileType];

  return (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ): void => {
    if (!config.allowedMimeTypes.includes(file.mimetype)) {
      const error: MulterError = new Error(
        `Invalid file type. Allowed: ${config.allowedMimeTypes.join(", ")}`,
      );
      error.code = "INVALID_FILE_TYPE";
      return cb(error as any, false);
    }
    cb(null, true);
  };
};

const createUploadMiddleware = (fileType: FileType) => {
  const config = UPLOAD_CONFIGS[fileType];

  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: config.maxSize,
      files: 1,
    },
    fileFilter: createFileFilter(fileType),
  });
};

// Export configured middlewares
export const resumeUpload = createUploadMiddleware("resume");
export const avatarUpload = createUploadMiddleware("avatar");
export const logoUpload = createUploadMiddleware("logo");

// Error handler for upload errors
export const handleUploadError = (
  err: MulterError,
  req: Request,
  res: any,
  next: any,
): void => {
  if (err.code === "LIMIT_FILE_SIZE") {
    res.status(400).json({
      success: false,
      error: "File too large",
      message: "The uploaded file exceeds the maximum size limit",
    });
    return;
  }

  if (err.code === "INVALID_FILE_TYPE") {
    res.status(400).json({
      success: false,
      error: "Invalid file type",
      message: err.message,
    });
    return;
  }

  next(err);
};
```

### File Service (Core Business Logic)

```typescript
// src/services/file.service.ts
import { v4 as uuidv4 } from "uuid";
import {
  FileType,
  FileMetadata,
  FileAccessLog,
  UPLOAD_CONFIGS,
} from "../types/file.types";
import {
  uploadImage,
  uploadDocument,
  deleteFromCloudinary,
  getOptimizedImageUrl,
} from "./cloudinary.service";
import { sendResumeViewedEmail } from "./email.service";
import { db } from "../config/database"; // Your database client

interface UploadResult {
  file: FileMetadata;
  urls?: {
    original: string;
    thumbnail?: string;
    medium?: string;
    large?: string;
  };
}

interface AuthenticatedUser {
  id: string;
  role: "seeker" | "employer" | "admin";
  email: string;
  name: string;
  companyId?: string;
}

// ==================== UPLOAD FUNCTIONS ====================

/**
 * Upload a resume (job seekers only)
 */
export const uploadResume = async (
  userId: string,
  file: Express.Multer.File,
): Promise<UploadResult> => {
  const config = UPLOAD_CONFIGS.resume;

  // Deactivate existing resumes (soft delete, keep for history)
  await db.file.updateMany({
    where: { userId, type: "resume", isActive: true },
    data: { isActive: false, updatedAt: new Date() },
  });

  // Upload to Cloudinary
  const cloudinaryResult = await uploadDocument(file.buffer, {
    folder: `${config.folder}/${userId}`,
    publicId: `resume-v${Date.now()}`,
  });

  // Get the version number
  const versionCount = await db.file.count({
    where: { userId, type: "resume" },
  });

  // Save metadata to database
  const fileRecord = await db.file.create({
    data: {
      id: uuidv4(),
      userId,
      type: "resume",
      publicId: cloudinaryResult.publicId,
      url: cloudinaryResult.url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      isActive: true,
      version: versionCount + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return {
    file: fileRecord,
    urls: {
      original: cloudinaryResult.url,
    },
  };
};

/**
 * Upload avatar (all users)
 */
export const uploadAvatar = async (
  userId: string,
  file: Express.Multer.File,
): Promise<UploadResult> => {
  const config = UPLOAD_CONFIGS.avatar;

  // Get existing avatar to delete from Cloudinary
  const existingAvatar = await db.file.findFirst({
    where: { userId, type: "avatar", isActive: true },
  });

  // Upload to Cloudinary with optimization
  const cloudinaryResult = await uploadImage(file.buffer, {
    folder: `${config.folder}/${userId}`,
    publicId: "avatar", // Overwrites previous
    transformation: [
      { width: 500, height: 500, crop: "fill", gravity: "face" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  });

  // Delete old Cloudinary file if exists and different
  if (existingAvatar && existingAvatar.publicId !== cloudinaryResult.publicId) {
    await deleteFromCloudinary(existingAvatar.publicId, "image").catch(
      console.error,
    );
  }

  // Upsert file record
  const fileRecord = await db.file.upsert({
    where: {
      userId_type_isActive: {
        userId,
        type: "avatar",
        isActive: true,
      },
    },
    create: {
      id: uuidv4(),
      userId,
      type: "avatar",
      publicId: cloudinaryResult.publicId,
      url: cloudinaryResult.url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      isActive: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    update: {
      publicId: cloudinaryResult.publicId,
      url: cloudinaryResult.url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      updatedAt: new Date(),
    },
  });

  return {
    file: fileRecord,
    urls: {
      original: cloudinaryResult.url,
      thumbnail: getOptimizedImageUrl(cloudinaryResult.publicId, {
        width: 50,
        height: 50,
      }),
      medium: getOptimizedImageUrl(cloudinaryResult.publicId, {
        width: 200,
        height: 200,
      }),
      large: getOptimizedImageUrl(cloudinaryResult.publicId, {
        width: 500,
        height: 500,
      }),
    },
  };
};

/**
 * Upload company logo (employers only)
 */
export const uploadCompanyLogo = async (
  userId: string,
  companyId: string,
  file: Express.Multer.File,
): Promise<UploadResult> => {
  const config = UPLOAD_CONFIGS.logo;

  // Get existing logo
  const existingLogo = await db.file.findFirst({
    where: { userId, type: "logo", isActive: true },
  });

  // Upload to Cloudinary (fit, don't crop)
  const cloudinaryResult = await uploadImage(file.buffer, {
    folder: `${config.folder}/${companyId}`,
    publicId: "logo",
    transformation: [
      { width: 400, height: 400, crop: "fit" },
      { quality: "auto" },
      { fetch_format: "auto" },
    ],
  });

  // Clean up old file
  if (existingLogo) {
    await deleteFromCloudinary(existingLogo.publicId, "image").catch(
      console.error,
    );
  }

  const fileRecord = await db.file.upsert({
    where: {
      userId_type_isActive: {
        userId,
        type: "logo",
        isActive: true,
      },
    },
    create: {
      id: uuidv4(),
      userId,
      type: "logo",
      publicId: cloudinaryResult.publicId,
      url: cloudinaryResult.url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      isActive: true,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    update: {
      publicId: cloudinaryResult.publicId,
      url: cloudinaryResult.url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      updatedAt: new Date(),
    },
  });

  // Update company record
  await db.company.update({
    where: { id: companyId },
    data: { logoUrl: cloudinaryResult.url },
  });

  return {
    file: fileRecord,
    urls: {
      original: cloudinaryResult.url,
      thumbnail: getOptimizedImageUrl(cloudinaryResult.publicId, {
        width: 100,
        height: 100,
        crop: "fit",
      }),
    },
  };
};

// ==================== ACCESS FUNCTIONS ====================

/**
 * Get resume with access control
 */
export const getResumeWithAccessControl = async (
  resumeId: string,
  requestingUser: AuthenticatedUser,
  metadata: { ipAddress: string; userAgent: string },
): Promise<FileMetadata | null> => {
  const resume = await db.file.findFirst({
    where: { id: resumeId, type: "resume", isActive: true },
    include: { user: true },
  });

  if (!resume) {
    return null;
  }

  // Owner always has access
  if (resume.userId === requestingUser.id) {
    return resume;
  }

  // Admins always have access
  if (requestingUser.role === "admin") {
    return resume;
  }

  // Employers only if seeker applied to their job
  if (requestingUser.role === "employer") {
    const hasApplication = await db.application.findFirst({
      where: {
        seekerId: resume.userId,
        job: {
          companyId: requestingUser.companyId,
        },
      },
    });

    if (!hasApplication) {
      throw new ForbiddenError(
        "You can only view resumes from candidates who applied to your jobs",
      );
    }

    // Log access and notify owner
    await logFileAccess(resumeId, requestingUser.id, "view", metadata);

    // Send notification email (fire and forget)
    const employer = await db.company.findUnique({
      where: { id: requestingUser.companyId },
    });

    sendResumeViewedEmail(
      resume.user,
      employer?.name || "An employer",
      hasApplication.job.title,
    ).catch(console.error);

    return resume;
  }

  throw new ForbiddenError("You do not have permission to view this resume");
};

/**
 * Log file access
 */
const logFileAccess = async (
  fileId: string,
  accessedBy: string,
  accessType: "view" | "download",
  metadata: { ipAddress: string; userAgent: string },
): Promise<void> => {
  await db.fileAccessLog.create({
    data: {
      id: uuidv4(),
      fileId,
      accessedBy,
      accessType,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      accessedAt: new Date(),
    },
  });
};

// ==================== DELETE FUNCTIONS ====================

/**
 * Delete file (soft delete in DB, hard delete in Cloudinary)
 */
export const deleteFile = async (
  fileId: string,
  userId: string,
): Promise<void> => {
  const file = await db.file.findFirst({
    where: { id: fileId, userId, isActive: true },
  });

  if (!file) {
    throw new NotFoundError("File not found");
  }

  // Soft delete in database
  await db.file.update({
    where: { id: fileId },
    data: {
      isActive: false,
      deletedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Hard delete in Cloudinary (except for resumes - keep for compliance)
  if (file.type !== "resume") {
    const resourceType =
      file.type === "avatar" || file.type === "logo" ? "image" : "raw";
    await deleteFromCloudinary(file.publicId, resourceType).catch(
      console.error,
    );
  }
};

/**
 * Get user's file access history
 */
export const getResumeAccessHistory = async (
  userId: string,
): Promise<FileAccessLog[]> => {
  const userResumes = await db.file.findMany({
    where: { userId, type: "resume" },
    select: { id: true },
  });

  const resumeIds = userResumes.map((r) => r.id);

  return db.fileAccessLog.findMany({
    where: { fileId: { in: resumeIds } },
    include: {
      accessedByUser: {
        select: { id: true, name: true, company: { select: { name: true } } },
      },
    },
    orderBy: { accessedAt: "desc" },
    take: 50,
  });
};
```

### File Controller

```typescript
// src/controllers/file.controller.ts
import { Request, Response, NextFunction } from "express";
import {
  uploadResume,
  uploadAvatar,
  uploadCompanyLogo,
  getResumeWithAccessControl,
  deleteFile,
  getResumeAccessHistory,
} from "../services/file.service";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: "seeker" | "employer" | "admin";
    email: string;
    name: string;
    companyId?: string;
  };
  file?: Express.Multer.File;
}

/**
 * POST /api/users/resume
 * Upload resume (seekers only)
 */
export const handleResumeUpload = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    if (req.user.role !== "seeker") {
      res.status(403).json({
        success: false,
        error: "Only job seekers can upload resumes",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: "No file uploaded" });
      return;
    }

    const result = await uploadResume(req.user.id, req.file);

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      data: {
        id: result.file.id,
        url: result.urls?.original,
        version: result.file.version,
        originalName: result.file.originalName,
        size: result.file.sizeBytes,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/avatar
 * Upload avatar (all users)
 */
export const handleAvatarUpload = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: "No file uploaded" });
      return;
    }

    const result = await uploadAvatar(req.user.id, req.file);

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        id: result.file.id,
        urls: result.urls,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/companies/:companyId/logo
 * Upload company logo (employers only)
 */
export const handleLogoUpload = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    if (req.user.role !== "employer") {
      res.status(403).json({
        success: false,
        error: "Only employers can upload company logos",
      });
      return;
    }

    const { companyId } = req.params;

    // Verify user owns this company
    if (req.user.companyId !== companyId) {
      res.status(403).json({
        success: false,
        error: "You can only upload logos for your own company",
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: "No file uploaded" });
      return;
    }

    const result = await uploadCompanyLogo(req.user.id, companyId, req.file);

    res.status(200).json({
      success: true,
      message: "Company logo uploaded successfully",
      data: {
        id: result.file.id,
        urls: result.urls,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/resumes/:resumeId
 * Get resume with access control
 */
export const handleGetResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { resumeId } = req.params;

    const resume = await getResumeWithAccessControl(resumeId, req.user, {
      ipAddress: req.ip || "unknown",
      userAgent: req.get("User-Agent") || "unknown",
    });

    if (!resume) {
      res.status(404).json({ success: false, error: "Resume not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: resume.id,
        url: resume.url,
        originalName: resume.originalName,
        uploadedAt: resume.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/files/:fileId
 * Delete a file
 */
export const handleDeleteFile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const { fileId } = req.params;

    await deleteFile(fileId, req.user.id);

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/resume-views
 * Get who viewed your resume
 */
export const handleGetResumeViews = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const accessHistory = await getResumeAccessHistory(req.user.id);

    res.status(200).json({
      success: true,
      data: accessHistory.map((log) => ({
        viewedAt: log.accessedAt,
        viewedBy: log.accessedByUser?.name || "Unknown",
        company: log.accessedByUser?.company?.name || "Unknown",
        type: log.accessType,
      })),
    });
  } catch (error) {
    next(error);
  }
};
```

### Routes Configuration

```typescript
// src/routes/file.routes.ts
import { Router } from "express";
import {
  resumeUpload,
  avatarUpload,
  logoUpload,
  handleUploadError,
} from "../middleware/upload.middleware";
import { authenticate, authorize } from "../middleware/auth.middleware";
import {
  handleResumeUpload,
  handleAvatarUpload,
  handleLogoUpload,
  handleGetResume,
  handleDeleteFile,
  handleGetResumeViews,
} from "../controllers/file.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// ==================== UPLOAD ROUTES ====================

// Resume upload (seekers only)
router.post(
  "/users/resume",
  authorize("seeker"),
  resumeUpload.single("resume"),
  handleUploadError,
  handleResumeUpload,
);

// Avatar upload (all users)
router.post(
  "/users/avatar",
  avatarUpload.single("avatar"),
  handleUploadError,
  handleAvatarUpload,
);

// Company logo (employers only)
router.post(
  "/companies/:companyId/logo",
  authorize("employer"),
  logoUpload.single("logo"),
  handleUploadError,
  handleLogoUpload,
);

// ==================== ACCESS ROUTES ====================

// Get resume (with access control)
router.get("/resumes/:resumeId", handleGetResume);

// Get resume view history
router.get("/users/resume-views", authorize("seeker"), handleGetResumeViews);

// ==================== DELETE ROUTES ====================

// Delete file
router.delete("/files/:fileId", handleDeleteFile);

export default router;
```

---

## 🏋️ Practice: Complete DevJobs Pro Implementation

Now implement the complete file handling system. Here's your checklist:

### Implementation Tasks

#### 1. Resume Upload System

- [ ] Create resume upload endpoint for seekers
- [ ] Store file metadata in database
- [ ] Track resume versions
- [ ] Return CDN URL on success

#### 2. Resume Access Control

- [ ] Owner can always access
- [ ] Employers only if applicant applied to their job
- [ ] Log all employer access attempts
- [ ] Send email notification on employer view

#### 3. Profile Pictures

- [ ] All users can upload avatars
- [ ] Auto-optimize images (resize, compress)
- [ ] Return multiple size URLs
- [ ] Delete old image on new upload

#### 4. Company Logos

- [ ] Only employers can upload
- [ ] Validate user owns company
- [ ] Maintain aspect ratio
- [ ] Update company record with new URL

### Test Scenarios

```typescript
// tests/file.integration.test.ts
describe("File Upload System", () => {
  describe("Resume Upload", () => {
    it("should allow seeker to upload PDF resume", async () => {
      // Create seeker user
      // Upload valid PDF
      // Verify database record
      // Verify Cloudinary upload
    });

    it("should reject non-document files for resume", async () => {
      // Try uploading image as resume
      // Expect 400 error
    });

    it("should track resume versions", async () => {
      // Upload first resume (version 1)
      // Upload second resume (version 2)
      // Verify first is inactive, second is active
    });
  });

  describe("Resume Access Control", () => {
    it("should allow owner to access their resume", async () => {
      // Owner requests their own resume
      // Expect 200 with URL
    });

    it("should allow employer to access applicant resume", async () => {
      // Seeker applies to employer job
      // Employer requests seeker resume
      // Expect 200 with URL
      // Verify access logged
      // Verify email sent
    });

    it("should deny employer access to non-applicant resume", async () => {
      // Seeker does NOT apply to employer job
      // Employer requests seeker resume
      // Expect 403 error
    });
  });

  describe("Avatar Upload", () => {
    it("should optimize and return multiple sizes", async () => {
      // Upload image
      // Verify thumbnail, medium, large URLs returned
    });

    it("should delete old avatar on new upload", async () => {
      // Upload first avatar
      // Upload second avatar
      // Verify first avatar deleted from Cloudinary
    });
  });
});
```

### Expected API Responses

**Resume Upload Success:**

```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://res.cloudinary.com/devjobs/raw/upload/v1/devjobs/resumes/user123/resume-v1706634000000",
    "version": 1,
    "originalName": "john-doe-resume.pdf",
    "size": 245678
  }
}
```

**Resume Access (by employer):**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "url": "https://res.cloudinary.com/...",
    "originalName": "john-doe-resume.pdf",
    "uploadedAt": "2026-01-30T10:00:00.000Z"
  }
}
```

**Avatar Upload Success:**

```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "urls": {
      "original": "https://res.cloudinary.com/.../w_500,h_500/.../avatar",
      "thumbnail": "https://res.cloudinary.com/.../w_50,h_50/.../avatar",
      "medium": "https://res.cloudinary.com/.../w_200,h_200/.../avatar",
      "large": "https://res.cloudinary.com/.../w_500,h_500/.../avatar"
    }
  }
}
```

---

## 🎯 Pro Tips vs Junior Traps

| Pro Tips 🏆                                                                  | Junior Traps 🪤                                      |
| ---------------------------------------------------------------------------- | ---------------------------------------------------- |
| **Store public_id AND URL** - URL for quick access, public_id for management | Only storing URL, losing ability to transform/delete |
| **Soft delete files** - Keep metadata for audit trails, especially resumes   | Hard deleting everything, losing history             |
| **Version files** instead of overwriting                                     | Overwriting files, breaking cached links             |
| **Log access to sensitive files**                                            | No audit trail for compliance                        |
| **Notify users when their data is accessed**                                 | Users unaware their resume was viewed                |
| **Validate ownership at service layer**                                      | Only checking in controller, allowing bypasses       |
| **Handle Cloudinary errors gracefully**                                      | Letting cloud errors crash the request               |
| **Use database transactions** for upload + record creation                   | Creating record before upload succeeds               |

---

## 🔧 5-Minute Debugger

### Problem: File Not Found After Upload

**Symptom:** Upload succeeds but file URL returns 404.

**Causes & Solutions:**

1. **Cloudinary processing delay** - For transformations, add `eager` option
2. **Wrong public_id stored** - Log and verify the actual public_id returned
3. **Resource type mismatch** - PDF needs `raw`, images need `image`

```typescript
// Debug: Log full Cloudinary response
const result = await cloudinary.uploader.upload_stream(...);
console.log('Full Cloudinary result:', JSON.stringify(result, null, 2));
```

### Problem: Permission Denied on Download

**Symptom:** 403 error when employer tries to view resume.

**Debug Steps:**

```typescript
// Add logging to access control
const hasApplication = await db.application.findFirst({
  where: {
    seekerId: resume.userId,
    job: { companyId: requestingUser.companyId },
  },
});

console.log("Access check:", {
  resumeOwner: resume.userId,
  requestingUser: requestingUser.id,
  requestingUserRole: requestingUser.role,
  requestingUserCompany: requestingUser.companyId,
  hasApplication: !!hasApplication,
});
```

### Problem: Old Files Not Deleting from Cloudinary

**Symptom:** Storage keeps growing, orphaned files remain.

**Solution:**

```typescript
// Always await delete operations in development
const deleteResult = await deleteFromCloudinary(publicId, resourceType);
console.log("Delete result:", deleteResult);

// In production, handle errors but don't block
deleteFromCloudinary(publicId, resourceType)
  .then((result) => console.log("Deleted:", result))
  .catch((error) => {
    // Log for cleanup job to handle later
    console.error("Delete failed, queued for retry:", error);
    await db.orphanedFile.create({ data: { publicId, resourceType } });
  });
```

### Problem: Email Not Sending on Resume View

**Symptom:** Access logged but no email received.

**Debug:**

```typescript
// Make email send awaitable for debugging
try {
  await sendResumeViewedEmail(owner, company, jobTitle);
  console.log("Email sent successfully");
} catch (error) {
  console.error("Email failed:", error);
  // Check: SMTP credentials? User email valid? Template exists?
}
```

---

## ✅ Definition of Done Checklist

Before moving to the next module, ensure you can check all these boxes:

### Resume System

- [ ] Seekers can upload PDF/DOC resumes (5MB max)
- [ ] Resume metadata stored in database with version tracking
- [ ] Old resumes marked inactive (soft delete) on new upload
- [ ] Resume URLs are secure (not publicly guessable)

### Access Control

- [ ] Owner can always access their resume
- [ ] Employers can only access resumes from applicants
- [ ] Access attempts are logged with IP/user-agent
- [ ] Owner receives email when resume is viewed

### Avatar System

- [ ] All users can upload avatars (2MB max)
- [ ] Images auto-optimized (resize, compress, WebP)
- [ ] Multiple size URLs returned (thumbnail, medium, large)
- [ ] Old avatar deleted from Cloudinary on new upload

### Company Logo System

- [ ] Only employers can upload logos for their company
- [ ] Ownership validated before upload
- [ ] Logo URL updated in company record
- [ ] Aspect ratio maintained (fit, not crop)

### Error Handling

- [ ] Clear error messages for file type violations
- [ ] Clear error messages for file size violations
- [ ] Proper 403 for access control violations
- [ ] Cloudinary errors don't crash the app

### Integration

- [ ] Database and Cloudinary stay in sync
- [ ] Files can be deleted through API
- [ ] Email notifications work for resume views
- [ ] All file operations are logged

---

## 🔗 Navigation

| Previous                                                                  | Up                                  | Next                                            |
| ------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------- |
| [← Lesson 3: Email Notifications](./03-email-notifications-nodemailer.md) | [↑ Module 12 Overview](./README.md) | [Module 13: Testing →](../13-testing/README.md) |

---

## 📚 Additional Resources

- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Multer Documentation](https://github.com/expressjs/multer)
- [Nodemailer](https://nodemailer.com/)
- [OWASP File Upload Security](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)

---

## 🎓 Module Summary

Congratulations! You've completed Module 12 and built a **production-ready file handling system** for DevJobs Pro.

You now know how to:

- **Accept file uploads** securely with Multer
- **Store files in the cloud** with Cloudinary
- **Manage file metadata** in a database
- **Control access** to sensitive files
- **Send notifications** when files are accessed
- **Handle the full lifecycle** of files (upload, access, delete)

This isn't just code—it's the kind of system that runs in real companies, handling real user data. You've learned the patterns, the security considerations, and the production concerns.

**Next up:** Module 13 - Testing. Because code that isn't tested is code that's broken and waiting to be discovered.

---

> **Senior Insight:** "File handling is where I've seen the most production incidents in my career. Disk full. Orphaned files. Unauthorized access. Missing files. Every one of these was a learning experience. The system you've built here handles all of those cases. It's not glamorous code—it's infrastructure code. But it's the infrastructure that lets your users trust you with their career documents. That trust is earned through solid engineering, not clever tricks."

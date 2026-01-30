# Lesson 2: Cloudinary Integration

## 🎣 Hook: Cloud Storage for Files—Scalable and CDN-Backed

You've got file uploads working. Files are sitting in memory, ready to be saved. But where do you put them?

**Option A: Your server's disk.** Works until you scale to multiple servers. Then which server has the file? Works until your disk fills up. Works until you need a CDN for fast global delivery. Works until you need automatic image optimization.

**Option B: Cloud storage.** Your files live on infrastructure designed for this exact purpose—replicated, CDN-delivered, automatically optimized, with transformations on-the-fly.

In this lesson, we'll integrate Cloudinary—a powerful media management platform that handles images and documents. You'll learn to upload files from your Express server, get optimized URLs back, and serve them globally through a CDN. No more disk management headaches.

By the end, your DevJobs Pro users will be uploading profile pictures and company logos to cloud storage with automatic optimization. Let's level up from "it works on my machine" to "it works everywhere."

---

## 📚 Theory: Why Cloud Storage?

### The Scaling Problem with Local Storage

```
┌─────────────────────────────────────────────────────────────────┐
│                LOCAL STORAGE PROBLEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   User uploads file to Server A                                 │
│                                                                 │
│   ┌──────────┐         ┌──────────┐         ┌──────────┐       │
│   │ Server A │         │ Server B │         │ Server C │       │
│   │  📄 file │         │  ❌      │         │  ❌      │       │
│   └──────────┘         └──────────┘         └──────────┘       │
│        ▲                    ▲                    ▲              │
│        │                    │                    │              │
│   ┌────────────────────────────────────────────────────┐       │
│   │              Load Balancer                         │       │
│   └────────────────────────────────────────────────────┘       │
│                           ▲                                    │
│                           │                                    │
│   Next request might go to Server B or C... file not found!    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Cloud Storage Solution

```
┌─────────────────────────────────────────────────────────────────┐
│                 CLOUD STORAGE SOLUTION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐                   │
│   │ Server A │   │ Server B │   │ Server C │                   │
│   └────┬─────┘   └────┬─────┘   └────┬─────┘                   │
│        │              │              │                          │
│        └──────────────┼──────────────┘                          │
│                       │                                         │
│                       ▼                                         │
│              ┌─────────────────┐                                │
│              │   Cloudinary    │                                │
│              │  ┌───────────┐  │                                │
│              │  │  📄 All   │  │                                │
│              │  │  Files    │  │                                │
│              │  └───────────┘  │                                │
│              └────────┬────────┘                                │
│                       │                                         │
│                       ▼                                         │
│              ┌─────────────────┐                                │
│              │  Global CDN     │                                │
│              │  🌍 Fast everywhere                              │
│              └─────────────────┘                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why Cloudinary?

| Feature                        | Benefit                                        |
| ------------------------------ | ---------------------------------------------- |
| **CDN Delivery**               | Files served from edge locations worldwide     |
| **Auto Optimization**          | Images compressed, converted to modern formats |
| **On-the-fly Transformations** | Resize, crop, watermark via URL parameters     |
| **Multiple File Types**        | Images, videos, PDFs, raw files                |
| **Generous Free Tier**         | 25 credits/month (plenty for development)      |
| **Simple API**                 | Easy integration with Node.js                  |

### Cloud Storage Comparison

| Feature              | Cloudinary           | AWS S3             | Google Cloud Storage |
| -------------------- | -------------------- | ------------------ | -------------------- |
| **Best For**         | Media (images/video) | Any file type      | Any file type        |
| **Transformations**  | Built-in, URL-based  | Need Lambda        | Need Cloud Functions |
| **CDN**              | Included             | CloudFront (extra) | Cloud CDN (extra)    |
| **Pricing Model**    | Credits (operations) | Storage + Transfer | Storage + Transfer   |
| **Setup Complexity** | Low                  | Medium             | Medium               |
| **Free Tier**        | 25 credits/month     | 12 months trial    | $300 credit          |

### Complete Upload Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Client  │    │  Multer  │    │ Service  │    │Cloudinary│    │ Database │
│  Form    │    │(Memory)  │    │  Layer   │    │   API    │    │          │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │               │
     │ POST file     │               │               │               │
     │──────────────▶│               │               │               │
     │               │               │               │               │
     │               │ Buffer ready  │               │               │
     │               │──────────────▶│               │               │
     │               │               │               │               │
     │               │               │ Upload buffer │               │
     │               │               │──────────────▶│               │
     │               │               │               │               │
     │               │               │               │─────┐         │
     │               │               │               │     │ Process │
     │               │               │               │     │ & Store │
     │               │               │               │◀────┘         │
     │               │               │               │               │
     │               │               │ Return URL    │               │
     │               │               │◀──────────────│               │
     │               │               │               │               │
     │               │               │ Save metadata │               │
     │               │               │──────────────────────────────▶│
     │               │               │               │               │
     │               │               │     Saved     │               │
     │               │               │◀──────────────────────────────│
     │               │               │               │               │
     │      200 OK + CDN URL         │               │               │
     │◀──────────────────────────────│               │               │
     │               │               │               │               │
```

---

## 💻 Code Examples

### Installation & Setup

```bash
npm install cloudinary
```

**Environment Variables (.env):**

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Cloudinary Configuration

**JavaScript:**

```javascript
// src/config/cloudinary.js
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Always use HTTPS
});

// Verify configuration
const verifyCloudinaryConfig = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connected:", result.status);
    return true;
  } catch (error) {
    console.error("❌ Cloudinary config error:", error.message);
    return false;
  }
};

module.exports = { cloudinary, verifyCloudinaryConfig };
```

**TypeScript:**

```typescript
// src/config/cloudinary.ts
import { v2 as cloudinary, ConfigOptions } from "cloudinary";

// Cloudinary automatically picks up CLOUDINARY_URL if set
// Otherwise, configure explicitly
const cloudinaryConfig: ConfigOptions = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
};

cloudinary.config(cloudinaryConfig);

export const verifyCloudinaryConfig = async (): Promise<boolean> => {
  try {
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connected:", result.status);
    return true;
  } catch (error) {
    console.error("❌ Cloudinary config error:", (error as Error).message);
    return false;
  }
};

export { cloudinary };
```

### Basic Upload from Buffer

**JavaScript:**

```javascript
// src/services/cloudinary.service.js
const { cloudinary } = require("../config/cloudinary");

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from Multer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: "auto", // Auto-detect: image, video, raw
      folder: options.folder || "devjobs",
      public_id: options.publicId,
      ...options,
    };

    // Use upload_stream for buffer uploads
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      },
    );

    // Write buffer to stream
    uploadStream.end(buffer);
  });
};

/**
 * Upload an image with automatic optimization
 */
const uploadImage = async (buffer, options = {}) => {
  const result = await uploadToCloudinary(buffer, {
    resource_type: "image",
    folder: options.folder || "devjobs/images",
    transformation: [
      { quality: "auto" }, // Auto quality optimization
      { fetch_format: "auto" }, // Convert to WebP if supported
    ],
    ...options,
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    size: result.bytes,
  };
};

/**
 * Upload a document (PDF, DOC, etc.)
 */
const uploadDocument = async (buffer, options = {}) => {
  const result = await uploadToCloudinary(buffer, {
    resource_type: "raw", // For non-media files
    folder: options.folder || "devjobs/documents",
    ...options,
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    format: result.format,
    size: result.bytes,
  };
};

module.exports = {
  uploadToCloudinary,
  uploadImage,
  uploadDocument,
};
```

**TypeScript:**

```typescript
// src/services/cloudinary.service.ts
import { cloudinary } from "../config/cloudinary";
import { UploadApiResponse, UploadApiOptions } from "cloudinary";

interface UploadOptions extends Partial<UploadApiOptions> {
  folder?: string;
  publicId?: string;
}

interface ImageUploadResult {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

interface DocumentUploadResult {
  publicId: string;
  url: string;
  format: string;
  size: number;
}

/**
 * Upload a file buffer to Cloudinary
 */
const uploadToCloudinary = (
  buffer: Buffer,
  options: UploadOptions = {},
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = {
      resource_type: "auto",
      folder: options.folder || "devjobs",
      public_id: options.publicId,
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        }
      },
    );

    uploadStream.end(buffer);
  });
};

/**
 * Upload an image with automatic optimization
 */
export const uploadImage = async (
  buffer: Buffer,
  options: UploadOptions = {},
): Promise<ImageUploadResult> => {
  const result = await uploadToCloudinary(buffer, {
    resource_type: "image",
    folder: options.folder || "devjobs/images",
    transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
    ...options,
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width!,
    height: result.height!,
    format: result.format!,
    size: result.bytes!,
  };
};

/**
 * Upload a document (PDF, DOC, etc.)
 */
export const uploadDocument = async (
  buffer: Buffer,
  options: UploadOptions = {},
): Promise<DocumentUploadResult> => {
  const result = await uploadToCloudinary(buffer, {
    resource_type: "raw",
    folder: options.folder || "devjobs/documents",
    ...options,
  });

  return {
    publicId: result.public_id,
    url: result.secure_url,
    format: result.format!,
    size: result.bytes!,
  };
};

export { uploadToCloudinary };
```

### Image Transformations

**JavaScript:**

```javascript
// src/services/cloudinary.service.js (continued)

/**
 * Get optimized URL with transformations
 */
const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width,
    height,
    crop = "fill",
    gravity = "auto", // Smart cropping (face detection, etc.)
    quality = "auto",
    format = "auto",
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      {
        width,
        height,
        crop,
        gravity,
        quality,
        fetch_format: format,
      },
    ],
    secure: true,
  });
};

/**
 * Generate multiple sizes for responsive images
 */
const getResponsiveUrls = (publicId) => {
  const sizes = [
    { name: "thumbnail", width: 100, height: 100 },
    { name: "small", width: 200, height: 200 },
    { name: "medium", width: 400, height: 400 },
    { name: "large", width: 800, height: 800 },
  ];

  return sizes.reduce((urls, { name, width, height }) => {
    urls[name] = getOptimizedImageUrl(publicId, {
      width,
      height,
      crop: "fill",
      gravity: "face", // Focus on face if present
    });
    return urls;
  }, {});
};

// Example output:
// {
//   thumbnail: 'https://res.cloudinary.com/.../w_100,h_100,c_fill,g_face/...',
//   small: 'https://res.cloudinary.com/.../w_200,h_200,c_fill,g_face/...',
//   medium: 'https://res.cloudinary.com/.../w_400,h_400,c_fill,g_face/...',
//   large: 'https://res.cloudinary.com/.../w_800,h_800,c_fill,g_face/...',
// }

module.exports = {
  // ... previous exports
  getOptimizedImageUrl,
  getResponsiveUrls,
};
```

**TypeScript:**

```typescript
// src/services/cloudinary.service.ts (continued)

interface TransformationOptions {
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
  quality?: string | number;
  format?: string;
}

interface ResponsiveUrls {
  thumbnail: string;
  small: string;
  medium: string;
  large: string;
}

/**
 * Get optimized URL with transformations
 */
export const getOptimizedImageUrl = (
  publicId: string,
  options: TransformationOptions = {},
): string => {
  const {
    width,
    height,
    crop = "fill",
    gravity = "auto",
    quality = "auto",
    format = "auto",
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      {
        width,
        height,
        crop,
        gravity,
        quality,
        fetch_format: format,
      },
    ],
    secure: true,
  });
};

/**
 * Generate multiple sizes for responsive images
 */
export const getResponsiveUrls = (publicId: string): ResponsiveUrls => {
  const sizes = [
    { name: "thumbnail" as const, width: 100, height: 100 },
    { name: "small" as const, width: 200, height: 200 },
    { name: "medium" as const, width: 400, height: 400 },
    { name: "large" as const, width: 800, height: 800 },
  ];

  return sizes.reduce((urls, { name, width, height }) => {
    urls[name] = getOptimizedImageUrl(publicId, {
      width,
      height,
      crop: "fill",
      gravity: "face",
    });
    return urls;
  }, {} as ResponsiveUrls);
};
```

### Delete Files

**JavaScript:**

```javascript
// src/services/cloudinary.service.js (continued)

/**
 * Delete a file from Cloudinary
 */
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return {
      success: result.result === "ok",
      result: result.result,
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

/**
 * Delete multiple files
 */
const deleteMultipleFromCloudinary = async (
  publicIds,
  resourceType = "image",
) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });

    return {
      deleted: result.deleted,
      failed: Object.keys(result.deleted).filter(
        (key) => result.deleted[key] !== "deleted",
      ),
    };
  } catch (error) {
    console.error("Cloudinary bulk delete error:", error);
    throw error;
  }
};

module.exports = {
  // ... previous exports
  deleteFromCloudinary,
  deleteMultipleFromCloudinary,
};
```

**TypeScript:**

```typescript
// src/services/cloudinary.service.ts (continued)

interface DeleteResult {
  success: boolean;
  result: string;
}

interface BulkDeleteResult {
  deleted: Record<string, string>;
  failed: string[];
}

/**
 * Delete a file from Cloudinary
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "video" | "raw" = "image",
): Promise<DeleteResult> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return {
      success: result.result === "ok",
      result: result.result,
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

/**
 * Delete multiple files
 */
export const deleteMultipleFromCloudinary = async (
  publicIds: string[],
  resourceType: "image" | "video" | "raw" = "image",
): Promise<BulkDeleteResult> => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType,
    });

    return {
      deleted: result.deleted,
      failed: Object.keys(result.deleted).filter(
        (key) => result.deleted[key] !== "deleted",
      ),
    };
  } catch (error) {
    console.error("Cloudinary bulk delete error:", error);
    throw error;
  }
};
```

### Complete Upload Controller

**TypeScript:**

```typescript
// src/controllers/upload.controller.ts
import { Request, Response, NextFunction } from "express";
import {
  uploadImage,
  uploadDocument,
  deleteFromCloudinary,
} from "../services/cloudinary.service";

interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
  file?: Express.Multer.File;
}

/**
 * Upload profile picture
 */
export const uploadAvatar = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
      });
      return;
    }

    // Upload to Cloudinary with user-specific folder
    const result = await uploadImage(req.file.buffer, {
      folder: `devjobs/avatars/${req.user.id}`,
      publicId: "avatar", // Overwrites previous avatar
      transformation: [
        { width: 500, height: 500, crop: "fill", gravity: "face" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    // TODO: Update user record in database with new avatar URL
    // await updateUser(req.user.id, { avatarUrl: result.url });

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        url: result.url,
        publicId: result.publicId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload company logo (employers only)
 */
export const uploadCompanyLogo = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
      return;
    }

    if (!req.user || req.user.role !== "employer") {
      res.status(403).json({
        success: false,
        error: "Only employers can upload company logos",
      });
      return;
    }

    const result = await uploadImage(req.file.buffer, {
      folder: `devjobs/logos/${req.user.id}`,
      publicId: "logo",
      transformation: [
        { width: 400, height: 400, crop: "fit" }, // Fit, don't crop
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Company logo uploaded successfully",
      data: {
        url: result.url,
        publicId: result.publicId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete uploaded file
 */
export const deleteUpload = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { publicId, resourceType = "image" } = req.body;

    if (!publicId) {
      res.status(400).json({
        success: false,
        error: "Public ID is required",
      });
      return;
    }

    // Security: Verify user owns this file
    // The publicId should contain the user's ID
    if (!publicId.includes(req.user?.id)) {
      res.status(403).json({
        success: false,
        error: "You can only delete your own files",
      });
      return;
    }

    const result = await deleteFromCloudinary(publicId, resourceType);

    res.status(200).json({
      success: true,
      message: result.success ? "File deleted" : "File not found",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 🛠️ Mini-Tutorial: Create Cloudinary Upload Service with Error Handling

Let's build a robust Cloudinary service with comprehensive error handling.

### Step 1: Enhanced Error Handling

```typescript
// src/errors/cloudinary.errors.ts
export class CloudinaryError extends Error {
  public code: string;
  public statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = "CloudinaryError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const CLOUDINARY_ERRORS = {
  UPLOAD_FAILED: "CLOUDINARY_UPLOAD_FAILED",
  DELETE_FAILED: "CLOUDINARY_DELETE_FAILED",
  INVALID_FILE: "CLOUDINARY_INVALID_FILE",
  CONFIG_ERROR: "CLOUDINARY_CONFIG_ERROR",
  TIMEOUT: "CLOUDINARY_TIMEOUT",
} as const;
```

### Step 2: Robust Upload Service

```typescript
// src/services/cloudinary.service.ts (enhanced)
import { cloudinary } from "../config/cloudinary";
import {
  CloudinaryError,
  CLOUDINARY_ERRORS,
} from "../errors/cloudinary.errors";
import { UploadApiResponse, UploadApiOptions } from "cloudinary";

const UPLOAD_TIMEOUT = 30000; // 30 seconds

interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  size: number;
  width?: number;
  height?: number;
  resourceType: string;
}

/**
 * Upload with timeout and comprehensive error handling
 */
export const uploadWithRetry = async (
  buffer: Buffer,
  options: UploadApiOptions = {},
  maxRetries: number = 2,
): Promise<UploadResult> => {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await uploadWithTimeout(buffer, options, UPLOAD_TIMEOUT);
      return formatUploadResult(result);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Upload attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await sleep(1000 * attempt);
      }
    }
  }

  // All retries failed
  throw new CloudinaryError(
    `Upload failed after ${maxRetries} attempts: ${lastError?.message}`,
    CLOUDINARY_ERRORS.UPLOAD_FAILED,
    500,
  );
};

/**
 * Upload with timeout
 */
const uploadWithTimeout = (
  buffer: Buffer,
  options: UploadApiOptions,
  timeout: number,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(
        new CloudinaryError("Upload timed out", CLOUDINARY_ERRORS.TIMEOUT, 408),
      );
    }, timeout);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        ...options,
      },
      (error, result) => {
        clearTimeout(timeoutId);

        if (error) {
          reject(
            new CloudinaryError(
              error.message,
              CLOUDINARY_ERRORS.UPLOAD_FAILED,
              error.http_code || 500,
            ),
          );
        } else if (result) {
          resolve(result);
        }
      },
    );

    uploadStream.end(buffer);
  });
};

/**
 * Format upload result consistently
 */
const formatUploadResult = (result: UploadApiResponse): UploadResult => ({
  publicId: result.public_id,
  url: result.url,
  secureUrl: result.secure_url,
  format: result.format,
  size: result.bytes,
  width: result.width,
  height: result.height,
  resourceType: result.resource_type,
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
```

### Step 3: Routes with Validation

```typescript
// src/routes/upload.routes.ts
import { Router } from "express";
import { avatarUpload, documentUpload } from "../middleware/upload";
import {
  uploadAvatar,
  uploadCompanyLogo,
} from "../controllers/upload.controller";
import { authenticate, authorize } from "../middleware/auth";
import uploadErrorHandler from "../middleware/uploadErrorHandler";

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// Avatar upload (all authenticated users)
router.post(
  "/avatar",
  avatarUpload.single("avatar"),
  uploadErrorHandler,
  uploadAvatar,
);

// Company logo (employers only)
router.post(
  "/company-logo",
  authorize("employer"),
  avatarUpload.single("logo"),
  uploadErrorHandler,
  uploadCompanyLogo,
);

export default router;
```

---

## 🏋️ Practice: DevJobs Pro Profile Pictures and Company Logos

Implement image uploads for DevJobs Pro with Cloudinary.

### Requirements

1. **Profile Picture Upload** (`POST /api/users/avatar`)
   - All authenticated users can upload
   - Accept JPEG, PNG, WebP (max 2MB)
   - Store in folder: `devjobs/avatars/{userId}`
   - Auto-optimize and crop to face
   - Return multiple sizes (thumbnail, medium, large)

2. **Company Logo Upload** (`POST /api/companies/logo`)
   - Only employers can upload
   - Accept JPEG, PNG, SVG, WebP (max 1MB)
   - Store in folder: `devjobs/logos/{companyId}`
   - Maintain aspect ratio (fit, don't crop)
   - Return original and thumbnail URLs

3. **Update Database**
   - Store the Cloudinary public_id (not just URL)
   - Delete old image when uploading new one

### Starter Code

```typescript
// src/services/profile.service.ts
import {
  uploadImage,
  deleteFromCloudinary,
  getResponsiveUrls,
} from "./cloudinary.service";

interface AvatarUploadResult {
  publicId: string;
  urls: {
    thumbnail: string;
    medium: string;
    large: string;
  };
}

export const uploadUserAvatar = async (
  userId: string,
  buffer: Buffer,
  existingPublicId?: string,
): Promise<AvatarUploadResult> => {
  // TODO: Delete existing avatar if exists
  // TODO: Upload new avatar to Cloudinary
  // TODO: Generate responsive URLs
  // TODO: Return result
};
```

### Expected Response

```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "publicId": "devjobs/avatars/user123/avatar",
    "urls": {
      "thumbnail": "https://res.cloudinary.com/.../w_100,h_100/avatar",
      "medium": "https://res.cloudinary.com/.../w_300,h_300/avatar",
      "large": "https://res.cloudinary.com/.../w_500,h_500/avatar"
    }
  }
}
```

---

## 🎯 Pro Tips vs Junior Traps

| Pro Tips 🏆                                                                 | Junior Traps 🪤                                       |
| --------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Use upload presets** for client-side uploads to limit what clients can do | Exposing API secret in frontend code                  |
| **Store public_id in database**, not URLs—you can generate URLs anytime     | Only storing URLs, losing ability to delete/transform |
| **Transform on-the-fly** for most cases—no need to store multiple sizes     | Generating and storing 10 sizes upfront               |
| **Use `resource_type: 'raw'`** for non-media files (PDFs, docs)             | Using wrong resource type and getting errors          |
| **Set folder structure** that includes user ID for easy cleanup             | Flat folder structure making cleanup impossible       |
| **Delete old files** when updating—Cloudinary charges for storage           | Accumulating orphaned files forever                   |
| **Use eager transformations** for thumbnails needed immediately             | Waiting for on-the-fly transformation on first view   |
| **Implement cleanup jobs** for orphaned files                               | Assuming files clean themselves up                    |

---

## 🔧 5-Minute Debugger

### Problem: "Invalid API credentials"

```
Error: Invalid Signature
```

**Causes:**

1. Wrong API key/secret
2. Copying credentials with leading/trailing spaces
3. Using wrong environment variables

**Solution:**

```javascript
// Debug configuration
console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log(
  "API Key:",
  process.env.CLOUDINARY_API_KEY?.substring(0, 5) + "...",
);
console.log("API Secret set:", !!process.env.CLOUDINARY_API_SECRET);

// Verify by pinging
const result = await cloudinary.api.ping();
console.log("Ping result:", result);
```

### Problem: Upload Timeout

**Symptom:** Large files fail without error message.

**Causes:**

1. File too large
2. Slow network
3. No timeout handling

**Solution:**

```javascript
// Add timeout and size limits
const upload = cloudinary.uploader.upload_stream(
  {
    timeout: 60000, // 60 seconds
    chunk_size: 6000000, // 6MB chunks
  },
  callback,
);
```

### Problem: Transformation Errors

```
Error: Transformation not allowed
```

**Cause:** Upload preset restrictions or unsupported transformation.

**Solution:**

```javascript
// Check what's allowed in your preset
const preset = await cloudinary.api.upload_preset("your_preset");
console.log("Preset settings:", preset);

// Or use explicit transformations
const result = await cloudinary.uploader.upload(file, {
  transformation: [
    { width: 500, height: 500, crop: "limit" }, // 'limit' is always safe
  ],
});
```

### Problem: Files Not Deleting

**Symptom:** `destroy()` returns success but file still exists.

**Cause:** Wrong resource_type or public_id format.

**Solution:**

```javascript
// Check what you actually uploaded
const resources = await cloudinary.api.resources({
  prefix: "devjobs/avatars/",
  resource_type: "image",
});
console.log("Actual resources:", resources);

// Delete with correct resource_type
await cloudinary.uploader.destroy("folder/filename", {
  resource_type: "image", // or 'raw' for documents
  invalidate: true, // Clear CDN cache
});
```

---

## ✅ Definition of Done Checklist

Before moving to the next lesson, ensure you can check all these boxes:

- [ ] Cloudinary account created and credentials set in `.env`
- [ ] Configuration module verifies connection on startup
- [ ] I can upload images from Multer buffer to Cloudinary
- [ ] I can upload documents (PDFs) as `raw` resource type
- [ ] I understand `public_id` vs URL and why to store `public_id`
- [ ] I can generate transformed URLs (resize, crop, format)
- [ ] I can delete files from Cloudinary
- [ ] Error handling covers timeout, invalid credentials, upload failures
- [ ] DevJobs Pro has working avatar upload to Cloudinary
- [ ] DevJobs Pro has working company logo upload
- [ ] Old files are deleted when new ones are uploaded

---

## 🔗 Navigation

| Previous                                                       | Up                                  | Next                                                                      |
| -------------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| [← Lesson 1: Multer File Uploads](./01-multer-file-uploads.md) | [↑ Module 12 Overview](./README.md) | [Lesson 3: Email Notifications →](./03-email-notifications-nodemailer.md) |

---

## 📚 Additional Resources

- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Image Transformations Reference](https://cloudinary.com/documentation/image_transformations)
- [Upload Presets Guide](https://cloudinary.com/documentation/upload_presets)
- [Cloudinary Pricing](https://cloudinary.com/pricing) - Understand credit usage

---

> **Senior Insight:** "I've worked on systems that stored everything locally. When we scaled to multiple servers, we had to migrate millions of files to cloud storage—a painful, risky process. Start with cloud storage from day one. The few cents per GB is nothing compared to the engineering time you'll save. And always store the `public_id`, not just the URL—URLs can change, but with the `public_id`, you can always regenerate them."

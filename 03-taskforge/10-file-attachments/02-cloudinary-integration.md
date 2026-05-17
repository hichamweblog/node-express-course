# Lesson 02: Cloudinary Integration

> **Module 10** | **Lesson 2 of 4** | ⏱️ 50 minutes

---

## 💻 Code: Cloudinary Upload Service

```typescript
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export const uploadToCloudinary = async (
  buffer: Buffer,
  folder: string = 'taskforge',
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result!.secure_url, publicId: result!.public_id });
      },
    );
    stream.end(buffer);
  });
};
```

---

## ✅ Definition of Done

- [ ] Upload files to Cloudinary from memory buffer
- [ ] Generate optimized image URLs
- [ ] Delete files from Cloudinary on attachment removal

---

<div align="center">

**Module 10** | [Lesson 1](./01-file-upload-multer.md) → **Lesson 2** → [Lesson 3](./03-gridfs-storage.md)

</div>

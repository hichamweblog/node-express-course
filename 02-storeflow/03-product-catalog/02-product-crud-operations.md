# Lesson 02: Product CRUD Operations

> **Module 03: Product Catalog** | **Lesson 2 of 4** | ⏱️ 50 minutes

---

## 🎯 Hook: CRUD That Handles Real Business Rules

Product CRUD in e-commerce isn't simple create/read/update/delete. You need slug uniqueness, SKU validation, price history, and soft deletes (never truly delete a product that has orders).

---

## 📖 Theory: The Controller → Service → Prisma Pattern

```
Request → Controller → Service → Prisma → PostgreSQL
            │              │
            │              └─ Business logic, validation
            └─ Parse input, format response
```

## 💻 Code: Product Controller

```typescript
// src/controllers/product.controller.ts
import type { Request, Response } from 'express';
import { productService } from '../services/product.service.js';

export const productController = {
  async getAll(req: Request, res: Response) {
    const { page, limit, category, search, minPrice, maxPrice, sortBy } = req.query;
    const result = await productService.getAll({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      category: category as string,
      search: search as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: sortBy as string,
    });

    res.json({ success: true, data: result });
  },

  async getBySlug(req: Request, res: Response) {
    const product = await productService.getBySlug(req.params.slug);
    res.json({ success: true, data: product });
  },

  async create(req: Request, res: Response) {
    const product = await productService.create(req.body);
    res.status(201).json({ success: true, data: product });
  },

  async update(req: Request, res: Response) {
    const product = await productService.update(req.params.id, req.body);
    res.json({ success: true, data: product });
  },

  async remove(req: Request, res: Response) {
    await productService.softDelete(req.params.id);
    res.json({ success: true, message: 'Product deactivated' });
  },
};
```

## Product Routes

```typescript
// src/routes/product.routes.ts
import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema.js';

const router = Router();

// Public routes
router.get('/', productController.getAll);
router.get('/:slug', productController.getBySlug);

// Admin-only routes
router.post('/', authenticate, authorize('ADMIN'), validateBody(createProductSchema), productController.create);
router.put('/:id', authenticate, authorize('ADMIN'), validateBody(updateProductSchema), productController.update);
router.delete('/:id', authenticate, authorize('ADMIN'), productController.remove);

export default router;
```

---

## ✅ Definition of Done

- [ ] Build full product CRUD with controller/service pattern
- [ ] Implement soft delete (set isActive = false, never hard delete)
- [ ] Add Zod validation schemas for create/update
- [ ] Protect admin routes with authentication + authorization

---

<div align="center">

**Module 03** | [Lesson 1](./01-product-schema-design.md) → **Lesson 2** → [Lesson 3](./03-search-filtering-pagination.md) → [Lesson 4](./04-storeflow-product-catalog.md)

</div>

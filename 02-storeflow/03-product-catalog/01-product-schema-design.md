# Lesson 01: Product Schema Design & Categories

> **Module 03: Product Catalog** | **Lesson 1 of 4** | ⏱️ 45 minutes

---

## 🎯 Hook: The Catalog Is Your Revenue Engine

Every dollar your store earns flows through the product catalog. A poorly designed catalog means slow searches, wrong prices, and lost sales. A well-designed catalog scales to millions of products.

---

## 📖 Theory: E-Commerce Catalog Architecture

### Category Hierarchies

```
┌─────────────────────────────────────────────────────────┐
│              CATEGORY HIERARCHY (Self-Referencing)       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Electronics (parentId: null)                          │
│   ├── Computers (parentId: electronics.id)              │
│   │   ├── Laptops                                       │
│   │   └── Desktops                                      │
│   ├── Phones                                            │
│   │   ├── Smartphones                                   │
│   │   └── Accessories                                   │
│   └── Audio                                             │
│                                                          │
│   Clothing (parentId: null)                             │
│   ├── Men's                                             │
│   ├── Women's                                           │
│   └── Kids                                              │
│                                                          │
│   Prisma Model:                                         │
│   model Category {                                      │
│     parentId  String?    @map("parent_id")              │
│     parent    Category?  @relation("CategoryHierarchy", │
│                          fields: [parentId],            │
│                          references: [id])              │
│     children  Category[] @relation("CategoryHierarchy") │
│   }                                                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Product Pricing Strategy

```
┌────────────────────────────────────────────────────────┐
│            PRICING MODEL (in cents)                     │
├────────────────────────────────────────────────────────┤
│                                                         │
│   price: 2999          → Current price: $29.99         │
│   comparePrice: 3999   → Was: $39.99 (strikethrough)  │
│                                                         │
│   Display:  $29.99  ̶$̶3̶9̶.̶9̶9̶  (25% off!)               │
│                                                         │
│   Calculation in TypeScript:                           │
│   const displayPrice = (price / 100).toFixed(2);      │
│   const discount = comparePrice                        │
│     ? Math.round((1 - price / comparePrice) * 100)    │
│     : null;                                            │
│                                                         │
│   ⚠️ NEVER use floating point for money!               │
│   0.1 + 0.2 = 0.30000000000000004  ← WRONG            │
│   10 + 20 = 30  ← CORRECT (cents)                     │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Slug Generation

```typescript
// Slugs create clean, SEO-friendly URLs
// "Wireless Gaming Mouse Pro" → "wireless-gaming-mouse-pro"

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // Remove special chars
    .replace(/\s+/g, '-')       // Spaces → hyphens
    .replace(/-+/g, '-');       // Collapse multiple hyphens
};
```

---

## 💻 Code Example: Product Service

```typescript
// src/services/product.service.ts
import { prisma } from '../db/prisma.js';
import { NotFoundError } from '../middleware/errorHandler.js';

export const productService = {
  async getAll(params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }) {
    const { page = 1, limit = 20, category, search, minPrice, maxPrice, sortBy = 'createdAt' } = params;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(category && { category: { slug: category } }),
      ...(search && { name: { contains: search, mode: 'insensitive' as const } }),
      ...(minPrice && { price: { gte: minPrice } }),
      ...(maxPrice && { price: { lte: maxPrice } }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { name: true, slug: true } } },
        orderBy: { [sortBy]: 'desc' },
        take: limit,
        skip,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!product) throw new NotFoundError('Product not found');
    return product;
  },
};
```

---

## ✅ Definition of Done

- [ ] Explain self-referencing relations for category hierarchies
- [ ] Store prices as integers (cents) and explain why
- [ ] Generate URL-safe slugs from product names
- [ ] Write a product query with filtering and pagination

---

<div align="center">

**Module 03** | Lesson 1 of 4 → [Lesson 2](./02-product-crud-operations.md)

</div>

# Lesson 04: 🛠️ PROJECT — Product Catalog API

> **Module 03: Product Catalog** | **Lesson 4 of 4** | ⏱️ 60 minutes

---

## 🎯 What We're Building

Complete the product catalog with all layers wired together:

1. Zod validation schemas
2. Product service with full CRUD + search
3. Category service
4. Routes mounted in the main app
5. Test with curl/Postman

## Implementation Checklist

```
src/
├── schemas/
│   └── product.schema.ts     ← Zod validation
├── services/
│   ├── product.service.ts     ← Business logic
│   └── category.service.ts    ← Category logic
├── controllers/
│   ├── product.controller.ts  ← Request handlers
│   └── category.controller.ts
└── routes/
    ├── product.routes.ts      ← Endpoints
    └── category.routes.ts
```

## API Endpoints to Implement

```
GET    /api/v1/products              → List with search/filter/pagination
GET    /api/v1/products/:slug        → Single product by slug
POST   /api/v1/products              → Create (admin only)
PUT    /api/v1/products/:id          → Update (admin only)
DELETE /api/v1/products/:id          → Soft delete (admin only)

GET    /api/v1/categories            → List all categories
GET    /api/v1/categories/:slug      → Category with products
POST   /api/v1/categories            → Create (admin only)
```

## Test Commands

```bash
# List products
curl http://localhost:3001/api/v1/products

# Search products
curl "http://localhost:3001/api/v1/products?search=mouse&minPrice=1000"

# Get by slug
curl http://localhost:3001/api/v1/products/wireless-mouse

# Create product (admin)
curl -X POST http://localhost:3001/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"New Product","price":1999,"sku":"NP-001","categoryId":"..."}'
```

---

## ✅ Definition of Done

- [ ] All product endpoints working
- [ ] Search and filtering operational
- [ ] Pagination returns correct metadata
- [ ] Admin routes protected with auth + RBAC
- [ ] Category hierarchy queryable

---

<div align="center">

**🎉 Module 03 Complete! → [Start Module 04: Shopping Cart](../04-shopping-cart/README.md)**

</div>

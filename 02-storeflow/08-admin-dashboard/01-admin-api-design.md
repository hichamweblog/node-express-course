# Lesson 01: Admin API Design & Authorization

> **Module 08: Admin Dashboard** | **Lesson 1 of 4** | ⏱️ 40 minutes

---

## 🎯 Hook: The Admin Is a Separate Application

Admin APIs need different authorization, different rate limits, and different response formats than customer-facing APIs.

---

## 📖 Theory: Admin API Architecture

```
┌─────────────────────────────────────────────────────────┐
│              ADMIN API DESIGN PATTERN                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   /api/v1/products        ← Customer: read-only         │
│   /api/v1/admin/products  ← Admin: full CRUD             │
│                                                          │
│   MIDDLEWARE CHAIN:                                      │
│   Request                                                │
│     → authenticate()     (valid JWT?)                   │
│     → authorize('ADMIN') (role = ADMIN?)                │
│     → validateBody()     (valid input?)                 │
│     → controller         (handle request)               │
│                                                          │
│   ADMIN ROUTES:                                          │
│   ┌─────────────────────────────────────────────────┐   │
│   │  GET    /admin/dashboard     → Sales summary    │   │
│   │  GET    /admin/products      → All products     │   │
│   │  POST   /admin/products      → Create product   │   │
│   │  PUT    /admin/products/:id  → Update product   │   │
│   │  DELETE /admin/products/:id  → Delete product   │   │
│   │  GET    /admin/orders        → All orders       │   │
│   │  PATCH  /admin/orders/:id    → Update status    │   │
│   │  GET    /admin/customers     → Customer list    │   │
│   │  GET    /admin/inventory     → Stock levels     │   │
│   └─────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 💻 Code: Admin Router

```typescript
// src/routes/admin.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication + ADMIN role
router.use(authenticate);
router.use(authorize('ADMIN'));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Product management
router.get('/products', adminController.getProducts);
router.post('/products', validateBody(createProductSchema), adminController.createProduct);
router.put('/products/:id', validateBody(updateProductSchema), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Order management
router.get('/orders', adminController.getOrders);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

// Customer management
router.get('/customers', adminController.getCustomers);

export default router;
```

---

## ✅ Definition of Done

- [ ] Separate admin routes from customer routes
- [ ] Apply authentication + authorization middleware to all admin routes
- [ ] Design admin dashboard summary endpoint

---

<div align="center">

**Module 08** | **Lesson 1** → [Lesson 2](./02-product-management-api.md)

</div>

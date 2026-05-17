# Lesson 04: 🛠️ PROJECT — Shopping Cart System

> **Module 04: Shopping Cart** | **Lesson 4 of 4** | ⏱️ 60 minutes

---

## 🎯 What We're Building

Wire up the complete cart system with routes and controllers.

## API Endpoints

```
GET    /api/v1/cart              → Get current cart (auth optional)
POST   /api/v1/cart/items        → Add item to cart
PATCH  /api/v1/cart/items/:id    → Update item quantity
DELETE /api/v1/cart/items/:id    → Remove item from cart
DELETE /api/v1/cart              → Clear entire cart
POST   /api/v1/cart/merge        → Merge guest cart on login
```

## Cart Routes

```typescript
import { Router } from 'express';
import { cartController } from '../controllers/cart.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, cartController.getCart);
router.post('/items', optionalAuth, cartController.addItem);
router.patch('/items/:productId', optionalAuth, cartController.updateItem);
router.delete('/items/:productId', optionalAuth, cartController.removeItem);
router.delete('/', optionalAuth, cartController.clearCart);
router.post('/merge', authenticate, cartController.mergeCart);

export default router;
```

## Test Commands

```bash
# Get cart as guest (pass session ID in header)
curl -H "X-Session-Id: test-session-123" http://localhost:3001/api/v1/cart

# Add item as guest
curl -X POST http://localhost:3001/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: test-session-123" \
  -d '{"productId":"...", "quantity": 2}'

# Add item as authenticated user
curl -X POST http://localhost:3001/api/v1/cart/items \
  -H "Authorization: Bearer TOKEN" \
  -d '{"productId":"...", "quantity": 1}'
```

---

## ✅ Definition of Done

- [ ] Guest cart works with session ID
- [ ] Authenticated cart works with JWT
- [ ] Cart merge works on login
- [ ] All CRUD operations functional

---

<div align="center">

**🎉 Module 04 Complete! → [Start Module 05: Checkout & Orders](../05-checkout-orders/README.md)**

</div>

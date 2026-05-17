# Lesson 01: Cart Architecture Patterns

> **Module 04: Shopping Cart** | **Lesson 1 of 4** | ⏱️ 40 minutes

---

## 🎯 Hook: The Cart Problem Nobody Warns You About

"Just add items to a cart" sounds simple. Then reality hits: Should anonymous users have carts? What happens when they log in? What if two tabs add the same item? What if the product's price changes while it's in the cart?

---

## 📖 Theory: Cart Storage Strategies

```
┌─────────────────────────────────────────────────────────────┐
│                CART STORAGE STRATEGIES                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DATABASE CART (Our approach)                            │
│  ────────────────────────────                               │
│  Cart stored in PostgreSQL with relations                   │
│  ✅ Persists across devices                                 │
│  ✅ Survives server restarts                                │
│  ✅ Easy to query for analytics                             │
│  ❌ Database load for every cart action                     │
│                                                              │
│  2. SESSION/COOKIE CART                                     │
│  ──────────────────────                                     │
│  Cart stored in browser cookie or server session            │
│  ✅ No database queries                                     │
│  ✅ Works for anonymous users                               │
│  ❌ Lost when cookies clear                                 │
│  ❌ Limited by cookie size (4KB)                            │
│                                                              │
│  3. REDIS CART                                              │
│  ────────────                                               │
│  Cart stored in Redis with TTL expiration                   │
│  ✅ Extremely fast reads/writes                             │
│  ✅ Auto-expiration for abandoned carts                     │
│  ❌ Data loss if Redis restarts without persistence         │
│                                                              │
│  HYBRID (Production pattern):                               │
│  Guest cart → Database (with sessionId)                     │
│  User cart → Database (with userId)                         │
│  On login → Merge guest cart into user cart                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Cart Merging Flow

```
Guest adds items         User logs in          After merge
────────────────         ──────────────        ───────────
Cart (sessionId: abc)    User has existing     User cart:
├── Mouse (qty: 1)       cart with:            ├── Mouse (qty: 1)  ← from guest
├── Keyboard (qty: 1)    ├── Monitor (qty: 1)  ├── Keyboard (qty: 2) ← qty added!
                         ├── Keyboard (qty: 1)  ├── Monitor (qty: 1) ← kept
                                                
                         Guest cart: DELETED
```

---

## ✅ Definition of Done

- [ ] Compare database, session, and Redis cart strategies
- [ ] Explain the guest-to-user cart merge flow
- [ ] Design the cart schema with sessionId AND userId support

---

<div align="center">

**Module 04** | **Lesson 1** → [Lesson 2](./02-guest-vs-user-carts.md)

</div>

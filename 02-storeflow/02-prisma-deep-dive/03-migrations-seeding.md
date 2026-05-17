# Lesson 03: Migrations & Database Seeding

> **Module 02: Prisma Deep Dive** | **Lesson 3 of 4** | ⏱️ 40 minutes

---

## 🎯 Hook: Your Database Has a Git History

Every schema change needs a migration — a versioned SQL file that evolves your database safely. Prisma Migrate auto-generates these migrations from your schema changes.

```
Schema v1                Schema v2                Schema v3
(Users)          →       (Users + Products)  →    (+ stock column)
    │                        │                        │
    ▼                        ▼                        ▼
Migration 001            Migration 002            Migration 003
CREATE TABLE users       CREATE TABLE products    ALTER TABLE products
                                                  ADD COLUMN stock INT
```

---

## 📖 Theory: Migration Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                 PRISMA MIGRATION WORKFLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   DEVELOPMENT                     PRODUCTION                    │
│   ───────────                     ──────────                    │
│                                                                  │
│   1. Edit schema.prisma           1. Pull latest code           │
│          │                               │                      │
│          ▼                               ▼                      │
│   2. prisma migrate dev           2. prisma migrate deploy      │
│      ├── Generates SQL                ├── Applies pending       │
│      ├── Applies to dev DB            │   migrations only       │
│      ├── Regenerates client           └── No new SQL generated  │
│      └── Resets if needed                                       │
│          │                                                      │
│          ▼                                                      │
│   3. Commit migration files                                     │
│      to version control                                         │
│                                                                  │
│   prisma/migrations/                                            │
│   ├── 20240101000000_init/                                      │
│   │   └── migration.sql                                         │
│   ├── 20240115000000_add_products/                              │
│   │   └── migration.sql                                         │
│   └── migration_lock.toml                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Commands

```bash
# Development — Generate + apply migration
npx prisma migrate dev --name add_product_images

# Production — Apply pending migrations only  
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

---

## 💻 Database Seeding

Seeding fills your database with sample data for development and testing.

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@storeflow.dev' },
    update: {},
    create: {
      email: 'admin@storeflow.dev',
      name: 'Admin User',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Gadgets and devices',
    },
  });

  // Create products
  await prisma.product.upsert({
    where: { sku: 'WM-001' },
    update: {},
    create: {
      name: 'Wireless Mouse',
      slug: 'wireless-mouse',
      description: 'Ergonomic wireless mouse with USB receiver',
      price: 2999,  // $29.99
      sku: 'WM-001',
      stock: 150,
      images: ['/images/mouse-1.jpg', '/images/mouse-2.jpg'],
      categoryId: electronics.id,
    },
  });

  console.log('✅ Seeding complete');
  console.log({ admin: admin.email });
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

Run with: `npx prisma db seed`

> **💡 Why `upsert`?** Running seed twice won't create duplicates. It's idempotent — safe to run repeatedly.

---

## 💡 Pro Tips

| Aspect | 🟢 Pro Tip | 🔴 Junior Trap |
|--------|-----------|----------------|
| **Migration names** | Use descriptive: `add_product_sku_column` | Using `migration1` — impossible to trace |
| **Production** | Always use `migrate deploy`, never `migrate dev` | Running `migrate dev` in production — it can reset data! |
| **Seed idempotency** | Use `upsert` so seeds can run multiple times safely | Using `create` — fails on second run with duplicate errors |

---

## ✅ Definition of Done

- [ ] Create and apply a Prisma migration
- [ ] Write an idempotent seed file with `upsert`
- [ ] Explain the difference between `migrate dev` and `migrate deploy`
- [ ] View your data in Prisma Studio

---

<div align="center">

**Module 02** | Lesson 3 of 4

[Lesson 1](./01-prisma-schema-language.md) → [Lesson 2](./02-relations-and-queries.md) → **Lesson 3** → [Lesson 4](./04-storeflow-database-setup.md)

</div>

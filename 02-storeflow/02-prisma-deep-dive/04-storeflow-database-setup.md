# Lesson 04: 🛠️ PROJECT — StoreFlow Database Setup

> **Module 02: Prisma Deep Dive** | **Lesson 4 of 4** | ⏱️ 60 minutes

---

## 🎯 What We're Building

In this hands-on lesson, you'll:

1. Run the initial migration to create all tables
2. Write a comprehensive seed file with categories, products, and test users
3. Verify everything works with Prisma Studio
4. Write your first Prisma queries in a test script

---

## 📖 Step-by-Step

### Step 1: Apply the Migration

```bash
# Start your database
docker compose up -d

# Create and apply the initial migration
npx prisma migrate dev --name init

# Verify tables were created
npx prisma studio
```

### Step 2: Create the Seed File

Create `prisma/seed.ts` with comprehensive e-commerce test data:

```typescript
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {
  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@storeflow.dev' },
    update: {},
    create: {
      email: 'admin@storeflow.dev',
      name: 'Store Admin',
      passwordHash: password,
      role: Role.ADMIN,
      addresses: {
        create: {
          street: '100 Admin Lane',
          city: 'Portland',
          state: 'OR',
          zipCode: '97201',
          isDefault: true,
        },
      },
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Jane Customer',
      passwordHash: password,
      role: Role.CUSTOMER,
      addresses: {
        create: {
          street: '456 Oak Ave',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          isDefault: true,
        },
      },
    },
  });

  return { admin, customer };
}

async function seedCategories() {
  const categories = [
    { name: 'Electronics', slug: 'electronics', description: 'Gadgets and tech' },
    { name: 'Clothing', slug: 'clothing', description: 'Apparel and accessories' },
    { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Home essentials' },
  ];

  const results = [];
  for (const cat of categories) {
    const result = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    results.push(result);
  }
  return results;
}

async function seedProducts(categoryIds: string[]) {
  const products = [
    { name: 'Wireless Mouse', slug: 'wireless-mouse', price: 2999, sku: 'WM-001', stock: 150, categoryId: categoryIds[0] },
    { name: 'Mechanical Keyboard', slug: 'mechanical-keyboard', price: 8999, sku: 'MK-001', stock: 75, categoryId: categoryIds[0] },
    { name: 'USB-C Hub', slug: 'usb-c-hub', price: 4499, sku: 'UH-001', stock: 200, categoryId: categoryIds[0] },
    { name: 'Cotton T-Shirt', slug: 'cotton-tshirt', price: 1999, sku: 'CT-001', stock: 500, categoryId: categoryIds[1] },
    { name: 'Denim Jeans', slug: 'denim-jeans', price: 5999, sku: 'DJ-001', stock: 300, categoryId: categoryIds[1] },
    { name: 'Coffee Maker', slug: 'coffee-maker', price: 7999, sku: 'CM-001', stock: 60, categoryId: categoryIds[2] },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: { ...product, images: [], description: `High-quality ${product.name.toLowerCase()}` },
    });
  }
}

async function main() {
  console.log('🌱 Seeding StoreFlow database...\n');

  const users = await seedUsers();
  console.log(`✅ Users: ${users.admin.email}, ${users.customer.email}`);

  const categories = await seedCategories();
  console.log(`✅ Categories: ${categories.map(c => c.name).join(', ')}`);

  await seedProducts(categories.map(c => c.id));
  console.log('✅ Products seeded');

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

### Step 3: Run the Seed

```bash
npx prisma db seed
```

### Step 4: Verify with Prisma Studio

```bash
npx prisma studio
# Opens at http://localhost:5555
# Browse your users, products, categories
```

---

## ✅ Definition of Done

- [ ] All 8 tables created in PostgreSQL
- [ ] Seed file populates users, categories, and products
- [ ] Prisma Studio shows all seeded data
- [ ] Running seed twice doesn't create duplicates

---

<div align="center">

**🎉 Module 02 Complete! → [Start Module 03: Product Catalog](../03-product-catalog/README.md)**

</div>

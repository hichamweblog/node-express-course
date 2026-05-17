# Lesson 04: 🛠️ PROJECT — MongoDB Setup

> **Module 02** | **Lesson 4 of 4** | ⏱️ 55 minutes

---

## 🎯 Hands-on: Connect TaskForge to MongoDB

1. Verify Docker MongoDB is running
2. Connect with mongosh and explore
3. Create collections manually
4. Insert test documents
5. Practice query operators

```bash
# Connect to your Docker MongoDB
mongosh "mongodb://taskforge:taskforge_dev_password@localhost:27017/taskforge?authSource=admin"

# List databases
show dbs

# Use TaskForge database
use taskforge

# Insert a test workspace
db.workspaces.insertOne({
  name: "Engineering Team",
  slug: "engineering-team",
  members: [{ userId: ObjectId(), role: "owner", joinedAt: new Date() }],
  settings: { defaultProjectView: "board" },
  createdAt: new Date()
})

# Verify
db.workspaces.find().pretty()
```

---

## ✅ Definition of Done

- [ ] MongoDB running and accessible
- [ ] CRUD operations tested in mongosh
- [ ] Compass connected and browsing collections

---

<div align="center">

**🎉 Module 02 Complete! → [Start Module 03: Mongoose Advanced](../03-mongoose-advanced/README.md)**

</div>
